/**
 * Logger padronizado da aplicação.
 *
 * Centraliza as mensagens de log para que seja simples trocar o destino
 * (por exemplo, enviar erros para Sentry) sem alterar o restante do código.
 * Em produção, apenas `warn` e `error` são emitidos.
 */

const EM_DESENVOLVIMENTO = process.env.NODE_ENV !== 'production';

/**
 * Monta o prefixo padrão de uma mensagem de log.
 * @param {string} escopo - Origem do log (ex.: "contratosService").
 * @param {string} mensagem - Texto descritivo.
 * @returns {string} Mensagem formatada.
 */
const formatar = (escopo, mensagem) => `[${escopo}] ${mensagem}`;

export const logger = {
  /**
   * Log informativo (somente em desenvolvimento).
   * @param {string} escopo
   * @param {string} mensagem
   * @param {...unknown} extras
   */
  info(escopo, mensagem, ...extras) {
    if (EM_DESENVOLVIMENTO) console.info(formatar(escopo, mensagem), ...extras);
  },

  /**
   * Alerta: algo inesperado ocorreu, mas a aplicação segue funcionando.
   * @param {string} escopo
   * @param {string} mensagem
   * @param {...unknown} extras
   */
  warn(escopo, mensagem, ...extras) {
    console.warn(formatar(escopo, mensagem), ...extras);
  },

  /**
   * Erro: uma operação falhou.
   * @param {string} escopo
   * @param {string} mensagem
   * @param {...unknown} extras - Normalmente o objeto de erro original.
   */
  error(escopo, mensagem, ...extras) {
    console.error(formatar(escopo, mensagem), ...extras);
  },
};
