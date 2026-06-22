"""
Classe Bem – representa um bem patrimonial da instituição.

Associação (diagrama UML):
    Um Local possui 0..N Bens  →  Bem recebe um objeto Local no construtor.
    Um Bem pode ter 0..1 Chamado aberto vinculado a ele.

Atributos (RF04):
    id_bem         : int
    nome           : str
    data_aquisicao : str   (formato ISO: 'AAAA-MM-DD')
    tipo           : str   (ex: "Mobiliário", "Equipamento")
    categoria      : str
    nota_fiscal    : int
    valor          : float
    local          : Local – local onde o bem está alocado
"""

from __future__ import annotations
import datetime
from local import Local


class Bem:
    def __init__(
        self,
        id_bem: int,
        nome: str,
        data_aquisicao: str,
        tipo: str,
        categoria: str,
        nota_fiscal: int,
        valor: float,
        local: Local,
    ) -> None:
        self.__id_bem: int          = id_bem
        self.__nome: str            = nome
        self.__data_aquisicao: str  = data_aquisicao
        self.__tipo: str            = tipo
        self.__categoria: str       = categoria
        self.__nota_fiscal: int     = nota_fiscal
        self.__valor: float         = valor
        self.__local: Local         = local

    # ── Getters ──────────────────────────────────────────────
    @property
    def id_bem(self) -> int:
        return self.__id_bem

    @property
    def nome(self) -> str:
        return self.__nome

    @property
    def data_aquisicao(self) -> str:
        return self.__data_aquisicao

    @property
    def tipo(self) -> str:
        return self.__tipo

    @property
    def categoria(self) -> str:
        return self.__categoria

    @property
    def nota_fiscal(self) -> int:
        return self.__nota_fiscal

    @property
    def valor(self) -> float:
        return self.__valor

    @property
    def local(self) -> Local:
        return self.__local

    # ── Setters ──────────────────────────────────────────────
    @nome.setter
    def nome(self, valor: str) -> None:
        if not valor.strip():
            raise ValueError("O nome do bem não pode ser vazio.")
        self.__nome = valor.strip()

    @valor.setter
    def valor(self, novo: float) -> None:
        if novo < 0:
            raise ValueError("O valor do bem não pode ser negativo.")
        self.__valor = novo

    @local.setter
    def local(self, novo_local: Local) -> None:
        if not isinstance(novo_local, Local):
            raise TypeError("local deve ser uma instância de Local.")
        self.__local = novo_local

    # ── Métodos (RF04, RF05, RF06) ────────────────────────────
    def cadastrar(self) -> dict:
        """Retorna os dados do bem prontos para persistência (RF04)."""
        return {
            "id_bem":         self.__id_bem,
            "nome":           self.__nome,
            "data_aquisicao": self.__data_aquisicao,
            "tipo":           self.__tipo,
            "categoria":      self.__categoria,
            "nota_fiscal":    self.__nota_fiscal,
            "valor":          self.__valor,
            "local":          self.__local.listar_local(),
        }

    def editar(self, nome: str = "", valor: float = 0.0, novo_local: Local = None) -> None:
        """Atualiza informações do bem (RF06)."""
        if nome:
            self.nome = nome
        if valor > 0:
            self.valor = valor
        if novo_local:
            self.local = novo_local

    def consultar(self) -> str:
        """Retorna descrição completa do bem para consulta (RF05)."""
        return (
            f"Bem #{self.__id_bem}\n"
            f"  Nome        : {self.__nome}\n"
            f"  Tipo        : {self.__tipo}\n"
            f"  Categoria   : {self.__categoria}\n"
            f"  Nota Fiscal : {self.__nota_fiscal}\n"
            f"  Valor       : R$ {self.__valor:.2f}\n"
            f"  Aquisição   : {self.__data_aquisicao}\n"
            f"  Localização : {self.__local.listar_local()}"
        )

    def __repr__(self) -> str:
        return (
            f"Bem(id={self.__id_bem}, nome='{self.__nome}', "
            f"valor={self.__valor:.2f}, local={self.__local!r})"
        )
      
