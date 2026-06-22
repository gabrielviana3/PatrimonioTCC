"""
Classe Local – representa um espaço físico da instituição
onde os bens patrimoniais podem estar alocados.

Atributos (RF04, RF06):
    id_local : int    – identificador único do local
    nome     : str    – nome do local (ex: "Sala 01")
    bloco    : str    – bloco/setor onde o local se encontra
"""


class Local:
    def __init__(self, id_local: int, nome: str, bloco: str) -> None:
        self.__id_local: int = id_local
        self.__nome: str     = nome
        self.__bloco: str    = bloco

    # ── Getters ──────────────────────────────────────────────
    @property
    def id_local(self) -> int:
        return self.__id_local

    @property
    def nome(self) -> str:
        return self.__nome

    @property
    def bloco(self) -> str:
        return self.__bloco

    # ── Setters ──────────────────────────────────────────────
    @nome.setter
    def nome(self, valor: str) -> None:
        if not valor.strip():
            raise ValueError("O nome do local não pode ser vazio.")
        self.__nome = valor.strip()

    @bloco.setter
    def bloco(self, valor: str) -> None:
        if not valor.strip():
            raise ValueError("O bloco não pode ser vazio.")
        self.__bloco = valor.strip()

    # ── Métodos (RF04, RF05, RF06) ────────────────────────────
    def cadastrar_local(self) -> dict:
        """Retorna os dados do local prontos para persistência (RF04)."""
        return {
            "id_local": self.__id_local,
            "nome":     self.__nome,
            "bloco":    self.__bloco,
        }

    def editar_local(self, novo_nome: str = "", novo_bloco: str = "") -> None:
        """Atualiza nome e/ou bloco do local (RF06)."""
        if novo_nome:
            self.nome = novo_nome
        if novo_bloco:
            self.bloco = novo_bloco

    def consultar_chamado(self) -> str:
        """Retorna uma descrição do local para uso em consultas de chamados (RF05, RF08)."""
        return f"Local #{self.__id_local} – {self.__nome} (Bloco {self.__bloco})"

    def listar_local(self) -> str:
        """Representação resumida para listagens (RF05)."""
        return f"[{self.__id_local}] {self.__nome} – Bloco {self.__bloco}"

    def __repr__(self) -> str:
        return f"Local(id={self.__id_local}, nome='{self.__nome}', bloco='{self.__bloco}')"
