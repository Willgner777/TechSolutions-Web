/**
 * Pede confirmação ao usuário antes de uma ação destrutiva.
 * Centralizado aqui para facilitar a troca futura por um modal próprio.
 *
 * @param {string} mensagem - Texto exibido na confirmação.
 * @returns {boolean} `true` se o usuário confirmou.
 */
export function confirmarAcao(mensagem) {
  return window.confirm(mensagem);
}

/**
 * Rola a janela suavemente até o topo da página.
 * @returns {void}
 */
export function rolarParaTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
