import { supabase, criarClienteIsolado, supabaseAdmin } from './supabaseClient';
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

/**
 * Atualiza e-mail e/ou senha no Auth (login) de um usuário já existente.
 *
 * @param {string} userId - ID do usuário (`auth.users` / `perfis.id`).
 * @param {{ email?: string, senha?: string }} credenciais
 * @returns {Promise<void>}
 */
export async function atualizarCredenciaisAuth(userId, { email, senha } = {}) {
  const atributos = {};
  if (typeof email === 'string' && email.trim()) atributos.email = email.trim();
  if (typeof senha === 'string' && senha.trim()) atributos.password = senha.trim();
  if (!Object.keys(atributos).length) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clienteParaAcao = (user?.id === userId) ? supabase : supabaseAdmin;

  if (!clienteParaAcao) {
    throw new Error('Permissão insuficiente ou configuração de admin ausente (REACT_APP_SUPABASE_SERVICE_ROLE_KEY).');
  }

  const resposta =
    user?.id === userId
      ? await supabase.auth.updateUser(atributos)
      : await supabaseAdmin.auth.admin.updateUserById(userId, atributos);

  resolverResposta(resposta, 'usuariosService.atualizarCredenciaisAuth');
}
