import { supabase } from './supabaseClient';
import { resolverResposta } from './errors';

/**
 * Busca dados básicos de uma empresa. Falhas não são fatais: retorna `null`.
 *
 * @param {string} empresaId - ID da empresa.
 * @returns {Promise<{ nome: string, plano: string, ativo: boolean } | null>}
 */
export async function buscarResumoDaEmpresa(empresaId) {
  const { data } = await supabase.from('empresas').select('nome, plano, ativo').eq('id', empresaId).maybeSingle();
  return data || null;
}

/**
 * Lista todas as empresas (inclusive as da lixeira). Uso restrito ao painel Super Dev.
 *
 * @returns {Promise<object[]>}
 */
export async function listarTodasEmpresas() {
  const resposta = await supabase.from('empresas').select('*').order('created_at', { ascending: false });
  return resolverResposta(resposta, 'empresasService.listarTodasEmpresas') || [];
}

/**
 * Cria uma empresa ou filial (sempre ativa).
 *
 * @param {object} dados - Campos da empresa.
 * @returns {Promise<void>}
 */
export async function criarEmpresa(dados) {
  const { error } = await supabase.from('empresas').insert([{ ...dados, ativo: true }]);
  resolverResposta({ data: null, error }, 'empresasService.criarEmpresa');
}

/**
 * Atualiza uma empresa existente (não altera o status ativo/inativo).
 *
 * @param {string} id - ID da empresa.
 * @param {object} dados - Campos a atualizar.
 * @returns {Promise<void>}
 */
export async function atualizarEmpresa(id, dados) {
  const { error } = await supabase.from('empresas').update(dados).eq('id', id);
  resolverResposta({ data: null, error }, 'empresasService.atualizarEmpresa');
}

/**
 * Define explicitamente o status ativo/inativo de uma empresa (operação idempotente).
 *
 * @param {string} id - ID da empresa.
 * @param {boolean} ativo - Novo status.
 * @returns {Promise<void>}
 */
export async function definirEmpresaAtiva(id, ativo) {
  const { error } = await supabase.from('empresas').update({ ativo }).eq('id', id);
  resolverResposta({ data: null, error }, 'empresasService.definirEmpresaAtiva');
}
