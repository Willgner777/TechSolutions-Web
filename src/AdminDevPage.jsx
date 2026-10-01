import React, { useState, useEffect } from 'react';
import { supabase, criarClienteIsolado } from './Admbases';
import { 
  ShieldCheck, Building2, Users, Database, AlertTriangle, 
  Activity, ArrowUpRight, Plus, RefreshCw, CheckCircle2, 
  Edit, X, LogOut, KeyRound, Search, Clock, FileWarning,
  LayoutDashboard, ExternalLink
} from 'lucide-react';

export default function AdminDevPage({ onNavegarMenu }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Estados Globais
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rlsStatus, setRlsStatus] = useState([]);
  const [resumoAlertas, setResumoAlertas] = useState({ despesasPendentes: 0, docsVencidos: 0, avariasChecklist: 0 });

  // Filtros
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');

  // Formulário: Empresa
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');

  // Formulário: Usuário
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [roleUsuario, setRoleUsuario] = useState('admin_empresa');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');

  useEffect(() => {
    carregarDadosGlobais();

    const rlsChannel = supabase
      .channel('realtime-rls-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          carregarDadosGlobais({ manterFeedback: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rlsChannel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Função para direcionar ao menu principal / sistema
  const handleIrParaMenu = () => {
    if (typeof onNavegarMenu === 'function') {
      onNavegarMenu();
    } else {
      // Redirecionamento padrão caso não passe a prop de navegação
      window.location.href = '/menu'; 
    }
  };

  const carregarDadosGlobais = async ({ manterFeedback = false } = {}) => {
    setLoading(true);
    if (!manterFeedback) setFeedback({ type: '', message: '' });

    try {
      // 1. Busca Empresas
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (errEmpresas) throw errEmpresas;
      const empresasData = dataEmpresas || [];
      setEmpresas(empresasData);

      // 2. Busca Perfis
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (errUsuarios) throw errUsuarios;

      const usuariosMapeados = (dataUsuarios || []).map((usr) => {
        const emp = empresasData.find(e => e.id === usr.empresa_id);
        return {
          ...usr,
          empresas: emp ? { nome: emp.nome || emp.nome_fantasia } : null
        };
      });
      setUsuarios(usuariosMapeados);

      // 3. Mapeamento de métricas operacionais
      try {
        const { count: countDespesas } = await supabase
          .from('despesas')
          .select('*', { count: 'exact', head: true })
          .eq('status_aprovacao', 'pendente');

        const { count: countDocs } = await supabase
          .from('documentos_veiculos')
          .select('*', { count: 'exact', head: true })
          .lt('data_vencimento', new Date().toISOString().split('T')[0]);

        const { count: countAvarias } = await supabase
          .from('checklists')
          .select('*', { count: 'exact', head: true })
          .eq('possui_avarias', true);

        setResumoAlertas({
          despesasPendentes: countDespesas || 0,
          docsVencidos: countDocs || 0,
          avariasChecklist: countAvarias || 0
        });
      } catch (errAlerts) {
        console.warn('Alerta secundário irrelevante:', errAlerts.message);
      }

      // 4. Invocação da RPC de verificação do RLS
      try {
        const { data: rlsData, error: rlsErr } = await supabase.rpc('dev_rls_status');
        if (!rlsErr && rlsData) {
          setRlsStatus(rlsData);
        }
      } catch (e) {
        console.warn('Erro ao carregar dev_rls_status:', e.message);
      }

    } catch (err) {
      setFeedback({ type: 'error', message: 'Falha na sincronização: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- CONTROLE DE TENANTS / EMPRESAS ---
  const handleSaveEmpresa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingEmpresaId) {
        const { error } = await supabase
          .from('empresas')
          .update({ nome: nomeEmpresa, nome_fantasia: nomeEmpresa, cnpj: cnpjEmpresa, plano: planoEmpresa })
          .eq('id', editingEmpresaId);

        if (error) throw error;
        setFeedback({ type: 'success', message: 'Tenant atualizado!' });
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([{ nome: nomeEmpresa, nome_fantasia: nomeEmpresa, cnpj: cnpjEmpresa, plano: planoEmpresa, ativo: true }]);

        if (error) throw error;
        setFeedback({ type: 'success', message: `Tenant "${nomeEmpresa}" registrado!` });
      }

      resetEmpresaForm();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivoEmpresa = async (id, statusAtual) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ ativo: !statusAtual })
        .eq('id', id);

      if (error) throw error;
      setFeedback({ type: 'success', message: 'Estado da empresa alterado!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmpresa = (emp) => {
    setEditingEmpresaId(emp.id);
    setNomeEmpresa(emp.nome || emp.nome_fantasia || '');
    setCnpjEmpresa(emp.cnpj || '');
    setPlanoEmpresa(emp.plano || 'PRO');
    setActiveTab('empresas');
  };

  const resetEmpresaForm = () => {
    setEditingEmpresaId(null);
    setNomeEmpresa('');
    setCnpjEmpresa('');
    setPlanoEmpresa('PRO');
  };

  // --- CONTROLE DE USUÁRIOS E AUTENTICAÇÃO ---
  const handleSaveUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingUsuarioId) {
        const { error } = await supabase
          .from('perfis')
          .update({
            nome: nomeUsuario,
            role: roleUsuario,
            empresa_id: roleUsuario === 'super_dev' ? null : empresaIdSelecionada
          })
          .eq('id', editingUsuarioId);

        if (error) throw error;
        setFeedback({ type: 'success', message: 'Usuário atualizado com sucesso!' });
      } else {
        const { data: authData, error: authError } = await criarClienteIsolado().auth.signUp({
          email: emailUsuario,
          password: senhaUsuario,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: perfilError } = await supabase
            .from('perfis')
            .upsert([{
              id: authData.user.id,
              email: emailUsuario,
              nome: nomeUsuario,
              role: roleUsuario,
              empresa_id: roleUsuario === 'super_dev' ? null : empresaIdSelecionada,
              ativo: true
            }]);

          if (perfilError) throw perfilError;
          setFeedback({ type: 'success', message: `Credencial criada para "${nomeUsuario}"!` });
        }
      }

      resetUsuarioForm();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivoUsuario = async (id, statusAtual) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ ativo: !statusAtual })
        .eq('id', id);

      if (error) throw error;
      setFeedback({ type: 'success', message: 'Acesso alterado!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUsuario = (usr) => {
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setRoleUsuario(usr.role || 'admin_empresa');
    setEmpresaIdSelecionada(usr.empresa_id || '');
    setActiveTab('usuarios');
  };

  const resetUsuarioForm = () => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setSenhaUsuario('');
    setRoleUsuario('admin_empresa');
    setEmpresaIdSelecionada('');
  };

  const empresasFiltradas = empresas.filter(e => 
    (e.nome || e.nome_fantasia || '').toLowerCase().includes(searchEmpresa.toLowerCase()) ||
    (e.cnpj || '').includes(searchEmpresa)
  );

  const usuariosFiltrados = usuarios.filter(u => 
    (u.nome || '').toLowerCase().includes(searchUsuario.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchUsuario.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-indigo-600 font-mono text-xs uppercase tracking-wider font-semibold">
              Super Dev Console v2.4 • Multi-Tenant Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Gestão Global & Observabilidade
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* BOTÃO PARA NAVEGAR AO MENU PRINCIPAL DO SISTEMA */}
          <button
            onClick={handleIrParaMenu}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Acessar Menu Principal
          </button>

          <button
            onClick={() => carregarDadosGlobais()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Banco
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold border border-red-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Encerrar Sessão
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-6">
        {/* CARD PROMINENTE DE ACESSO AO MENU/SISTEMA */}
        <div className="mb-6 p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-800">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold mb-2">
              <ShieldCheck className="w-3 h-3" /> Modo Super Admin Ativo
            </span>
            <h2 className="text-lg font-bold">Navegar como Administrador Global</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Como <code className="text-indigo-300 font-mono">super_dev</code>, você possui permissão total de bypass de RLS para acessar todas as telas do sistema (Clientes, Veículos, Despesas, Checklists) com visão irrestrita.
            </p>
          </div>
          <button
            onClick={handleIrParaMenu}
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Acessar Sistema Completo <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* RESUMO OPERACIONAL */}
        {(resumoAlertas.despesasPendentes > 0 || resumoAlertas.docsVencidos > 0) && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumoAlertas.despesasPendentes > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">Aprovações de Despesas Pendentes</p>
                    <p className="text-xs text-amber-700">Existem {resumoAlertas.despesasPendentes} lançamentos aguardando validação nos tenants.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-300">
                  {resumoAlertas.despesasPendentes}
                </span>
              </div>
            )}

            {resumoAlertas.docsVencidos > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileWarning className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-900">Documentação de Veículos Vencida</p>
                    <p className="text-xs text-red-700">{resumoAlertas.docsVencidos} documentos expiraram e precisam de renovação.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-lg border border-red-300">
                  {resumoAlertas.docsVencidos}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Tenants Ativos</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {empresas.filter(e => e.ativo !== false).length}
                <span className="text-xs text-slate-400 font-normal ml-1">/ {empresas.length}</span>
              </h3>
            </div>
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total de Perfis</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{usuarios.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Isolamento Row-Level</p>
              <h3 className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> RLS Protegido
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Super Admins Global</p>
              <h3 className="text-2xl font-black text-indigo-900 mt-1">
                {usuarios.filter(u => u.role === 'super_dev').length}
              </h3>
            </div>
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        {feedback.message && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            {feedback.message}
          </div>
        )}

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'empresas', label: 'Tenants (Empresas)', icon: Building2 },
            { id: 'usuarios', label: 'Usuários e Perfis', icon: Users },
            { id: 'rls_health', label: 'Auditoria RLS', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-4 font-semibold text-xs sm:text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Tenants e Atividade Recente
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {empresas.map(emp => {
                  const qtdUsuarios = usuarios.filter(u => u.empresa_id === emp.id).length;
                  return (
                    <div key={emp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                            emp.ativo !== false ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'
                          }`}>
                            {emp.ativo !== false ? 'ATIVO' : 'SUSPENSO'}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            PLANO {emp.plano || 'PRO'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{emp.nome || emp.nome_fantasia}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">CNPJ: {emp.cnpj || 'Não informado'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {qtdUsuarios} Usuários
                        </span>
                        <button 
                          onClick={() => handleEditEmpresa(emp)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 text-xs cursor-pointer"
                        >
                          Gerenciar <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TENANTS */}
        {activeTab === 'empresas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  {editingEmpresaId ? 'Editar Tenant' : 'Novo Tenant'}
                </h3>
                {editingEmpresaId && (
                  <button onClick={resetEmpresaForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveEmpresa} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Razão Social / Fantasia</label>
                  <input
                    type="text"
                    required
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    placeholder="Ex: Empresa Exemplo Ltda"
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">CNPJ</label>
                  <input
                    type="text"
                    required
                    value={cnpjEmpresa}
                    onChange={(e) => setCnpjEmpresa(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Plano de Assinatura</label>
                  <select
                    value={planoEmpresa}
                    onChange={(e) => setPlanoEmpresa(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="PRO">PRO</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {loading ? 'Processando...' : editingEmpresaId ? 'Salvar Alterações' : 'Criar Tenant'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Lista de Tenants</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchEmpresa}
                    onChange={(e) => setSearchEmpresa(e.target.value)}
                    placeholder="Filtrar por nome ou CNPJ..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Razão Social</th>
                      <th className="p-3">CNPJ</th>
                      <th className="p-3">Plano</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right rounded-r-xl">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {empresasFiltradas.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-3 font-semibold text-slate-900">{emp.nome || emp.nome_fantasia}</td>
                        <td className="p-3 font-mono text-slate-500">{emp.cnpj || '-'}</td>
                        <td className="p-3">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-200">
                            {emp.plano || 'PRO'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAtivoEmpresa(emp.id, emp.ativo !== false)}
                            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono border ${
                              emp.ativo !== false 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {emp.ativo !== false ? 'ATIVO' : 'INATIVO'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleEditEmpresa(emp)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USUÁRIOS */}
        {activeTab === 'usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  {editingUsuarioId ? 'Editar Perfil' : 'Cadastrar Usuário'}
                </h3>
                {editingUsuarioId && (
                  <button onClick={resetUsuarioForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveUsuario} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {!editingUsuarioId && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">E-mail</label>
                      <input
                        type="email"
                        required
                        value={emailUsuario}
                        onChange={(e) => setEmailUsuario(e.target.value)}
                        placeholder="usuario@dominio.com"
                        className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600">Senha Provisória</label>
                      <input
                        type="password"
                        required
                        value={senhaUsuario}
                        onChange={(e) => setSenhaUsuario(e.target.value)}
                        placeholder="••••••••"
                        className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600">Perfil de Permissão</label>
                  <select
                    value={roleUsuario}
                    onChange={(e) => setRoleUsuario(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin_empresa">Admin da Empresa</option>
                    <option value="funcionario">Operacional</option>
                    <option value="super_dev">Super Dev (Acesso Global)</option>
                  </select>
                </div>

                {roleUsuario !== 'super_dev' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Vincular Tenant</label>
                    <select
                      required
                      value={empresaIdSelecionada}
                      onChange={(e) => setEmpresaIdSelecionada(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Selecione uma empresa...</option>
                      {empresas.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {loading ? 'Salvando...' : editingUsuarioId ? 'Atualizar Perfil' : 'Registrar Usuário'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Perfis de Usuários</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    placeholder="Filtrar por nome ou e-mail..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Identificação</th>
                      <th className="p-3">Tenant Associado</th>
                      <th className="p-3">Permissão</th>
                      <th className="p-3">Acesso</th>
                      <th className="p-3 text-right rounded-r-xl">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {usuariosFiltrados.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{usr.nome || 'Sem Nome'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{usr.email}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-600">
                          {usr.empresas?.nome || (usr.role === 'super_dev' ? 'Acesso Global' : '-')}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            usr.role === 'super_dev'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAtivoUsuario(usr.id, usr.ativo !== false)}
                            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono border ${
                              usr.ativo !== false 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {usr.ativo !== false ? 'ATIVO' : 'INATIVO'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleEditUsuario(usr)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RLS HEALTH */}
        {activeTab === 'rls_health' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Auditoria RLS (Row Level Security)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Valida se as políticas de isolamento de banco de dados estão ativas e protegendo as tabelas contra vazamentos entre empresas.
                </p>
              </div>
              <button
                onClick={() => carregarDadosGlobais()}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
              </button>
            </div>

            {rlsStatus.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Nenhum registro de auditoria RLS encontrado.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Certifique-se de executar a função <code className="font-mono text-indigo-600">dev_rls_status()</code> no PostgreSQL.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Tabela do Schema</th>
                      <th className="p-3 text-center">Status RLS</th>
                      <th className="p-3">Policies Configuradas</th>
                      <th className="p-3 text-right rounded-r-xl">Comando</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {rlsStatus.map((row, idx) => {
                      const isEnabled = Boolean(row.rowsecurity);
                      return (
                        <tr key={`${row.tablename}-${row.policyname}-${idx}`} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{row.tablename}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                              isEnabled 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-red-50 text-red-700 border-red-300'
                            }`}>
                              {isEnabled ? 'HABILITADO' : 'DESABILITADO'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            {row.policyname || <span className="text-slate-400 italic">Nenhuma política atribuída</span>}
                          </td>
                          <td className="p-3 text-right text-indigo-600 font-semibold">
                            {row.cmd || 'ALL'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}