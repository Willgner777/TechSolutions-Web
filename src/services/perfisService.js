import { supabase } from './supabaseClient';
import { resolverResposta, ServiceError } from './errors';
import { logger } from '../utils/logger';

// ... (Outras funções do serviço)

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
 * @returns {Promise<object>} Perfil atualizado.
 */
export async function atualizarPerfil(id, campos) {
  const resposta = await supabase
    .from('perfis')
    .update(campos)
    .eq('id', id)
    .select();

  return resolverResposta(resposta, 'perfisService.atualizarPerfil');
}