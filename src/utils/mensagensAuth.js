/**
 * Traduz erros retornados pelo Supabase Auth durante o login para mensagens
 * claras em português.
 *
 * @param {{ message?: string, status?: number, code?: string, name?: string } | null | undefined} error
 * @returns {string} Mensagem pronta para exibição ao usuário.
 */
export function traduzirErroLogin(error) {
  const msg = error?.message || '';

  if (msg === 'Invalid login credentials') return 'E-mail ou senha incorretos.';
  if (msg === 'Email not confirmed') return 'E-mail ainda não confirmado. Verifique a caixa de entrada.';
  if (error?.status === 429 || error?.code === 'over_request_rate_limit') {
    return 'Muitas tentativas de acesso. Aguarde um instante e tente novamente.';
  }
  if (msg === 'Failed to fetch' || error?.name === 'AuthRetryableFetchError') {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }

  return msg || 'Erro ao realizar login.';
}
