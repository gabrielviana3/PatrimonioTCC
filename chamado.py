"""
Classe Chamado – representa um chamado de manutenção vinculado a um Bem.

Associação (diagrama UML):
    Um Bem pode ter 0..1 Chamado aberto.
    Um Usuário abre 0..N Chamados  →  recebe o id do usuário como referência.

Status possíveis (RF09):
    "Aberto" → "Em andamento" → "Concluído" | "Não reparado"

Atributos:
    id_chamado      : int
    data_abertura   : date   – preenchido automaticamente na criação
    status          : str
    data_fechamento : date | None
    descricao       : str
    bem             : Bem    – bem ao qual o chamado está vinculado
    usuario_id      : int    – id do usuário que abriu o chamado
"""

from __future__ import annotations
import datetime
from bem import Bem


STATUS_VALIDOS = ("Aberto", "Em andamento", "Concluído", "Não reparado")


class Chamado:
    def __init__(
        self,
        id_chamado: int,
        descricao: str,
        bem: Bem,
        usuario_id: int,
    ) -> None:
        self.__id_chamado: int                       = id_chamado
        self.__descricao: str                        = descricao
        self.__bem: Bem                              = bem
        self.__usuario_id: int                       = usuario_id
        self.__status: str                           = "Aberto"
        self.__data_abertura: datetime.date          = datetime.date.today()
        self.__data_fechamento: datetime.date | None = None

    # ── Getters ──────────────────────────────────────────────
    @property
    def id_chamado(self) -> int:
        return self.__id_chamado

    @property
    def descricao(self) -> str:
        return self.__descricao

    @property
    def bem(self) -> Bem:
        return self.__bem

    @property
    def usuario_id(self) -> int:
        return self.__usuario_id

    @property
    def status(self) -> str:
        return self.__status

    @property
    def data_abertura(self) -> datetime.date:
        return self.__data_abertura

    @property
    def data_fechamento(self) -> datetime.date | None:
        return self.__data_fechamento

    # ── Métodos (RF08, RF09) ──────────────────────────────────
    def abrir(self) -> str:
        """
        Registra a abertura formal do chamado (RF08).
        Só pode ser aberto se o status atual for 'Aberto'
        (impede duplo chamado para o mesmo bem).
        """
        if self.__status != "Aberto":
            raise RuntimeError(
                f"Chamado #{self.__id_chamado} já está '{self.__status}'. Não pode ser reaberto."
            )
        self.__data_abertura = datetime.date.today()
        return (
            f"Chamado #{self.__id_chamado} aberto em {self.__data_abertura} "
            f"para o bem '{self.__bem.nome}'."
        )

    def fechar(self, status_final: str) -> str:
        """
        Encerra o chamado com 'Concluído' ou 'Não reparado' (RF09).
        Só pode ser fechado quando 'Em andamento'.
        """
        if self.__status != "Em andamento":
            raise RuntimeError(
                "Somente chamados 'Em andamento' podem ser fechados."
            )
        if status_final not in ("Concluído", "Não reparado"):
            raise ValueError(
                f"Status final inválido: '{status_final}'. "
                "Use 'Concluído' ou 'Não reparado'."
            )
        self.__status          = status_final
        self.__data_fechamento = datetime.date.today()
        return (
            f"Chamado #{self.__id_chamado} encerrado em {self.__data_fechamento} "
            f"com status '{self.__status}'."
        )

    def consultar(self) -> str:
        """Retorna detalhes do chamado para visualização (RF05, RF09)."""
        fechamento = str(self.__data_fechamento) if self.__data_fechamento else "—"
        return (
            f"Chamado #{self.__id_chamado}\n"
            f"  Bem         : {self.__bem.nome} (ID {self.__bem.id_bem})\n"
            f"  Descrição   : {self.__descricao}\n"
            f"  Status      : {self.__status}\n"
            f"  Abertura    : {self.__data_abertura}\n"
            f"  Fechamento  : {fechamento}\n"
            f"  Aberto por  : Usuário #{self.__usuario_id}"
        )

    def atualizar_status(self, novo_status: str) -> str:
        """
        Avança o status do chamado respeitando o fluxo (RF09):
        Aberto → Em andamento → Concluído | Não reparado
        """
        if novo_status not in STATUS_VALIDOS:
            raise ValueError(f"Status '{novo_status}' não é válido.")

        fluxo = {
            "Aberto":       ("Em andamento",),
            "Em andamento": ("Concluído", "Não reparado"),
        }
        permitidos = fluxo.get(self.__status, ())
        if novo_status not in permitidos:
            raise RuntimeError(
                f"Transição inválida: '{self.__status}' → '{novo_status}'."
            )

        self.__status = novo_status
        if novo_status in ("Concluído", "Não reparado"):
            self.__data_fechamento = datetime.date.today()

        return f"Chamado #{self.__id_chamado} atualizado para '{self.__status}'."

    def __repr__(self) -> str:
        return (
            f"Chamado(id={self.__id_chamado}, bem='{self.__bem.nome}', "
            f"status='{self.__status}')"
        )
      
