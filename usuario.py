"""
Classe Usuario – classe base que representa qualquer usuário do sistema.

Generalização (diagrama UML):
    ADM herda de Usuario, adicionando permissões exclusivas (RF03).

Atributos (RF01, RF02):
    nome   : str
    senha  : str   – armazenada como hash em produção (ver auth.py)
    id     : int
    email  : str
    tipo   : str   – "tecnico" ou "admin"
"""

from __future__ import annotations


class Usuario:
    def __init__(
        self,
        id: int,
        nome: str,
        email: str,
        senha: str,
        tipo: str = "tecnico",
    ) -> None:
        self.__id: int    = id
        self.__nome: str  = nome
        self.__email: str = email
        self.__senha: str = senha
        self.__tipo: str  = tipo

    # ── Getters ──────────────────────────────────────────────
    @property
    def id(self) -> int:
        return self.__id

    @property
    def nome(self) -> str:
        return self.__nome

    @property
    def email(self) -> str:
        return self.__email

    @property
    def tipo(self) -> str:
        return self.__tipo

    # ── Setters ──────────────────────────────────────────────
    @nome.setter
    def nome(self, valor: str) -> None:
        if not valor.strip():
            raise ValueError("O nome não pode ser vazio.")
        self.__nome = valor.strip()

    @email.setter
    def email(self, valor: str) -> None:
        if "@" not in valor:
            raise ValueError("Email inválido.")
        self.__email = valor.lower().strip()

    # ── Métodos (RF01, RF02, RF08) ────────────────────────────
    def fazer_login(self, email: str, senha: str) -> bool:
        """
        Verifica credenciais do usuário (RF01).
        Em produção a senha deve ser comparada via bcrypt (ver auth.py).
        """
        return self.__email == email.lower().strip() and self.__senha == senha

    def abrir_chamado(self, id_chamado: int, descricao: str, bem) -> "Chamado":  # type: ignore[name-defined]
        """
        Cria e retorna um novo Chamado vinculado a um bem (RF08).
        Importação local evita dependência circular.
        """
        from chamado import Chamado
        return Chamado(
            id_chamado=id_chamado,
            descricao=descricao,
            bem=bem,
            usuario_id=self.__id,
        )

    def editar(self, novo_nome: str = "", novo_email: str = "") -> None:
        """Atualiza dados do próprio perfil (RF02)."""
        if novo_nome:
            self.nome = novo_nome
        if novo_email:
            self.email = novo_email

    def excluir(self) -> str:
        """
        Marca o usuário como excluído (RF03).
        A exclusão real é feita no banco; aqui sinaliza a intenção.
        """
        return f"Usuário #{self.__id} ({self.__nome}) marcado para exclusão."

    def __repr__(self) -> str:
        return f"Usuario(id={self.__id}, nome='{self.__nome}', tipo='{self.__tipo}')"
      
