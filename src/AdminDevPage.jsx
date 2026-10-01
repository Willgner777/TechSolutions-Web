import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  ShieldCheck, Building2, Users, RefreshCw, Edit, Trash2, X, LogOut, Search,
  Power, GitBranch, Trash, UserPlus, FileText
} from 'lucide-react';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const fmtData = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '-');

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'empresas' | 'contratos' | 'lixeira'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // ESTADOS: Empresas e Filiais
  const [empresas, setEmpresas] = useState([]);
  const [empresasLixeira, setEmpresasLixeira] = useState([]);
  const [exibirFormEmpresa, setExibirFormEmpresa] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [ufEmpresa, setUfEmpresa] = useState('SP');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');
  const [tipoEmpresa, setTipoEmpresa] = useState('MATRIZ');
  const [matrizIdSelecionada, setMatrizIdSelecionada] = useState('');

  // ESTADOS: Contratos
  const [contratos, setContratos] = useState([]);
  const [contratosLixeira, setContratosLixeira] = useState([]);
  const [exibirFormContrato, setExibirFormContrato] = useState(false);
  const [editingContratoId, setEditingContratoId] = useState(null);
  const [nomeContrato, setNomeContrato] = useState('');
  const [ufContrato, setUfContrato] = useState('');
  const [empresaContratoId, setEmpresaContratoId] = useState('');
  const [buscaContrato, setBuscaContrato] = useState('');
  const [filtroEmpresaContrato, setFiltroEmpresaContrato] = useState('');

  // ESTADOS: Usuários / Funcionários (Edição)
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLixeira, setUsuariosLixeira] = useState([]);
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [ativoUsuario, setAtivoUsuario] = useState(true);
  const [roleUsuario, setRoleUsuario] = useState('funcionario');
  const [cargoUsuario, setCargoUsuario] = useState('');
  const [contratoUsuario, setContratoUsuario] = useState('');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');

  // ESTADOS: Filtros da lista de usuários
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [filtroEmpresaUsuario, setFiltroEmpresaUsuario] = useState('');
  const [filtroRoleUsuario, setFiltroRoleUsuario] = useState('');
  const [filtroStatusUsuario, setFiltroStatusUsuario] = useState('');

  // ESTADOS: Novo Usuário / Funcionário (Cadastro)
  const [exibirFormNovoUsuario, setExibirFormNovoUsuario] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoRole, setNovoRole] = useState('funcionario');
  const [novoCargo, setNovoCargo] = useState('');
  const [novoContrato, setNovoContrato] = useState('');
  const [novaEmpresaId, setNovaEmpresaId] = useState('');

  useEffect(() => {
    carregarDadosGlobais();
  }, []);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (err) {}
    window.location.href = '/';
  };

  const carregarDadosGlobais = async ({ manterFeedback = false } = {}) => {
    setLoading(true);
    if (!manterFeedback) setFeedback({ type: '', message: '' });

    try {
      // 1. Carregar Empresas (ativas e lixeira)
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });
      if (errEmpresas) throw errEmpresas;
      const todasEmpresas = dataEmpresas || [];
      const empresasAtivas = todasEmpresas.filter(e => !e.deleted_at);
      setEmpresas(empresasAtivas);
      setEmpresasLixeira(todasEmpresas.filter(e => e.deleted_at));

      // 2. Carregar Usuários (ativos e lixeira)
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });
      if (errUsuarios) throw errUsuarios;
      const todosUsuarios = dataUsuarios || [];
      setUsuariosLixeira(todosUsuarios.filter(u => u.deleted_at));

      const usuariosMapeados = todosUsuarios
        .filter(u => !u.deleted_at)
        .map(usr => {
          const emp = empresasAtivas.find(e => e.id === usr.empresa_id);
          return {
            ...usr,
            empresas: emp ? { nome: emp.nome || emp.nome_fantasia } : null
          };
        });
      setUsuarios(usuariosMapeados);

      // 3. Carregar Contratos (ativos e lixeira)
      const { data: dataContratos, error: errContratos } = await supabase
        .from('contratos')
        .select('*')
        .order('created_at', { ascending: false });
      if (errContratos) throw errContratos;
      const todosContratos = dataContratos || [];
      setContratos(todosContratos.filter(c => !c.deleted_at));
      setContratosLixeira(todosContratos.filter(c => c.deleted_at));

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- AUXILIARES ---
  const nomeDaEmpresa = (id) => {
    const emp = [...empresas, ...empresasLixeira].find(e => e.id === id);
    return emp ? (emp.nome || emp.nome_fantasia) : null;
  };

  const contratosDaEmpresa = (empId) => contratos.filter(c => c.empresa_id === empId);

  const renderOpcoesContrato = (empId, valorAtual) => {
    const lista = empId ? contratosDaEmpresa(empId) : [];
    const existe = lista.some(c => c.nome_contrato === valorAtual);
    return (
      <>
        <option value="">Selecione um contrato...</option>
        {valorAtual && !existe && <option value={valorAtual}>{valorAtual}</option>}
        {lista.map(c => (
          <option key={c.id} value={c.nome_contrato}>
            {c.nome_contrato}{c.estado_uf ? ` - ${c.estado_uf}` : ''}
          </option>
        ))}
      </>
    );
  };

  const moverParaLixeira = async (tabela, id, rotulo) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from(tabela)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: `${rotulo} movido para a Lixeira!` });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao mover para lixeira: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const restaurarDaLixeira = async (tabela, id, rotulo) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from(tabela)
        .update({ deleted_at: null })
        .eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: `${rotulo} restaurado com sucesso!` });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao restaurar: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- MÉTODOS DE EMPRESAS ---
  const limparFormEmpresa = () => {
    setEditingEmpresaId(null);
    setNomeEmpresa('');
    setCnpjEmpresa('');
    setUfEmpresa('SP');
    setPlanoEmpresa('PRO');
    setTipoEmpresa('MATRIZ');
    setMatrizIdSelecionada('');
    setExibirFormEmpresa(false);
  };

  const prepararEdicaoEmpresa = (emp) => {
    setEditingEmpresaId(emp.id);
    setNomeEmpresa(emp.nome || emp.nome_fantasia || '');
    setCnpjEmpresa(emp.cnpj || '');
    setUfEmpresa(emp.uf || 'SP');
    setPlanoEmpresa(emp.plano || 'PRO');
    setTipoEmpresa(emp.matriz_id ? 'FILIAL' : 'MATRIZ');
    setMatrizIdSelecionada(emp.matriz_id || '');
    setExibirFormEmpresa(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salvarEmpresa = async (e) => {
    e.preventDefault();
    if (!nomeEmpresa.trim()) return setFeedback({ type: 'error', message: 'Insira o nome da empresa.' });

    setLoading(true);
    try {
      const payload = {
        nome: nomeEmpresa,
        cnpj: cnpjEmpresa,
        uf: ufEmpresa,
        plano: planoEmpresa,
        matriz_id: tipoEmpresa === 'FILIAL' ? (matrizIdSelecionada || null) : null
      };

      if (editingEmpresaId) {
        // Na edição não mexe no status ativo/inativo
        const { error } = await supabase.from('empresas').update(payload).eq('id', editingEmpresaId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('empresas').insert([{ ...payload, ativo: true }]);
        if (error) throw error;
      }

      setFeedback({ type: 'success', message: 'Empresa / Filial salva com sucesso!' });
      limparFormEmpresa();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar empresa: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const alternarAtivoEmpresa = async (emp) => {
    const novoStatus = emp.ativo === false;
    setLoading(true);
    try {
      const { error } = await supabase.from('empresas').update({ ativo: novoStatus }).eq('id', emp.id);
      if (error) throw error;
      setFeedback({ type: 'success', message: novoStatus ? 'Empresa ativada!' : 'Empresa desativada!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao alterar status: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const excluirEmpresa = async (emp) => {
    const qtdUsuarios = usuarios.filter(u => u.empresa_id === emp.id).length;
    const qtdContratos = contratosDaEmpresa(emp.id).length;
    const nome = emp.nome || emp.nome_fantasia;
    if (!window.confirm(`Mover "${nome}" para a Lixeira?\nVinculados: ${qtdUsuarios} utilizador(es) e ${qtdContratos} contrato(s).`)) return;
    moverParaLixeira('empresas', emp.id, 'Empresa');
  };

  // --- MÉTODOS DE CONTRATOS ---
  const limparFormContrato = () => {
    setEditingContratoId(null);
    setNomeContrato('');
    setUfContrato('');
    setEmpresaContratoId('');
    setExibirFormContrato(false);
  };

  const prepararEdicaoContrato = (c) => {
    setEditingContratoId(c.id);
    setNomeContrato(c.nome_contrato || '');
    setUfContrato(c.estado_uf || '');
    setEmpresaContratoId(c.empresa_id || '');
    setExibirFormContrato(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salvarContrato = async (e) => {
    e.preventDefault();
    if (!empresaContratoId) return setFeedback({ type: 'error', message: 'Selecione a empresa do contrato.' });
    if (!nomeContrato.trim()) return setFeedback({ type: 'error', message: 'Informe o nome do contrato.' });

    setLoading(true);
    try {
      const payload = {
        nome_contrato: nomeContrato.trim(),
        estado_uf: ufContrato || null,
        empresa_id: empresaContratoId
      };

      if (editingContratoId) {
        const { error } = await supabase.from('contratos').update(payload).eq('id', editingContratoId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contratos').insert([payload]);
        if (error) throw error;
      }

      setFeedback({ type: 'success', message: 'Contrato salvo com sucesso!' });
      limparFormContrato();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar contrato: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- MÉTODOS DE USUÁRIOS ---
  const limparFormNovoUsuario = () => {
    setNovoNome('');
    setNovoEmail('');
    setNovaSenha('');
    setNovoRole('funcionario');
    setNovoCargo('');
    setNovoContrato('');
    setNovaEmpresaId('');
    setExibirFormNovoUsuario(false);
  };

  const criarNovoUsuario = async (e) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) {
      return setFeedback({ type: 'error', message: 'Preencha Nome, E-mail e Senha.' });
    }

    setLoading(true);
    try {
      // 1. Cadastrar na autenticação Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: novoEmail,
        password: novaSenha,
        options: {
          data: {
            nome: novoNome,
            role: novoRole
          }
        }
      });

      if (authError) throw authError;

      // 2. Inserir/Atualizar na tabela de perfis
      if (authData.user) {
        const { error: perfilError } = await supabase
          .from('perfis')
          .upsert([{
            id: authData.user.id,
            nome: novoNome,
            email: novoEmail,
            role: novoRole,
            cargo: novoCargo,
            contrato: novoContrato,
            empresa_id: novoRole === 'super_dev' ? null : (novaEmpresaId || null),
            ativo: true
          }]);

        if (perfilError) throw perfilError;
      }

      setFeedback({ type: 'success', message: 'Novo funcionário cadastrado com sucesso!' });
      limparFormNovoUsuario();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao cadastrar funcionário: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const prepararEdicaoUsuario = (usr) => {
    setExibirFormNovoUsuario(false);
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setAtivoUsuario(usr.ativo !== false);
    setRoleUsuario(usr.role || 'funcionario');
    setCargoUsuario(usr.cargo || '');
    setContratoUsuario(usr.contrato || '');
    setEmpresaIdSelecionada(usr.empresa_id || '');
  };

  const limparFormUsuario = () => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setAtivoUsuario(true);
    setRoleUsuario('funcionario');
    setCargoUsuario('');
    setContratoUsuario('');
    setEmpresaIdSelecionada('');
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    if (!editingUsuarioId) return;

    setLoading(true);
    try {
      const { error: perfilError } = await supabase
        .from('perfis')
        .update({
          nome: nomeUsuario,
          email: emailUsuario,
          role: roleUsuario,
          cargo: cargoUsuario,
          contrato: contratoUsuario,
          empresa_id: roleUsuario === 'super_dev' ? null : (empresaIdSelecionada || null),
          ativo: ativoUsuario
        })
        .eq('id', editingUsuarioId);

      if (perfilError) throw perfilError;

      setFeedback({ type: 'success', message: 'Dados do utilizador salvos com sucesso!' });
      limparFormUsuario();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const MoverParaLixeira = (id) => {
    if (!window.confirm('Deseja mover este utilizador para a Lixeira?')) return;
    moverParaLixeira('perfis', id, 'Utilizador');
  };

  const empresasMatrizes = empresas.filter(e => !e.matriz_id);

  // --- DADOS DERIVADOS ---
  const totalAtivos = usuarios.filter(u => u.ativo !== false).length;
  const totalInativos = usuarios.length - totalAtivos;
  const totalSemEmpresa = usuarios.filter(u => u.role !== 'super_dev' && !u.empresas).length;
  const totalLixeira = usuariosLixeira.length + empresasLixeira.length + contratosLixeira.length;

  const usuariosFiltrados = usuarios.filter(u => {
    const termo = buscaUsuario.toLowerCase();
    const okBusca = !termo ||
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo) ||
      (u.cargo || '').toLowerCase().includes(termo);
    const okEmpresa = !filtroEmpresaUsuario ||
      (filtroEmpresaUsuario === 'sem' ? (u.role !== 'super_dev' && !u.empresas) : u.empresa_id === filtroEmpresaUsuario);
    const okRole = !filtroRoleUsuario || u.role === filtroRoleUsuario;
    const okStatus = !filtroStatusUsuario ||
      (filtroStatusUsuario === 'ativo' ? u.ativo !== false : u.ativo === false);
    return okBusca && okEmpresa && okRole && okStatus;
  });

  const contratosFiltrados = contratos.filter(c => {
    const termo = buscaContrato.toLowerCase();
    const okBusca = !termo ||
      (c.nome_contrato || '').toLowerCase().includes(termo) ||
      (c.estado_uf || '').toLowerCase().includes(termo);
    const okEmpresa = !filtroEmpresaContrato || c.empresa_id === filtroEmpresaContrato;
    return okBusca && okEmpresa;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <span className="text-white font-black text-2xl tracking-tighter">W</span>
            </div>
            <div className="space-y-1">
              <span className="px-3 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs rounded-full font-mono font-bold">
                SUPER DEV CONSOLE
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Gestão Central de Acessos</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button onClick={() => carregarDadosGlobais()} className="flex items-center gap-2 px-5 py-3 bg-purple-50 text-purple-700 rounded-2xl text-sm font-semibold border border-purple-200">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar Dados
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-200">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {/* RESUMO GERAL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" /> Empresas
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{empresas.length}</p>
            <p className="text-[11px] text-slate-500">{empresasMatrizes.length} matriz(es) · {empresas.length - empresasMatrizes.length} filial(is)</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Utilizadores
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{usuarios.length}</p>
            <p className="text-[11px] text-slate-500">{totalAtivos} ativo(s) · {totalInativos} inativo(s)</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" /> Contratos
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{contratos.length}</p>
            <p className="text-[11px] text-slate-500">cadastrados nas empresas</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Sem empresa
            </p>
            <p className={`text-2xl font-bold mt-2 ${totalSemEmpresa > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{totalSemEmpresa}</p>
            <p className="text-[11px] text-slate-500">utilizadores sem vínculo</p>
          </div>
        </div>

        {/* FEEDBACK */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between ${
            feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* MUDANÇA DE ABAS */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'usuarios' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Users className="w-4 h-4" /> Gestão de Utilizadores ({usuarios.length})
          </button>

          <button
            onClick={() => setActiveTab('empresas')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'empresas' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Building2 className="w-4 h-4" /> Empresas & Filiais ({empresas.length})
          </button>

          <button
            onClick={() => setActiveTab('contratos')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'contratos' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <FileText className="w-4 h-4" /> Contratos ({contratos.length})
          </button>

          <button
            onClick={() => setActiveTab('lixeira')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'lixeira' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:bg-red-50'
            }`}
          >
            <Trash className="w-4 h-4" /> Lixeira ({totalLixeira})
          </button>
        </div>

        {/* TAB 1: UTILIZADORES */}
        {activeTab === 'usuarios' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* BOTÃO PARA ABRIR O FORMULÁRIO DE NOVO FUNCIONÁRIO */}
            {!exibirFormNovoUsuario && !editingUsuarioId && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Lista de Utilizadores</h3>
                <button
                  onClick={() => {
                    limparFormUsuario();
                    setExibirFormNovoUsuario(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold hover:bg-purple-700 transition"
                >
                  <UserPlus className="w-4 h-4" /> Novo Funcionário
                </button>
              </div>
            )}

            {/* FORMULÁRIO DE CADASTRO: NOVO FUNCIONÁRIO */}
            {exibirFormNovoUsuario && (
              <form onSubmit={criarNovoUsuario} className="bg-purple-50/50 border border-purple-200 p-6 rounded-2xl space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-600" /> Cadastrar Novo Funcionário / Usuário
                  </h3>
                  <button type="button" onClick={limparFormNovoUsuario} className="text-slate-500 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Nome Completo *</label>
                    <input type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">E-mail *</label>
                    <input type="email" required value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="joao@empresa.com" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Senha Provisória *</label>
                    <input type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Permissão (Role)</label>
                    <select value={novoRole} onChange={(e) => setNovoRole(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                      <option value="funcionario">funcionario</option>
                      <option value="admin_empresa">admin_empresa</option>
                      <option value="super_dev">super_dev (Acesso Total)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Empresa / Filial Vinculada</label>
                    <select 
                      value={novaEmpresaId} 
                      onChange={(e) => { setNovaEmpresaId(e.target.value); setNovoContrato(''); }} 
                      disabled={novoRole === 'super_dev'}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Nenhuma / Sem Empresa</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nome || emp.nome_fantasia} {emp.matriz_id ? '(Filial)' : '(Matriz)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Cargo Operacional</label>
                    <input type="text" value={novoCargo} onChange={(e) => setNovoCargo(e.target.value)} placeholder="Ex: Motorista, Gerente" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Contrato Vinculado</label>
                    <select
                      value={novoContrato}
                      onChange={(e) => setNovoContrato(e.target.value)}
                      disabled={novoRole === 'super_dev' || !novaEmpresaId}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {renderOpcoesContrato(novoRole === 'super_dev' ? '' : novaEmpresaId, novoContrato)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={limparFormNovoUsuario} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">Cadastrar Funcionário</button>
                </div>
              </form>
            )}

            {/* FORMULÁRIO DE EDIÇÃO */}
            {editingUsuarioId && (
              <form onSubmit={salvarUsuario} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-5">
                <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Editar Perfil / Funcionário
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Nome</label>
                    <input type="text" value={nomeUsuario} onChange={(e) => setNomeUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">E-mail (Editável)</label>
                    <input type="email" value={emailUsuario} onChange={(e) => setEmailUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Permissão (Role)</label>
                    <select value={roleUsuario} onChange={(e) => setRoleUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                      <option value="super_dev">super_dev (Acesso Total)</option>
                      <option value="admin_empresa">admin_empresa</option>
                      <option value="funcionario">funcionario</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Empresa / Filial Vinculada {roleUsuario === 'super_dev' && '(Não aplicável ao Super Dev)'}
                    </label>
                    <select 
                      value={empresaIdSelecionada} 
                      onChange={(e) => { setEmpresaIdSelecionada(e.target.value); setContratoUsuario(''); }} 
                      disabled={roleUsuario === 'super_dev'}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Nenhuma / Sem Empresa</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nome || emp.nome_fantasia} {emp.matriz_id ? '(Filial)' : '(Matriz)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Cargo Operacional</label>
                    <input type="text" value={cargoUsuario} onChange={(e) => setCargoUsuario(e.target.value)} placeholder="Ex: Motorista, Gerente" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Contrato Vinculado</label>
                    <select
                      value={contratoUsuario}
                      onChange={(e) => setContratoUsuario(e.target.value)}
                      disabled={roleUsuario === 'super_dev' || !empresaIdSelecionada}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {renderOpcoesContrato(roleUsuario === 'super_dev' ? '' : empresaIdSelecionada, contratoUsuario)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Status de Acesso</label>
                    <button
                      type="button"
                      onClick={() => setAtivoUsuario(!ativoUsuario)}
                      className={`w-full py-3 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-between ${
                        ativoUsuario ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                      }`}
                    >
                      <span>{ativoUsuario ? 'Utilizador Ativo' : 'Utilizador Inativo'}</span>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={limparFormUsuario} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
                  <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">Atualizar Utilizador</button>
                </div>
              </form>
            )}

            {/* BUSCA E FILTROS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={buscaUsuario}
                  onChange={(e) => setBuscaUsuario(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou cargo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
                />
              </div>
              <select value={filtroEmpresaUsuario} onChange={(e) => setFiltroEmpresaUsuario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
                <option value="">Todas as empresas</option>
                <option value="sem">Sem empresa vinculada</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                ))}
              </select>
              <select value={filtroRoleUsuario} onChange={(e) => setFiltroRoleUsuario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
                <option value="">Todas as permissões</option>
                <option value="super_dev">super_dev</option>
                <option value="admin_empresa">admin_empresa</option>
                <option value="funcionario">funcionario</option>
              </select>
              <select value={filtroStatusUsuario} onChange={(e) => setFiltroStatusUsuario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>

            {/* TABELA DE USUÁRIOS */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-4 px-5">Nome</th>
                    <th className="py-4 px-5">E-mail</th>
                    <th className="py-4 px-5">Empresa / Unidade</th>
                    <th className="py-4 px-5">Permissão</th>
                    <th className="py-4 px-5">Cargo</th>
                    <th className="py-4 px-5">Contrato</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuariosFiltrados.length > 0 ? usuariosFiltrados.map(usr => (
                    <tr key={usr.id} className="hover:bg-purple-50/30">
                      <td className="py-4 px-5 font-semibold text-slate-800">{usr.nome || 'Sem nome'}</td>
                      <td className="py-4 px-5 text-slate-600">{usr.email || 'Não informado'}</td>
                      <td className="py-4 px-5">
                        {usr.role === 'super_dev' ? (
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">
                            Global (Super Dev)
                          </span>
                        ) : usr.empresas?.nome ? (
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-purple-600" />
                            {usr.empresas.nome}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded">
                            Sem Empresa Vinculada
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-slate-600">{usr.role || '-'}</td>
                      <td className="py-4 px-5 text-slate-700">{usr.cargo || '-'}</td>
                      <td className="py-4 px-5 text-slate-700">{usr.contrato || '-'}</td>
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${
                          usr.ativo !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {usr.ativo !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button onClick={() => prepararEdicaoUsuario(usr)} className="p-2 bg-slate-100 text-purple-700 rounded-xl border border-slate-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => MoverParaLixeira(usr.id)} className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">Nenhum utilizador encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EMPRESAS & FILIAIS */}
        {activeTab === 'empresas' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* BOTÃO PARA ABRIR O FORMULÁRIO */}
            {!exibirFormEmpresa && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Empresas e Filiais Cadastradas</h3>
                <button
                  onClick={() => {
                    limparFormEmpresa();
                    setExibirFormEmpresa(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold hover:bg-purple-700 transition"
                >
                  <Building2 className="w-4 h-4" /> Nova Empresa / Filial
                </button>
              </div>
            )}

            {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
            {exibirFormEmpresa && (
              <form onSubmit={salvarEmpresa} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    {editingEmpresaId ? 'Editar Empresa / Filial' : 'Cadastrar Empresa / Filial'}
                  </h3>
                  <button type="button" onClick={limparFormEmpresa} className="text-slate-500 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Tipo de Cadastro</label>
                    <select 
                      value={tipoEmpresa} 
                      onChange={(e) => setTipoEmpresa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-purple-700"
                    >
                      <option value="MATRIZ">Empresa Mãe (Matriz)</option>
                      <option value="FILIAL">Filial Vinculada</option>
                    </select>
                  </div>

                  {tipoEmpresa === 'FILIAL' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Selecione a Empresa Mãe (Matriz)</label>
                      <select 
                        value={matrizIdSelecionada} 
                        onChange={(e) => setMatrizIdSelecionada(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
                      >
                        <option value="">Selecione uma Matriz...</option>
                        {empresasMatrizes.filter(m => m.id !== editingEmpresaId).map(m => (
                          <option key={m.id} value={m.id}>{m.nome || m.nome_fantasia}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Razão Social / Nome Fantasia *</label>
                    <input 
                      type="text" 
                      required 
                      value={nomeEmpresa} 
                      onChange={(e) => setNomeEmpresa(e.target.value)} 
                      placeholder="Ex: Transportadora K-Log Ltda"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">CNPJ</label>
                    <input 
                      type="text" 
                      value={cnpjEmpresa} 
                      onChange={(e) => setCnpjEmpresa(e.target.value)} 
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">UF (Estado)</label>
                    <input 
                      type="text" 
                      value={ufEmpresa} 
                      onChange={(e) => setUfEmpresa(e.target.value.toUpperCase())} 
                      placeholder="SP"
                      maxLength={2}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Plano de Assinatura</label>
                    <select 
                      value={planoEmpresa} 
                      onChange={(e) => setPlanoEmpresa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
                    >
                      <option value="BASIC">BASIC (Até 5 veículos)</option>
                      <option value="PRO">PRO (Até 20 veículos)</option>
                      <option value="ENTERPRISE">ENTERPRISE (Ilimitado)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={limparFormEmpresa} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">
                    {editingEmpresaId ? 'Atualizar Registro' : 'Cadastrar Empresa / Filial'}
                  </button>
                </div>
              </form>
            )}

            {/* TABELA DE EMPRESAS */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-4 px-5">Empresa / Unidade</th>
                    <th className="py-4 px-5">CNPJ / UF</th>
                    <th className="py-4 px-5">Plano</th>
                    <th className="py-4 px-5">Vínculos</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empresas.length > 0 ? empresas.map(emp => {
                    const ehFilial = !!emp.matriz_id;
                    const empresaMae = ehFilial ? empresas.find(m => m.id === emp.matriz_id) : null;
                    const empAtiva = emp.ativo !== false;
                    const qtdUsuarios = usuarios.filter(u => u.empresa_id === emp.id).length;
                    const qtdContratos = contratosDaEmpresa(emp.id).length;

                    return (
                      <tr key={emp.id} className="hover:bg-purple-50/30">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-800">{emp.nome || emp.nome_fantasia}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              ehFilial ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {ehFilial ? 'Filial' : 'Matriz'}
                            </span>
                            {ehFilial && (
                              <span className="text-[11px] text-purple-600 flex items-center gap-1">
                                <GitBranch className="w-3 h-3" /> de {empresaMae?.nome || 'Matriz'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-slate-600">{emp.cnpj || 'Não informado'}</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                              {emp.uf || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{emp.plano || 'PRO'}</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-4 text-slate-700 whitespace-nowrap">
                            <span className="flex items-center gap-1.5" title="Utilizadores">
                              <Users className="w-3.5 h-3.5 text-purple-600" /> <span className="font-bold">{qtdUsuarios}</span>
                            </span>
                            <span className="flex items-center gap-1.5" title="Contratos">
                              <FileText className="w-3.5 h-3.5 text-purple-600" /> <span className="font-bold">{qtdContratos}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold border whitespace-nowrap ${
                            empAtiva ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {empAtiva ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => alternarAtivoEmpresa(emp)} title={empAtiva ? 'Desativar' : 'Ativar'} className={`p-2 rounded-xl border ${empAtiva ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              <Power className="w-4 h-4" />
                            </button>
                            <button onClick={() => prepararEdicaoEmpresa(emp)} title="Editar" className="p-2 bg-slate-100 text-purple-700 rounded-xl border border-slate-200">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => excluirEmpresa(emp)} title="Mover para a lixeira" className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">Nenhuma empresa cadastrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CONTRATOS */}
        {activeTab === 'contratos' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* BOTÃO PARA ABRIR O FORMULÁRIO DE NOVO CONTRATO */}
            {!exibirFormContrato && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Lista de Contratos</h3>
                <button
                  onClick={() => {
                    limparFormContrato();
                    setExibirFormContrato(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold hover:bg-purple-700 transition"
                >
                  <FileText className="w-4 h-4" /> Novo Contrato
                </button>
              </div>
            )}

            {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
            {exibirFormContrato && (
              <form onSubmit={salvarContrato} className={`p-6 rounded-2xl space-y-5 border ${
                editingContratoId ? 'bg-slate-50 border-slate-200' : 'bg-purple-50/50 border-purple-200'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    editingContratoId ? 'text-purple-700' : 'text-purple-900'
                  }`}>
                    <FileText className="w-4 h-4 text-purple-600" />
                    {editingContratoId ? 'Editar Contrato' : 'Cadastrar Novo Contrato'}
                  </h3>
                  <button type="button" onClick={limparFormContrato} className="text-slate-500 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Empresa / Filial *</label>
                    <select
                      value={empresaContratoId}
                      onChange={(e) => setEmpresaContratoId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
                    >
                      <option value="">Selecione a empresa...</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nome || emp.nome_fantasia} {emp.matriz_id ? '(Filial)' : '(Matriz)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Nome do Contrato *</label>
                    <input
                      type="text"
                      required
                      value={nomeContrato}
                      onChange={(e) => setNomeContrato(e.target.value)}
                      placeholder="Ex: Contrato SP-01"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Estado (UF)</label>
                    <select
                      value={ufContrato}
                      onChange={(e) => setUfContrato(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
                    >
                      <option value="">Selecione o Estado...</option>
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={limparFormContrato} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">
                    {editingContratoId ? 'Atualizar Contrato' : 'Cadastrar Contrato'}
                  </button>
                </div>
              </form>
            )}

            {/* BUSCA E FILTROS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={buscaContrato}
                  onChange={(e) => setBuscaContrato(e.target.value)}
                  placeholder="Buscar por nome ou UF..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
                />
              </div>
              <select value={filtroEmpresaContrato} onChange={(e) => setFiltroEmpresaContrato(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
                <option value="">Todas as empresas</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                ))}
              </select>
            </div>

            {/* TABELA DE CONTRATOS */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-4 px-5">Contrato</th>
                    <th className="py-4 px-5">Empresa / Unidade</th>
                    <th className="py-4 px-5">UF</th>
                    <th className="py-4 px-5">Criado em</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contratosFiltrados.length > 0 ? contratosFiltrados.map(c => (
                    <tr key={c.id} className="hover:bg-purple-50/30">
                      <td className="py-4 px-5 font-semibold text-slate-800">{c.nome_contrato}</td>
                      <td className="py-4 px-5">
                        {nomeDaEmpresa(c.empresa_id) ? (
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-purple-600" />
                            {nomeDaEmpresa(c.empresa_id)}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded">
                            Sem Empresa Vinculada
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-700">{c.estado_uf || '-'}</td>
                      <td className="py-4 px-5 text-slate-600">{fmtData(c.created_at)}</td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button onClick={() => prepararEdicaoContrato(c)} className="p-2 bg-slate-100 text-purple-700 rounded-xl border border-slate-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Mover este contrato para a Lixeira?')) moverParaLixeira('contratos', c.id, 'Contrato');
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">Nenhum contrato encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LIXEIRA */}
        {activeTab === 'lixeira' && (
          <div className="space-y-8">

            {/* LIXEIRA: UTILIZADORES */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trash className="w-4 h-4 text-red-600" /> Utilizadores Removidos ({usuariosLixeira.length})
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-4">E-mail</th>
                      <th className="py-3 px-4">Empresa</th>
                      <th className="py-3 px-4">Removido em</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuariosLixeira.length > 0 ? usuariosLixeira.map(usr => (
                      <tr key={usr.id}>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{usr.nome}</td>
                        <td className="py-3.5 px-4 text-slate-600">{usr.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{nomeDaEmpresa(usr.empresa_id) || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{fmtData(usr.deleted_at)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => restaurarDaLixeira('perfis', usr.id, 'Utilizador')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-400">Nenhum utilizador na lixeira.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LIXEIRA: EMPRESAS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trash className="w-4 h-4 text-red-600" /> Empresas Removidas ({empresasLixeira.length})
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                      <th className="py-3 px-4">Empresa</th>
                      <th className="py-3 px-4">CNPJ</th>
                      <th className="py-3 px-4">Removida em</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empresasLixeira.length > 0 ? empresasLixeira.map(emp => (
                      <tr key={emp.id}>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{emp.nome || emp.nome_fantasia}</td>
                        <td className="py-3.5 px-4 text-slate-600">{emp.cnpj || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{fmtData(emp.deleted_at)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => restaurarDaLixeira('empresas', emp.id, 'Empresa')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-400">Nenhuma empresa na lixeira.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LIXEIRA: CONTRATOS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trash className="w-4 h-4 text-red-600" /> Contratos Removidos ({contratosLixeira.length})
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                      <th className="py-3 px-4">Contrato</th>
                      <th className="py-3 px-4">Empresa</th>
                      <th className="py-3 px-4">Removido em</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contratosLixeira.length > 0 ? contratosLixeira.map(c => (
                      <tr key={c.id}>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{c.nome_contrato}</td>
                        <td className="py-3.5 px-4 text-slate-600">{nomeDaEmpresa(c.empresa_id) || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{fmtData(c.deleted_at)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => restaurarDaLixeira('contratos', c.id, 'Contrato')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-400">Nenhum contrato na lixeira.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}