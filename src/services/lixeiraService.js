import { supabase } from './supabaseClient';
import { resolverResposta, ServiceError } from './errors';

/** Tabelas que utilizam exclusão lógica (coluna `deleted_at`). */
const TABELAS_COM_LIXEIRA = ['empresas', 'contratos', 'perfis'];

/**
 * Garante que apenas tabelas conhecidas sejam alteradas pela lixeira.
 * @param {string} tabela
 * @throws {ServiceError} Se a tabela não suportar exclusão lógica.
 */
function validarTabela(tabela) {
  if (!TABELAS_COM_LIXEIRA.includes(tabela)) {
    throw new ServiceError(`Tabela "${tabela}" não suporta lixeira.`, { contexto: 'lixeiraService.validarTabela' });
  }
}

/**
 * Move um registro para a lixeira (exclusão lógica).
 * Idempotente: só atua em registros ainda não excluídos, preservando a data
 * original caso a operação seja repetida (ex.: duplo clique).
 *
 * @param {'empresas' | 'contratos' | 'perfis'} tabela - Tabela do registro.
 * @param {string} id - ID do registro.
 * @returns {Promise<void>}
 */
export async function moverParaLixeira(tabela, id) {
  validarTabela(tabela);
  const { error } = await supabase
    .from(tabela)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);
  resolverResposta({ data: null, error }, 'lixeiraService.moverParaLixeira');
}

/**
 * Restaura um registro da lixeira.
 *
 * @param {'empresas' | 'contratos' | 'perfis'} tabela - Tabela do registro.
 * @param {string} id - ID do registro.
 * @returns {Promise<void>}
 */
export async function restaurarDaLixeira(tabela, id) {
  validarTabela(tabela);
  const { error } = await supabase.from(tabela).update({ deleted_at: null }).eq('id', id);
  resolverResposta({ data: null, error }, 'lixeiraService.restaurarDaLixeira');
}
