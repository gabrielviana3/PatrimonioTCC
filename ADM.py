"""
Classe ADM – administrador do sistema, herda de Usuario.

Generalização (diagrama UML):
    ADM é uma especialização de Usuario com permissões exclusivas.

Permissões adicionais (RF03, RF07):
    - Cadastrar bens
    - Consultar bens (com visão completa)
    - Editar bens
    - Excluir bens (RF07 – exclusão restrita a admins)
    - Excluir chamados
"""

from __future__ import annotations
from usuario import Usuario


class ADM(Usuario):
    def __init__(
        self,
        id: int,
        nome: str,
        email: str,
        senha: str,
    ) -> None:
        # Tipo sempre fixo como "admin" para esta subclasse
        super().__init__(id=id, nome=nome, email=email, senha=senha, tipo="admin")

    # ── Métodos exclusivos do ADM (RF03, RF04, RF05, RF06, RF07) ─
    def cadastrar_bens(self, bem) -> dict:
        """
        Persiste um novo bem no sistema (RF04).
        Recebe um objeto Bem e retorna seus dados para gravação.
        """
        return bem.cadastrar()

    def consultar_bens(self, bem) -> str:
        """
        Consulta detalhada de um bem (RF05).
        Administradores têm acesso à visualização completa.
        """
        return bem.consultar()

    def editar_bens(self, bem, nome: str = "", valor: float = 0.0, novo_local=None) -> None:
        """
        Edita as informações de um bem patrimonial (RF06).
        Delega a operação ao próprio objeto Bem.
        """
        bem.editar(nome=nome, valor=valor, novo_local=novo_local)

    def excluir_bem(self, bem) -> str:
        """
        Exclui um bem patrimonial (RF07 – somente administradores).
        Retorna mensagem de confirmação para log de auditoria (RE03).
        """
        return (
            f"[ADM #{self.id}] Bem #{bem.id_bem} ('{bem.nome}') "
            f"excluído pelo administrador {self.nome}."
        )

    def excluir_chamado(self, chamado) -> str:
        """
        Exclui um chamado (RF09 – somente administradores podem excluir).
        Retorna mensagem de confirmação para log de auditoria.
        """
        return (
            f"[ADM #{self.id}] Chamado #{chamado.id_chamado} "
            f"excluído pelo administrador {self.nome}."
        )

    def __repr__(self) -> str:
        return f"ADM(id={self.id}, nome='{self.nome}')"
