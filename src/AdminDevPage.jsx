import React, { useState, useEffect } from 'react';
import { supabase, criarClienteIsolado } from './Admbases';
import { 
  ShieldCheck, Building2, Users, Database, AlertTriangle, 
  Activity, ArrowUpRight, Plus, RefreshCw, CheckCircle2, 
  XCircle, Edit, Trash2, X, LogOut, KeyRound, Lock,
  Search, ExternalLink, UserCheck, UserX, Clock, FileWarning
} from 'lucide-react';

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'empresas' | 'usuarios' | 'rls_health'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Estados Globais de Dados
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rlsStatus, setRlsStatus] = useState([]);
  const [resumoAlertas, setResumoAlertas] = useState({ despesasPendentes: 0, docsVencidos: 0, avariasChecklist: 0 });

  // Filtros de Busca
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');

  // Form States: Empresa
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');

  // Form States: Usuário
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [roleUsuario, setRoleUsuario] = useState('admin_empresa');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');

  useEffect(() => {
    carregarDadosGlobais();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const carregarDadosGlobais = async ({ manterFeedback = false } = {}) => {
    setLoading(true);
    if (!manterFeedback) setFeedback({ type: '', message: '' });

    try {
      // 1. Carregar Empresas
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });
      if (errEmpresas) throw errEmpresas;
      setEmpresas(dataEmpresas || []);

      // 2. Carregar Perfis
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });
      if (errUsuarios) throw errUsuarios;

      const usuariosMapeados = (dataUsuarios || []).map(usr => {
        const emp = (dataEmpresas || []).find(e => e.id === usr.empresa_id);
        return {
          ...usr,
          empresas: emp ? { nome: emp.nome || emp.nome_fantasia } : null
        };
      });
      setUsuarios(usuariosMapeados);

      // 3. Tentar carregar métricas de Alertas Globais (Se as tabelas existirem)
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
        console.warn('Erro ao carregar métricas secundárias:', errAlerts.message);
      }

      // 4. Checar Status de RLS via RPC (caso a função exista)
      try {
        const { data: rlsData, error: rlsErr } = await supabase.rpc('dev_rls_status');
        if (!rlsErr && rlsData) setRlsStatus(rlsData);
      } catch (e) {
        // Fallback caso a procedure ainda não tenha sido rodada no SQL
      }

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS DA EMPRESA ---
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
        setFeedback({ type: 'success', message: 'Empresa atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([{ nome: nomeEmpresa, nome_fantasia: nomeEmpresa, cnpj: cnpjEmpresa, plano: planoEmpresa, ativo: true }]);

        if (error) throw error;
        setFeedback({ type: 'success', message: `Empresa "${nomeEmpresa}" criada com sucesso!` });
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
      setFeedback({ type: 'success', message: `Status da empresa alterado com sucesso!` });
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

  // --- HANDLERS DO USUÁRIO ---
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
        setFeedback({ type: 'success', message: 'Perfil do usuário atualizado!' });
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
          setFeedback({ type: 'success', message: `Usuário "${nomeUsuario}" criado com sucesso!` });
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
      setFeedback({ type: 'success', message: `Acesso do usuário alterado!` });
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

  // Listas filtradas
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
      {/* 1. HEADER ENTERPRISE */}
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

        <div className="flex items-center gap-3">
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
        {/* 2. ALERTAS TÉCNICOS OPERACIONAIS */}
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

        {/* 3. METRICAS / NOC METRICS */}
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
              <p className="text-xs text-slate-500 font-medium">Total de Credenciais</p>
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
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> RLS Ativo no Schema
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

        {/* FEEDBACK BANNER */}
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

        {/* 4. TABS NAVEGAÇÃO */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          {[
            { id: 'overview', label: 'Visão Geral do Ecossistema', icon: Activity },
            { id: 'empresas', label: 'Gestão de Tenants (Empresas)', icon: Building2 },
            { id: 'usuarios', label: 'Perfis e Credenciais', icon: Users },
            { id: 'rls_health', label: 'Segurança & RLS Health', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-4 font-semibold text-xs sm:text-sm transition-all border-b-2 cursor-pointer ${
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

        {/* TAB 1: OVERVIEW / HEALTH DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Resumo de Distribuição por Empresa
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
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 text-xs"
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

        {/* TAB 2: GESTÃO DE EMPRESAS */}
        {activeTab === 'empresas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  {editingEmpresaId ? 'Editar Tenant' : 'Cadastrar Novo Tenant'}
                </h3>
                {editingEmpresaId && (
                  <button onClick={resetEmpresaForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveEmpresa} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Razão Social / Nome Fantasia</label>
                  <input
                    type="text"
                    required
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    placeholder="Ex: Transportadora K-Log Ltda"
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
                    <option value="BASIC">BASIC (Até 5 veículos)</option>
                    <option value="PRO">PRO (Até 20 veículos)</option>
                    <option value="ENTERPRISE">ENTERPRISE (Ilimitado)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {loading ? 'Salvando...' : editingEmpresaId ? 'Atualizar Tenant' : 'Cadastrar Tenant'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Tenants Cadastrados</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchEmpresa}
                    onChange={(e) => setSearchEmpresa(e.target.value)}
                    placeholder="Buscar empresa ou CNPJ..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Empresa / Razão Social</th>
                      <th className="p-3">CNPJ</th>
                      <th className="p-3">Plano</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right rounded-r-xl">Ações</th>
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
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditEmpresa(emp)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GESTÃO DE USUÁRIOS */}
        {activeTab === 'usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  {editingUsuarioId ? 'Editar Perfil' : 'Criar Novo Usuário'}
                </h3>
                {editingUsuarioId && (
                  <button onClick={resetUsuarioForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
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
                    placeholder="Ex: João da Silva"
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {!editingUsuarioId && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">E-mail de Acesso</label>
                      <input
                        type="email"
                        required
                        value={emailUsuario}
                        onChange={(e) => setEmailUsuario(e.target.value)}
                        placeholder="usuario@empresa.com"
                        className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600">Senha Inicial</label>
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
                  <label className="text-xs font-semibold text-slate-600">Nível de Permissão (Role)</label>
                  <select
                    value={roleUsuario}
                    onChange={(e) => setRoleUsuario(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin_empresa">Admin da Empresa</option>
                    <option value="funcionario">Funcionário / Operacional</option>
                    <option value="super_dev">Super Dev (Acesso Global)</option>
                  </select>
                </div>

                {roleUsuario !== 'super_dev' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Tenant (Empresa Vinculada)</label>
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
                  {loading ? 'Salvando...' : editingUsuarioId ? 'Atualizar Perfil' : 'Cadastrar Usuário'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Usuários Cadastrados</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    placeholder="Buscar nome ou e-mail..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Nome / E-mail</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Tenant Vinculado</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right rounded-r-xl">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {usuariosFiltrados.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-3">
                          <p className="font-semibold text-slate-900">{usr.nome || 'Sem Nome'}</p>
                          <p className="text-[10px] font-mono text-slate-500">{usr.email}</p>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            usr.role === 'super_dev' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {usr.empresas?.nome || (usr.role === 'super_dev' ? 'Acesso Global' : 'Sem Empresa')}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAtivoUsuario(usr.id, usr.ativo !== false)}
                            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono border ${
                              usr.ativo !== false 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                : 'bg-red-50 border-red-300 text-red-700'
                            }`}
                          >
                            {usr.ativo !== false ? 'ATIVO' : 'BLOQUEADO'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditUsuario(usr)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RLS HEALTH & SEGURANÇA */}
        {activeTab === 'rls_health' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Auditoria RLS (Row Level Security)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Esta visão valida se as políticas de isolamento de banco de dados estão ativas e protegendo as tabelas contra vazamentos entre empresas.
            </p>

            {rlsStatus.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Tabela do Schema</th>
                      <th className="p-3">Status RLS</th>
                      <th className="p-3">Policies Configuradas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rlsStatus.map((item) => (
                      <tr key={item.tabela}>
                        <td className="p-3 font-mono font-semibold text-indigo-700">{item.tabela}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            item.rls_ativo 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                              : 'bg-red-50 border-red-300 text-red-700'
                          }`}>
                            {item.rls_ativo ? 'RLS HABILITADO' : 'DESABILITADO'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{item.qtd_policies} política(s)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center">
                <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Verificação Automática de RLS</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Para habilitar o monitoramento em tempo real do RLS nesta aba, crie a função SQL <code className="text-indigo-600 font-mono">dev_rls_status()</code> no PostgreSQL do Supabase.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}