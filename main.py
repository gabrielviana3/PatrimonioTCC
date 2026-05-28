"""
ISEPAM – Sistema de Gestão de Patrimônio
Backend FastAPI + MySQL (aiomysql via databases)
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from typing import Optional
import databases
import os, bcrypt, jwt, datetime

# ============================================================
# CONFIG
# ============================================================
$env:DATABASE_URL = "mysql+aiomysql://root:1234@localhost:3306/isepam"
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:1234@localhost:3306/isepam")
JWT_SECRET   = os.getenv("JWT_SECRET", "troque-este-segredo-em-producao")
JWT_EXP_H    = 8

database = databases.Database(DATABASE_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = FastAPI(title="ISEPAM Patrimônio API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ============================================================
# HELPERS – JWT & Autenticação
# ============================================================
def criar_token(usuario_id: int, nome: str, role: str) -> str:
    payload = {
        "sub": str(usuario_id),
        "nome": nome,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXP_H),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")


def exigir_admin(usuario: dict = Depends(verificar_token)) -> dict:
    if usuario["role"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem realizar esta ação.")
    return usuario


async def registrar_atividade(texto: str, usuario_id: int | None = None):
    await database.execute(
        "INSERT INTO atividades (texto, usuario_id) VALUES (:texto, :uid)",
        {"texto": texto, "uid": usuario_id},
    )


# ============================================================
# AUTH
# ============================================================
from pydantic import BaseModel, EmailStr


class LoginIn(BaseModel):
    email: EmailStr
    senha: str


class CadastroIn(BaseModel):
    nome:  str
    email: EmailStr
    senha: str
    role:  str = "tecnico"


@app.post("/auth/login")
async def login(body: LoginIn):
    row = await database.fetch_one(
        "SELECT id, nome, email, senha_hash, role FROM usuarios WHERE email = :email AND ativo = TRUE",
        {"email": body.email.lower()},
    )
    if not row or not bcrypt.checkpw(body.senha.encode(), row["senha_hash"].encode()):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos!")

    token = criar_token(row["id"], row["nome"], row["role"])
    return {"token": token, "nome": row["nome"], "role": row["role"]}


@app.post("/auth/cadastro", status_code=201)
async def cadastro(body: CadastroIn):
    existe = await database.fetch_one(
        "SELECT id FROM usuarios WHERE email = :email", {"email": body.email.lower()}
    )
    if existe:
        raise HTTPException(status_code=409, detail="Este email já está cadastrado!")

    if body.role not in ("admin", "tecnico"):
        raise HTTPException(status_code=400, detail="Role inválida.")

    hash_senha = bcrypt.hashpw(body.senha.encode(), bcrypt.gensalt()).decode()
    await database.execute(
        "INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (:nome, :email, :hash, :role)",
        {"nome": body.nome, "email": body.email.lower(), "hash": hash_senha, "role": body.role},
    )
    return {"mensagem": "Conta criada com sucesso!"}


# ============================================================
# BENS
# ============================================================
class BemIn(BaseModel):
    numero:       str
    nome:         str
    valor:        float
    nota_fiscal:  Optional[str] = None
    fornecedor:   Optional[str] = None
    localizacao:  Optional[str] = "Não informada"
    estado:       Optional[str] = "Novo"
    categoria:    Optional[str] = "Mobiliário"
    data_entrada: Optional[str] = None


class BemUpdate(BaseModel):
    estado:      Optional[str] = None
    localizacao: Optional[str] = None


@app.get("/bens")
async def listar_bens(
    numero: Optional[str] = None,
    nome:   Optional[str] = None,
    u: dict = Depends(verificar_token),
):
    query = "SELECT * FROM bens WHERE TRUE"
    params = {}
    if numero:
        query += " AND numero LIKE :numero"   # MySQL: LIKE já é case-insensitive
        params["numero"] = f"%{numero}%"
    if nome:
        query += " AND nome LIKE :nome"
        params["nome"] = f"%{nome}%"
    query += " ORDER BY cadastrado_em DESC"
    rows = await database.fetch_all(query, params)
    return [dict(r) for r in rows]


@app.post("/bens", status_code=201)
async def cadastrar_bem(body: BemIn, u: dict = Depends(verificar_token)):
    existe = await database.fetch_one("SELECT id FROM bens WHERE numero = :n", {"n": body.numero})
    if existe:
        raise HTTPException(status_code=409, detail="Já existe um bem com este número de patrimônio!")

    await database.execute(
        """INSERT INTO bens (numero, nome, valor, nota_fiscal, fornecedor,
                             localizacao, estado, categoria, data_entrada)
           VALUES (:numero, :nome, :valor, :nf, :forn, :loc, :estado, :cat, :data)""",
        {
            "numero": body.numero, "nome": body.nome, "valor": body.valor,
            "nf": body.nota_fiscal, "forn": body.fornecedor,
            "loc": body.localizacao, "estado": body.estado, "cat": body.categoria,
            "data": body.data_entrada or datetime.date.today().isoformat(),
        },
    )
    await registrar_atividade(
        f"Cadastrado: {body.nome} (Nº {body.numero}) - R$ {body.valor:.2f}", int(u["sub"])
    )
    return {"mensagem": "Bem cadastrado com sucesso!"}


@app.patch("/bens/{numero}")
async def atualizar_bem(numero: str, body: BemUpdate, u: dict = Depends(verificar_token)):
    bem = await database.fetch_one("SELECT * FROM bens WHERE numero = :n", {"n": numero})
    if not bem:
        raise HTTPException(status_code=404, detail="Bem não encontrado.")

    updates, params = [], {"n": numero}
    if body.estado and body.estado != bem["estado"]:
        updates.append("estado = :estado")
        params["estado"] = body.estado
        await registrar_atividade(f"Estado alterado: {bem['nome']} → {body.estado}", int(u["sub"]))
    if body.localizacao and body.localizacao != bem["localizacao"]:
        updates.append("localizacao = :loc")
        params["loc"] = body.localizacao
        await registrar_atividade(f"Localização alterada: {bem['nome']} → {body.localizacao}", int(u["sub"]))

    if not updates:
        return {"mensagem": "Nenhuma alteração realizada."}

    await database.execute(f"UPDATE bens SET {', '.join(updates)} WHERE numero = :n", params)
    return {"mensagem": "Alterações salvas com sucesso!"}


@app.delete("/bens/{numero}", status_code=200)
async def excluir_bem(numero: str, u: dict = Depends(exigir_admin)):
    bem = await database.fetch_one("SELECT * FROM bens WHERE numero = :n", {"n": numero})
    if not bem:
        raise HTTPException(status_code=404, detail="Bem não encontrado.")

    await database.execute("DELETE FROM bens WHERE numero = :n", {"n": numero})
    await registrar_atividade(f"Bem excluído: Nº {numero}", int(u["sub"]))
    return {"mensagem": "Bem excluído com sucesso!"}


# ============================================================
# CHAMADOS
# ============================================================
class ChamadoIn(BaseModel):
    patrimonio:  str
    descricao:   str
    foto_base64: Optional[str] = None


class FeedbackIn(BaseModel):
    feedback:        str
    novo_status:     str
    novo_estado_bem: Optional[str] = None


@app.get("/chamados")
async def listar_chamados(
    status: Optional[str] = None,
    u: dict = Depends(verificar_token),
):
    query = "SELECT * FROM chamados WHERE TRUE"
    params = {}
    if status and status != "todos":
        query += " AND status = :status"
        params["status"] = status
    query += " ORDER BY data_abertura DESC"
    rows = await database.fetch_all(query, params)
    return [dict(r) for r in rows]


@app.post("/chamados", status_code=201)
async def abrir_chamado(body: ChamadoIn, u: dict = Depends(verificar_token)):
    bem = await database.fetch_one("SELECT * FROM bens WHERE numero = :n", {"n": body.patrimonio})
    if not bem:
        raise HTTPException(status_code=404, detail="Número de patrimônio não cadastrado no inventário!")

    ja_aberto = await database.fetch_one(
        "SELECT id FROM chamados WHERE patrimonio = :p AND status = 'Aberto'",
        {"p": body.patrimonio},
    )
    if ja_aberto:
        raise HTTPException(status_code=409, detail=f"Já existe um chamado em aberto para o patrimônio {body.patrimonio}.")

    await database.execute(
        """INSERT INTO chamados (patrimonio, descricao, foto_base64)
           VALUES (:patrimonio, :descricao, :foto)""",
        {"patrimonio": body.patrimonio, "descricao": body.descricao, "foto": body.foto_base64},
    )
    await registrar_atividade(
        f"Chamado aberto para {body.patrimonio} - {bem['nome']}", int(u["sub"])
    )
    return {"mensagem": "Chamado aberto com sucesso!"}


@app.patch("/chamados/{chamado_id}/aceitar")
async def aceitar_chamado(chamado_id: int, u: dict = Depends(verificar_token)):
    chamado = await database.fetch_one("SELECT * FROM chamados WHERE id = :id", {"id": chamado_id})
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado.")
    if chamado["status"] != "Aberto":
        raise HTTPException(status_code=400, detail="Apenas chamados em aberto podem ser aceitos.")

    await database.execute(
        """UPDATE chamados
           SET status = 'Em andamento', tecnico_id = :tid, tecnico_nome = :nome
           WHERE id = :id""",
        {"tid": int(u["sub"]), "nome": u["nome"], "id": chamado_id},
    )
    await registrar_atividade(
        f"Chamado do patrimônio {chamado['patrimonio']} aceito por {u['nome']}", int(u["sub"])
    )
    return {"mensagem": "Chamado aceito e movido para 'Em andamento'."}


@app.patch("/chamados/{chamado_id}/finalizar")
async def finalizar_chamado(chamado_id: int, body: FeedbackIn, u: dict = Depends(verificar_token)):
    chamado = await database.fetch_one("SELECT * FROM chamados WHERE id = :id", {"id": chamado_id})
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado.")
    if chamado["status"] != "Em andamento":
        raise HTTPException(status_code=400, detail="Apenas chamados em andamento podem ser finalizados.")
    if body.novo_status not in ("Concluído", "Não reparado"):
        raise HTTPException(status_code=400, detail="Status inválido.")

    await database.execute(
        """UPDATE chamados
           SET status = :status, feedback = :feedback, data_conclusao = NOW()
           WHERE id = :id""",
        {"status": body.novo_status, "feedback": body.feedback, "id": chamado_id},
    )

    if body.novo_estado_bem:
        bem = await database.fetch_one("SELECT * FROM bens WHERE numero = :n", {"n": chamado["patrimonio"]})
        if bem and body.novo_estado_bem != bem["estado"]:
            await database.execute(
                "UPDATE bens SET estado = :estado WHERE numero = :n",
                {"estado": body.novo_estado_bem, "n": chamado["patrimonio"]},
            )
            await registrar_atividade(
                f"Chamado {body.novo_status.lower()}: {bem['nome']} → Estado alterado para {body.novo_estado_bem}",
                int(u["sub"]),
            )

    await registrar_atividade(
        f"Chamado {'concluído' if body.novo_status == 'Concluído' else 'encerrado sem reparo'} para {chamado['patrimonio']}",
        int(u["sub"]),
    )
    return {"mensagem": f"Chamado {body.novo_status.lower()} com sucesso."}


@app.delete("/chamados/{chamado_id}")
async def excluir_chamado(chamado_id: int, u: dict = Depends(verificar_token)):
    chamado = await database.fetch_one("SELECT * FROM chamados WHERE id = :id", {"id": chamado_id})
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado.")
    if chamado["status"] != "Aberto":
        raise HTTPException(status_code=400, detail="Apenas chamados em aberto podem ser excluídos.")

    await database.execute("DELETE FROM chamados WHERE id = :id", {"id": chamado_id})
    await registrar_atividade(f"Chamado excluído: Patrimônio {chamado['patrimonio']}", int(u["sub"]))
    return {"mensagem": "Chamado excluído com sucesso!"}


# ============================================================
# ATIVIDADES
# ============================================================
@app.get("/atividades")
async def listar_atividades(
    data_inicio: Optional[str] = None,
    data_fim:    Optional[str] = None,
    limite:      int = 100,
    u: dict = Depends(verificar_token),
):
    query = """
        SELECT a.*, u.nome AS usuario_nome
        FROM atividades a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE TRUE
    """
    params = {}
    if data_inicio:
        query += " AND DATE(a.criado_em) >= :di"   # MySQL: DATE() em vez de ::date
        params["di"] = data_inicio
    if data_fim:
        query += " AND DATE(a.criado_em) <= :df"
        params["df"] = data_fim
    query += f" ORDER BY a.criado_em DESC LIMIT {int(limite)}"
    rows = await database.fetch_all(query, params)
    return [dict(r) for r in rows]


# ============================================================
# DASHBOARD
# ============================================================
@app.get("/dashboard")
async def dashboard(u: dict = Depends(verificar_token)):
    total_bens     = await database.fetch_val("SELECT COUNT(*) FROM bens")
    total_chamados = await database.fetch_val("SELECT COUNT(*) FROM chamados")
    em_andamento   = await database.fetch_val("SELECT COUNT(*) FROM chamados WHERE status = 'Em andamento'")
    atividades     = await database.fetch_all(
        "SELECT texto, criado_em FROM atividades ORDER BY criado_em DESC LIMIT 20"
    )
    return {
        "total_bens":     total_bens,
        "total_chamados": total_chamados,
        "em_andamento":   em_andamento,
        "atividades":     [dict(a) for a in atividades],
    }


# ============================================================
# RELATÓRIOS / ESTATÍSTICAS
# ============================================================
@app.get("/relatorios/estatisticas")
async def estatisticas(u: dict = Depends(verificar_token)):
    valor_total = await database.fetch_val("SELECT COALESCE(SUM(valor), 0) FROM bens")
    total_bens  = await database.fetch_val("SELECT COUNT(*) FROM bens")

    por_categoria = await database.fetch_all(
        "SELECT categoria, COUNT(*) AS quantidade FROM bens GROUP BY categoria"
    )
    por_estado = await database.fetch_all(
        "SELECT estado, COUNT(*) AS quantidade FROM bens GROUP BY estado"
    )
    return {
        "valor_total":   float(valor_total),
        "total_bens":    total_bens,
        "por_categoria": [dict(r) for r in por_categoria],
        "por_estado":    [dict(r) for r in por_estado],
    }
