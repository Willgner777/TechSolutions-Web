import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';
import { ServiceError } from './errors';
import { buscarPerfilCompleto, buscarEmpresaIdDoPerfil } from './perfisService';
import { buscarResumoDaEmpresa } from './empresasService';

/**
 * Carrega o perfil do usuário junto com o resumo da empresa vinculada.
 *
 * @param {string} userId - ID do usuário autenticado.
 * @returns {Promise<object | null>} Perfil (com a chave `empresas`) ou `null` se não houver perfil.
 */
export async function carregarPerfil(userId) {
  const perfil = await buscarPerfilCompleto(userId);
  if (!perfil) return null;

  const empresa = perfil.empresa_id ? await buscarResumoDaEmpresa(perfil.empresa_id) : null;
  return { ...perfil, empresas: empresa };
}

/**
 * Descobre a empresa do usuário autenticado no momento.
 *
 * @returns {Promise<string>} ID da empresa.
 * @throws {ServiceError} Se não houver usuário logado ou empresa vinculada.
 */
export async function obterEmpresaIdDoUsuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new ServiceError('Usuário não autenticado.', { contexto: 'authService.obterEmpresaIdDoUsuarioAtual' });
  }
  return buscarEmpresaIdDoPerfil(user.id);
}

/**
 * Autentica com e-mail e senha.
 *
 * @param {string} email - E-mail do usuário.
 * @param {string} senha - Senha do usuário.
 * @returns {Promise<{ data: object, error: object | null }>} Resposta do Supabase Auth.
 */
export function entrarComEmailESenha(email, senha) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
}

/**
 * Encerra a sessão. Nunca lança: falhas são registradas em log.
 *
 * @returns {Promise<void>}
 */
export async function sair() {
  try {
    await supabase.auth.signOut();
  } catch (erro) {
    logger.error('authService', 'Falha ao encerrar a sessão.', erro);
  }
}

/**
 * Obtém a sessão atual (se houver).
 *
 * @returns {Promise<object | null>} Sessão ativa ou `null`.
 */
export async function obterSessaoAtual() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Assina as mudanças de autenticação.
 *
 * @param {(evento: string, sessao: object | null) => void} callback - Chamada a cada evento de auth.
 * @returns {() => void} Função que cancela a assinatura.
 */
export function observarSessao(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
