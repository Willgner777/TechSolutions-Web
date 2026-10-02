import { supabase, supabaseAdmin } from './supabaseClient';
import { resolverResposta } from './errors';

function getClient() {
  return supabaseAdmin ?? supabase;
}

export async function listarMateriaisDaEmpresa(empresaId) {
  const cliente = getClient();
  const { data, error } = await cliente
    .from('materiais')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('codigo', { ascending: true });
  resolverResposta({ data, error }, 'materiaisService.listarMateriaisDaEmpresa');
  return data ?? [];
}

export async function proximoCodigo(empresaId) {
  const cliente = getClient();
  const { data, error } = await cliente
    .from('materiais')
    .select('codigo')
    .eq('empresa_id', empresaId)
    .order('codigo', { ascending: false })
    .limit(1);
  resolverResposta({ data, error }, 'materiaisService.proximoCodigo');
  return (data?.[0]?.codigo ?? 0) + 1;
}

export async function criarMaterial({ empresaId, nome, descricao, umb, codigo }) {
  const cliente = getClient();
  const cod = codigo ?? await proximoCodigo(empresaId);
  const { data, error } = await cliente
    .from('materiais')
    .insert([{ empresa_id: empresaId, codigo: cod, nome, descricao, umb }])
    .select()
    .single();
  resolverResposta({ data, error }, 'materiaisService.criarMaterial');
  return data;
}

export async function atualizarMaterial(id, campos) {
  const cliente = getClient();
  const { data, error } = await cliente
    .from('materiais')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  resolverResposta({ data, error }, 'materiaisService.atualizarMaterial');
  return data;
}

export async function alternarAtivoMaterial(id, ativo) {
  return atualizarMaterial(id, { ativo });
}

export async function excluirMaterial(id) {
  const cliente = getClient();
  const { error } = await cliente.from('materiais').delete().eq('id', id);
  resolverResposta({ data: null, error }, 'materiaisService.excluirMaterial');
}