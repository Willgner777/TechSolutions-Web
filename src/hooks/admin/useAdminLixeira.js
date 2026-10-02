import { useCallback } from 'react';
import { moverParaLixeira as moverRegistroParaLixeira, restaurarDaLixeira as restaurarRegistro } from '../../services/lixeiraService';

/**
 * Ações de lixeira (exclusão lógica e restauração) compartilhadas pelas abas do painel.
 *
 * @param {{ executar: Function, mostrarSucesso: Function, recarregar: Function }} deps
 */
export function useAdminLixeira({ executar, mostrarSucesso, recarregar }) {
  /**
   * @param {'empresas' | 'contratos' | 'perfis'} tabela
   * @param {string} id
   * @param {string} rotulo - Nome amigável usado na mensagem (ex.: "Empresa").
   */
  const moverParaLixeira = useCallback(
    async (tabela, id, rotulo) => {
      const moveu = await executar(
        async () => {
          await moverRegistroParaLixeira(tabela, id);
          mostrarSucesso(`${rotulo} movido para a Lixeira!`);
        },
        { contexto: 'useAdminLixeira.moverParaLixeira', prefixoErro: 'Erro ao mover para lixeira: ' }
      );
      if (moveu) await recarregar({ manterFeedback: true });
    },
    [executar, mostrarSucesso, recarregar]
  );

  /**
   * @param {'empresas' | 'contratos' | 'perfis'} tabela
   * @param {string} id
   * @param {string} rotulo - Nome amigável usado na mensagem (ex.: "Empresa").
   */
  const restaurarDaLixeira = useCallback(
    async (tabela, id, rotulo) => {
      const restaurou = await executar(
        async () => {
          await restaurarRegistro(tabela, id);
          mostrarSucesso(`${rotulo} restaurado com sucesso!`);
        },
        { contexto: 'useAdminLixeira.restaurarDaLixeira', prefixoErro: 'Erro ao restaurar: ' }
      );
      if (restaurou) await recarregar({ manterFeedback: true });
    },
    [executar, mostrarSucesso, recarregar]
  );

  return { moverParaLixeira, restaurarDaLixeira };
}
