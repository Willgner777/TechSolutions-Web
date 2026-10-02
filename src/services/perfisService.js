import { supabase } from './supabaseClient';
import { resolverResposta, ServiceError } from './errors';
import { logger } from '../utils/logger';

/**
 * Busca o `empresa_id` vinculado a um usuário.
 *
 * @param {string} userId - ID do usuário autenticado.
 * @returns {Promise<string>} ID da empresa.
 * @throws {ServiceError} Se não houver empresa vinculada ou a consulta falhar.
 */
export async function buscarEmpresaIdDoPerfil(userId) {
  const { data, error } = await supabase.from('perfis').select('empresa_id').eq('id', userId).single();
  if (error || !data?.empresa_id) {
    throw new ServiceError('Empresa vinculada não encontrada.', { cause: error, contexto: 'perfisService.buscarEmpresaIdDoPerfil' });
  }
  return data.empresa_id;
}

/**
 * Busca apenas a role do usuário (usada para decidir o redirecionamento pós-login).
 *
 * @param {string} userId - ID do usuário.
 * @returns {Promise<{ role: string } | null>} Perfil com a role, ou `null` se não encontrado.
 */
export async function buscarRoleDoPerfil(userId) {
  const { data, error } = await supabase.from('perfis').select('role').eq('id', userId).single();
  if (error) {
    logger.warn('perfisService', 'Não foi possível ler a role do perfil.', error);
    return null;
  }
  return data;
}

/**
 * Busca o perfil completo de um usuário.
 *
 * @param {string} userId - ID do usuário.
 * @returns {Promise<object | null>} Perfil ou `null` quando não existe.
 */
export async function buscarPerfilCompleto(userId) {
  const resposta = await supabase.from('perfis').select('*').eq('id', userId).maybeSingle();
  return resolverResposta(resposta, 'perfisService.buscarPerfilCompleto');
}

/**
 * Lista os funcionários (perfis não excluídos) de uma empresa, do mais recente ao mais antigo.
 *
 * @param {string} empresaId - ID da empresa.
 * @returns {Promise<object[]>}
 */
export async function listarFuncionariosDaEmpresa(empresaId) {
  const resposta = await supabase
    .from('perfis')
    .select('*')
    .eq('empresa_id', empresaId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  return resolverResposta(resposta, 'perfisService.listarFuncionariosDaEmpresa') || [];
}

/**
 * Lista todos os perfis (inclusive os da lixeira). Uso restrito ao painel Super Dev.
 *
 * @returns {Promise<object[]>}
 */
export async function listarTodosPerfis() {
  const resposta = await supabase.from('perfis').select('*').order('created_at', { ascending: false });
  return resolverResposta(resposta, 'perfisService.listarTodosPerfis') || [];
}

/**
 * Atualiza campos de um perfil existente.
 *
 * @param {string} id - ID do perfil.
 * @param {object} campos - Campos a atualizar.
 * @returns {Promise<void>}
 */
export async function atualizarPerfil(id, campos) {
  const { error } = await supabase.from('perfis').update(campos).eq('id', id);
  resolverResposta({ data: null, error }, 'perfisService.atualizarPerfil');
}
