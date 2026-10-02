import { useCallback, useMemo, useState } from 'react';
import { atualizarPerfil } from '../../services/perfisService';
import { atualizarCredenciaisAuth, cadastrarUsuarioComPerfil } from '../../services/usuariosService';
import { confirmarAcao } from '../../utils/browser';

/**
 * Formulários, filtros e ações da aba "Utilizadores" do painel Super Dev.
 *
 * @param {{
 *   executar: Function,
 *   mostrarSucesso: Function,
 *   mostrarErro: Function,
 *   recarregar: Function,
 *   usuarios: object[],
 *   moverParaLixeira: Function,
 * }} deps
 */
export function useAdminUsuarios({ executar, mostrarSucesso, mostrarErro, recarregar, usuarios, moverParaLixeira }) {
  // Edição de usuário existente
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [ativoUsuario, setAtivoUsuario] = useState(true);
  const [roleUsuario, setRoleUsuario] = useState('funcionario');
  const [cargoUsuario, setCargoUsuario] = useState('');
  const [contratoUsuario, setContratoUsuario] = useState('');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');

  // Filtros da lista
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [filtroEmpresaUsuario, setFiltroEmpresaUsuario] = useState('');
  const [filtroRoleUsuario, setFiltroRoleUsuario] = useState('');
  const [filtroStatusUsuario, setFiltroStatusUsuario] = useState('');

  // Cadastro de novo usuário
  const [exibirFormNovoUsuario, setExibirFormNovoUsuario] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoRole, setNovoRole] = useState('funcionario');
  const [novoCargo, setNovoCargo] = useState('');
  const [novoContrato, setNovoContrato] = useState('');
  const [novaEmpresaId, setNovaEmpresaId] = useState('');

  const limparFormNovoUsuario = useCallback(() => {
    setNovoNome('');
    setNovoEmail('');
    setNovaSenha('');
    setNovoRole('funcionario');
    setNovoCargo('');
    setNovoContrato('');
    setNovaEmpresaId('');
    setExibirFormNovoUsuario(false);
  }, []);

  const criarNovoUsuario = useCallback(
    async (evento) => {
      evento.preventDefault();
      if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) {
        mostrarErro('Preencha Nome, E-mail e Senha.');
        return;
      }

      const criou = await executar(
        async () => {
          await cadastrarUsuarioComPerfil({
            email: novoEmail,
            senha: novaSenha,
            nome: novoNome,
            role: novoRole,
            dadosPerfil: {
              nome: novoNome,
              email: novoEmail,
              role: novoRole,
              cargo: novoCargo,
              contrato: novoContrato,
              empresa_id: novoRole === 'super_dev' ? null : novaEmpresaId || null,
              ativo: true,
            },
          });
          mostrarSucesso('Novo funcionário cadastrado com sucesso!');
        },
        { contexto: 'useAdminUsuarios.criarNovoUsuario', prefixoErro: 'Erro ao cadastrar funcionário: ' }
      );

      if (criou) {
        limparFormNovoUsuario();
        await recarregar({ manterFeedback: true });
      }
    },
    [
      novoNome,
      novoEmail,
      novaSenha,
      novoRole,
      novoCargo,
      novoContrato,
      novaEmpresaId,
      executar,
      mostrarSucesso,
      mostrarErro,
      limparFormNovoUsuario,
      recarregar,
    ]
  );

  const prepararEdicaoUsuario = useCallback((usr) => {
    setExibirFormNovoUsuario(false);
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setAtivoUsuario(usr.ativo !== false);
    setRoleUsuario(usr.role || 'funcionario');
    setCargoUsuario(usr.cargo || '');
    setContratoUsuario(usr.contrato || '');
    setEmpresaIdSelecionada(usr.empresa_id || '');
    setSenhaUsuario('');
  }, []);

  const limparFormUsuario = useCallback(() => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setAtivoUsuario(true);
    setRoleUsuario('funcionario');
    setCargoUsuario('');
    setContratoUsuario('');
    setEmpresaIdSelecionada('');
    setSenhaUsuario('');
  }, []);

  const salvarUsuario = useCallback(
    async (evento) => {
      evento.preventDefault();
      if (!editingUsuarioId) return;

      const salvou = await executar(
        async () => {
          await atualizarPerfil(editingUsuarioId, {
            nome: nomeUsuario,
            email: emailUsuario,
            role: roleUsuario,
            cargo: cargoUsuario,
            contrato: contratoUsuario,
            empresa_id: roleUsuario === 'super_dev' ? null : empresaIdSelecionada || null,
            ativo: ativoUsuario,
          });
          if (senhaUsuario.trim()) {
            await atualizarCredenciaisAuth(editingUsuarioId, { senha: senhaUsuario });
          }
          mostrarSucesso('Dados do utilizador salvos com sucesso!');
        },
        { contexto: 'useAdminUsuarios.salvarUsuario', prefixoErro: 'Erro ao salvar: ' }
      );

      if (salvou) {
        limparFormUsuario();
        await recarregar({ manterFeedback: true });
      }
    },
    [
      editingUsuarioId,
      nomeUsuario,
      emailUsuario,
      roleUsuario,
      cargoUsuario,
      contratoUsuario,
      empresaIdSelecionada,
      ativoUsuario,
      senhaUsuario,
      executar,
      mostrarSucesso,
      limparFormUsuario,
      recarregar,
    ]
  );

  const confirmarMoverUsuarioParaLixeira = useCallback(
    (id) => {
      if (!confirmarAcao('Deseja mover este utilizador para a Lixeira?')) return;
      moverParaLixeira('perfis', id, 'Utilizador');
    },
    [moverParaLixeira]
  );

  const usuariosFiltrados = useMemo(() => {
    const termo = buscaUsuario.toLowerCase();
    return usuarios.filter((u) => {
      const okBusca =
        !termo ||
        (u.nome || '').toLowerCase().includes(termo) ||
        (u.email || '').toLowerCase().includes(termo) ||
        (u.cargo || '').toLowerCase().includes(termo);
      const okEmpresa =
        !filtroEmpresaUsuario ||
        (filtroEmpresaUsuario === 'sem'
          ? u.role !== 'super_dev' && !u.empresas
          : u.empresa_id === filtroEmpresaUsuario);
      const okRole = !filtroRoleUsuario || u.role === filtroRoleUsuario;
      const okStatus =
        !filtroStatusUsuario || (filtroStatusUsuario === 'ativo' ? u.ativo !== false : u.ativo === false);
      return okBusca && okEmpresa && okRole && okStatus;
    });
  }, [usuarios, buscaUsuario, filtroEmpresaUsuario, filtroRoleUsuario, filtroStatusUsuario]);

  return {
    editingUsuarioId,
    nomeUsuario,
    setNomeUsuario,
    emailUsuario,
    setEmailUsuario,
    ativoUsuario,
    setAtivoUsuario,
    roleUsuario,
    setRoleUsuario,
    cargoUsuario,
    setCargoUsuario,
    contratoUsuario,
    setContratoUsuario,
    empresaIdSelecionada,
    setEmpresaIdSelecionada,
    senhaUsuario,
    setSenhaUsuario,
    buscaUsuario,
    setBuscaUsuario,
    filtroEmpresaUsuario,
    setFiltroEmpresaUsuario,
    filtroRoleUsuario,
    setFiltroRoleUsuario,
    filtroStatusUsuario,
    setFiltroStatusUsuario,
    exibirFormNovoUsuario,
    setExibirFormNovoUsuario,
    novoNome,
    setNovoNome,
    novoEmail,
    setNovoEmail,
    novaSenha,
    setNovaSenha,
    novoRole,
    setNovoRole,
    novoCargo,
    setNovoCargo,
    novoContrato,
    setNovoContrato,
    novaEmpresaId,
    setNovaEmpresaId,
    usuariosFiltrados,
    limparFormNovoUsuario,
    criarNovoUsuario,
    prepararEdicaoUsuario,
    limparFormUsuario,
    salvarUsuario,
    confirmarMoverUsuarioParaLixeira,
  };
}
