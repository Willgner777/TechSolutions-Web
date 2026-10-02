import { supabase, criarClienteIsolado } from './supabaseClient';
import { resolverResposta } from './errors';

/**
 * Cadastra um novo usuário no Supabase Auth e cria/atualiza seu perfil.
 *
 * O `signUp` é feito em um cliente isolado para NÃO trocar a sessão de quem
 * está logado (administrador). Se o cadastro abrir sessão para o novo usuário
 * (confirmação de e-mail desligada), o perfil é gravado com essa mesma sessão;
 * caso contrário, é gravado com a sessão do administrador.
 *
 * @param {object} params
 * @param {string} params.email - E-mail do novo usuário.
 * @param {string} params.senha - Senha provisória.
 * @param {string} params.nome - Nome completo.
 * @param {string} params.role - Papel (ex.: "funcionario", "super_dev").
 * @param {object} params.dadosPerfil - Demais colunas de `perfis` (sem `id`).
 * @returns {Promise<void>}
 * @throws {ServiceError} Se o cadastro ou a gravação do perfil falhar.
 */
export async function cadastrarUsuarioComPerfil({ email, senha, nome, role, dadosPerfil }) {
  const clienteAuth = criarClienteIsolado();

  const { data, error } = await clienteAuth.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, role } },
  });
  resolverResposta({ data: null, error }, 'usuariosService.cadastrarUsuarioComPerfil.signUp');

  const usuario = data?.user;
  if (!usuario) return;

  const clientePerfil = data.session ? clienteAuth : supabase;
  const respostaPerfil = await clientePerfil.from('perfis').upsert([{ id: usuario.id, ...dadosPerfil }]);
  resolverResposta({ data: null, error: respostaPerfil.error }, 'usuariosService.cadastrarUsuarioComPerfil.perfil');
}
