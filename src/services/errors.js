import { logger } from '../utils/logger';

/**
 * Erro lançado pela camada de serviços. Mantém a mensagem original do backend
 * (exibida ao usuário) e preserva o erro de origem em `cause` para diagnóstico.
 */
export class ServiceError extends Error {
  /**
   * @param {string} message - Mensagem legível.
   * @param {{ cause?: unknown, contexto?: string }} [opcoes]
   */
  constructor(message, { cause, contexto } = {}) {
    super(message);
    this.name = 'ServiceError';
    this.cause = cause;
    this.contexto = contexto;
  }
}

const MENSAGEM_PADRAO = 'Ocorreu um erro inesperado. Tente novamente.';
const MENSAGEM_SEM_CONEXAO = 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';

/**
 * Extrai uma mensagem segura para exibição a partir de qualquer valor lançado.
 *
 * @param {unknown} error - Erro capturado em um `catch`.
 * @param {string} [fallback] - Mensagem usada quando o erro não traz texto.
 * @returns {string} Mensagem legível.
 */
export function mensagemDoErro(error, fallback = MENSAGEM_PADRAO) {
  const mensagem = typeof error === 'string' ? error : error?.message;
  if (!mensagem) return fallback;
  if (mensagem === 'Failed to fetch') return MENSAGEM_SEM_CONEXAO;
  return mensagem;
}

/**
 * Registra o erro no logger e devolve a mensagem final para a interface.
 *
 * @param {unknown} error - Erro capturado.
 * @param {string} contexto - Onde ocorreu (ex.: "useContratos.salvar").
 * @param {string} [prefixo] - Texto adicionado antes da mensagem (ex.: "Erro ao salvar: ").
 * @returns {string} Mensagem pronta para o feedback visual.
 */
export function tratarErro(error, contexto, prefixo = '') {
  const mensagem = mensagemDoErro(error);
  logger.error(contexto, mensagem, error);
  return `${prefixo}${mensagem}`;
}

/**
 * Valida a resposta `{ data, error }` do Supabase: lança `ServiceError` se
 * houver erro e devolve `data` caso contrário.
 *
 * @template T
 * @param {{ data: T, error: { message?: string } | null }} resposta - Resposta do Supabase.
 * @param {string} contexto - Identificador da operação, usado no log.
 * @returns {T} O conteúdo `data` da resposta.
 * @throws {ServiceError} Quando `error` estiver preenchido.
 */
export function resolverResposta(resposta, contexto) {
  const { data, error } = resposta;
  if (error) {
    throw new ServiceError(mensagemDoErro(error), { cause: error, contexto });
  }
  return data;
}
