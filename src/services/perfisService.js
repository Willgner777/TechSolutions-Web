import { supabase } from './supabaseClient'; // ou './Admbases' conforme a sua pasta
import { resolverResposta, ServiceError } from './errors';
import { logger } from '../utils/logger';

// ... (Mantenha as outras funções: buscarEmpresaIdDoPerfil, buscarRoleDoPerfil, etc.)

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
    .select(); // Adicionado .select() para retornar os dados alterados

  return resolverResposta(resposta, 'perfisService.atualizarPerfil');
}