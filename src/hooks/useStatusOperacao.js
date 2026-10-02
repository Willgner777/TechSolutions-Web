import { useCallback, useRef, useState } from 'react';
import { tratarErro } from '../services/errors';
import { useIsMounted } from './useIsMounted';

const FEEDBACK_VAZIO = { type: '', message: '' };

/**
 * Controla `loading` e `feedback` (mensagem de sucesso/erro) de uma tela e
 * executa operações assíncronas de forma segura:
 *  - sempre desliga o `loading` ao final (`finally`);
 *  - converte exceções em mensagem de erro + log (sem falhas silenciosas);
 *  - ignora uma nova execução enquanto outra está em andamento (evita
 *    duplo clique/duplo envio);
 *  - não atualiza estado depois que a tela foi desmontada.
 *
 * @returns {{
 *   loading: boolean,
 *   feedback: { type: string, message: string },
 *   executar: (tarefa: () => Promise<void>, opcoes?: { contexto?: string, prefixoErro?: string, limparFeedbackAntes?: boolean }) => Promise<boolean>,
 *   mostrarSucesso: (mensagem: string) => void,
 *   mostrarErro: (mensagem: string) => void,
 *   limparFeedback: () => void,
 *   isMounted: () => boolean,
 * }}
 */
export function useStatusOperacao() {
  const isMounted = useIsMounted();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(FEEDBACK_VAZIO);
  const emAndamentoRef = useRef(false);

  const mostrarSucesso = useCallback(
    (message) => {
      if (isMounted()) setFeedback({ type: 'success', message });
    },
    [isMounted]
  );

  const mostrarErro = useCallback(
    (message) => {
      if (isMounted()) setFeedback({ type: 'error', message });
    },
    [isMounted]
  );

  const limparFeedback = useCallback(() => setFeedback(FEEDBACK_VAZIO), []);

  /**
   * Executa a tarefa com controle de loading e tratamento de erro.
   * @returns {Promise<boolean>} `true` se concluiu sem erro; `false` se falhou ou foi ignorada.
   */
  const executar = useCallback(
    async (tarefa, { contexto = 'operacao', prefixoErro = '', limparFeedbackAntes = false } = {}) => {
      if (emAndamentoRef.current) return false;
      emAndamentoRef.current = true;

      setLoading(true);
      if (limparFeedbackAntes) setFeedback(FEEDBACK_VAZIO);

      try {
        await tarefa();
        return true;
      } catch (erro) {
        const mensagem = tratarErro(erro, contexto, prefixoErro);
        if (isMounted()) setFeedback({ type: 'error', message: mensagem });
        return false;
      } finally {
        emAndamentoRef.current = false;
        if (isMounted()) setLoading(false);
      }
    },
    [isMounted]
  );

  return { loading, feedback, executar, mostrarSucesso, mostrarErro, limparFeedback, isMounted };
}
