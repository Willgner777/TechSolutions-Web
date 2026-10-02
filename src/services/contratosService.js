import { supabase } from './supabaseClient';
import { resolverResposta } from './errors';
import { logger } from '../utils/logger';

/**
 * Lista os contratos ativos (não excluídos) de uma empresa, do mais recente ao mais antigo.
 *
 * @param {string} empresaId - ID da empresa.
 * @returns {Promise<object[]>}
 */
export async function listarContratosDaEmpresa(empresaId) {
  const resposta = await supabase
    .from('contratos')
    .select('*')
    .eq('empresa_id', empresaId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  return resolverResposta(resposta, 'contratosService.listarContratosDaEmpresa') || [];
}

/**
 * Lista uma versão resumida dos contratos ativos, ordenados por nome (para selects).
 * Falha de forma silenciosa e segura: devolve lista vazia e registra um alerta,
 * pois a ausência de contratos não deve impedir o carregamento da tela.
 *
 * @param {string} empresaId - ID da empresa.
 * @returns {Promise<Array<{ id: string, nome_contrato: string, estado_uf: string | null }>>}
 */
export async function listarContratosResumoDaEmpresa(empresaId) {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select('id, nome_contrato, estado_uf')
      .eq('empresa_id', empresaId)
      .is('deleted_at', null)
      .order('nome_contrato', { ascending: true });
    if (error) {
      logger.warn('contratosService', 'Não foi possível carregar os contratos resumidos.', error);
      return [];
    }
    return data || [];
  } catch (erro) {
    logger.warn('contratosService', 'Falha inesperada ao carregar os contratos resumidos.', erro);
    return [];
  }
}

/**
 * Lista todos os contratos (inclusive os da lixeira). Uso restrito ao painel Super Dev.
 *
 * @returns {Promise<object[]>}
 */
export async function listarTodosContratos() {
  const resposta = await supabase.from('contratos').select('*').order('created_at', { ascending: false });
  return resolverResposta(resposta, 'contratosService.listarTodosContratos') || [];
}

/**
 * Cria um contrato.
 *
 * @param {{ nome_contrato: string, estado_uf: string | null, empresa_id: string }} contrato
 * @returns {Promise<void>}
 */
export async function criarContrato(contrato) {
  const { error } = await supabase.from('contratos').insert([contrato]);
  resolverResposta({ data: null, error }, 'contratosService.criarContrato');
}

/**
 * Atualiza um contrato existente.
 *
 * @param {string} id - ID do contrato.
 * @param {object} campos - Campos a atualizar.
 * @returns {Promise<void>}
 */
export async function atualizarContrato(id, campos) {
  const { error } = await supabase.from('contratos').update(campos).eq('id', id);
  resolverResposta({ data: null, error }, 'contratosService.atualizarContrato');
}
