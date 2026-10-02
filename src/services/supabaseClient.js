import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const variaveisAusentes = [
  !SUPABASE_URL && 'REACT_APP_SUPABASE_URL',
  !SUPABASE_ANON_KEY && 'REACT_APP_SUPABASE_ANON_KEY',
].filter(Boolean);

/**
 * Mensagem de configuração inválida (variáveis de ambiente ausentes) ou `null`
 * quando tudo está correto. O `index.js` usa este valor para exibir uma tela
 * de erro clara em vez de uma tela branca.
 * @type {string | null}
 */
export const erroConfiguracao = variaveisAusentes.length
  ? `Variáveis de ambiente ausentes: ${variaveisAusentes.join(', ')}. Copie o arquivo .env.example para .env, preencha os valores e reinicie o servidor.`
  : null;

/**
 * `fetch` com registro centralizado de falhas de rede e respostas HTTP de erro.
 * Funciona como interceptador para todas as requisições do Supabase.
 * Registra apenas método, caminho e status (sem query string, corpo ou headers).
 *
 * @param {RequestInfo | URL} entrada
 * @param {RequestInit} [opcoes]
 * @returns {Promise<Response>}
 */
async function fetchComRegistro(entrada, opcoes) {
  const metodo = (opcoes?.method || 'GET').toUpperCase();
  const caminho = (() => {
    try {
      return new URL(typeof entrada === 'string' ? entrada : entrada.url ?? String(entrada)).pathname;
    } catch {
      return 'URL desconhecida';
    }
  })();

  try {
    const resposta = await fetch(entrada, opcoes);
    if (!resposta.ok) {
      logger.warn('supabase', `${metodo} ${caminho} respondeu ${resposta.status}`);
    }
    return resposta;
  } catch (erro) {
    logger.error('supabase', `Falha de rede em ${metodo} ${caminho}`, erro);
    throw erro;
  }
}

const opcoesGlobais = { global: { fetch: fetchComRegistro } };

/**
 * Cliente principal do Supabase (mantém a sessão do usuário logado).
 * É `null` somente quando `erroConfiguracao` está preenchido.
 */
export const supabase = erroConfiguracao
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, opcoesGlobais);

/**
 * Cria um cliente isolado, sem guardar sessão. Usado para criar usuários
 * (`signUp`) sem trocar a sessão do administrador que está logado.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export const criarClienteIsolado = () =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...opcoesGlobais,
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
