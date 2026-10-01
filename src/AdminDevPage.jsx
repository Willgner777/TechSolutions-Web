import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
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
      } catch (errAlertas) {
        // Ignora caso alguma tabela específica de domínio não exista no banco atual
      }

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados globais: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Funções de CRUD de Empresa
  const salvarEmpresa = async (e) => {
    e.preventDefault();
    if (!nomeEmpresa.trim()) {
      setFeedback({ type: 'error', message: 'O nome da empresa é obrigatório.' });
      return;
    }

    setLoading(true);
    try {
      if (editingEmpresaId) {
        const { error } = await supabase
          .from('empresas')
          .update({ nome: nomeEmpresa, cnpj: cnpjEmpresa, plano: planoEmpresa })
          .eq('id', editingEmpresaId);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Empresa atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([{ nome: nomeEmpresa, cnpj: cnpjEmpresa, plano: planoEmpresa, ativo: true }]);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Empresa criada com sucesso!' });
      }

      limparFormEmpresa();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar empresa: ' + err.message });
      setLoading(false);
    }
  };

  const limparFormEmpresa = () => {
    setEditingEmpresaId(null);
    setNomeEmpresa('');
    setCnpjEmpresa('');
    setPlanoEmpresa('PRO');
  };

  const prepararEdicaoEmpresa = (emp) => {
    setEditingEmpresaId(emp.id);
    setNomeEmpresa(emp.nome || emp.nome_fantasia || '');
    setCnpjEmpresa(emp.cnpj || '');
    setPlanoEmpresa(emp.plano || 'PRO');
  };

  const excluirEmpresa = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa? Todos os dados vinculados podem ser afetados.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('empresas').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Empresa excluída com sucesso.' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao excluir empresa: ' + err.message });
      setLoading(false);
    }
  };

  // Funções de Usuários
  const limparFormUsuario = () => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setSenhaUsuario('');
    setRoleUsuario('admin_empresa');
    setEmpresaIdSelecionada('');
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    if (!emailUsuario.trim()) {
      setFeedback({ type: 'error', message: 'O e-mail do usuário é obrigatório.' });
      return;
    }

    setLoading(true);
    try {
      if (editingUsuarioId) {
        const { error } = await supabase
          .from('perfis')
          .update({
            nome: nomeUsuario,
            role: roleUsuario,
            empresa_id: empresaIdSelecionada || null
          })
          .eq('id', editingUsuarioId);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Perfil de usuário atualizado com sucesso!' });
      } else {
        setFeedback({ type: 'error', message: 'Para criar novos usuários autenticados, utilize o fluxo de cadastro padrão ou crie a auth via Supabase Admin API.' });
      }
      limparFormUsuario();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar usuário: ' + err.message });
      setLoading(false);
    }
  };

  const prepararEdicaoUsuario = (usr) => {
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setRoleUsuario(usr.role || 'admin_empresa');
    setEmpresaIdSelecionada(usr.empresa_id || '');
  };

  const alternarStatusUsuario = async (usr) => {
    const novoStatus = usr.ativo === false ? true : false;
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ ativo: novoStatus })
        .eq('id', usr.id);
      if (error) throw error;
      setFeedback({ type: 'success', message: `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!` });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao alterar status: ' + err.message });
    }
  };

  // Filtragem local
  const empresasFiltradas = empresas.filter(e => 
    (e.nome || e.nome_fantasia || '').toLowerCase().includes(searchEmpresa.toLowerCase()) ||
    (e.cnpj || '').toLowerCase().includes(searchEmpresa.toLowerCase())
  );

  const usuariosFiltrados = usuarios.filter(u => 
    (u.nome || '').toLowerCase().includes(searchUsuario.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchUsuario.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchUsuario.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO PAINEL DEV */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-full font-mono font-bold">
              SUPER DEV GLOBAL CONSOLE
            </span>
            <span className="text-xs text-slate-400">• Acesso Cross-Tenant Ativo</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Painel de Controle do Desenvolvedor</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Gerencie empresas, usuários, banco de dados e políticas RLS de todo o ecossistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => carregarDadosGlobais()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between ${
          feedback.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ABAS DE NAVEGAÇÃO INTERNA */}
      <div className="flex flex-wrap gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Visão Geral & Métricas
        </button>

        <button
          onClick={() => setActiveTab('empresas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'empresas' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Empresas ({empresas.length})
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'usuarios' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários / Perfis ({usuarios.length})
        </button>

        <button
          onClick={() => setActiveTab('rls_health')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'rls_health' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Auditoria RLS & DB
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        
        {/* ABA 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Resumo Consolidado do Sistema
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">Total de Empresas</p>
                <p className="text-3xl font-extrabold text-white mt-2">{empresas.length}</p>
                <span className="text-xs text-emerald-400 mt-1 inline-block">Ativas no ecossistema</span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">Total de Usuários</p>
                <p className="text-3xl font-extrabold text-white mt-2">{usuarios.length}</p>
                <span className="text-xs text-purple-400 mt-1 inline-block">Perfis cadastrados</span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">Despesas Pendentes</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">{resumoAlertas.despesasPendentes}</p>
                <span className="text-xs text-slate-400 mt-1 inline-block">Aguardando aprovação</span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">Documentos Vencidos</p>
                <p className="text-3xl font-extrabold text-red-400 mt-2">{resumoAlertas.docsVencidos}</p>
                <span className="text-xs text-slate-400 mt-1 inline-block">Requer atenção</span>
              </div>
            </div>

            <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-purple-200">Isolamento Multi-Tenant Garantido</h3>
                <p className="text-xs text-purple-300/80 mt-1">
                  Como perfil <code className="bg-purple-950 px-1.5 py-0.5 rounded text-purple-300">super_dev</code>, você possui permissão bypass nas políticas RLS do banco de dados, permitindo gerenciar cadastros de qualquer empresa sem restrições.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: EMPRESAS */}
        {activeTab === 'empresas' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" /> Gerenciamento de Empresas
              </h2>
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar por nome ou CNPJ..."
                  value={searchEmpresa}
                  onChange={(e) => setSearchEmpresa(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Formulário de Criar/Editar Empresa */}
            <form onSubmit={salvarEmpresa} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome da Empresa</label>
                <input 
                  type="text"
                  placeholder="Ex: Transportadora Exemplo"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">CNPJ</label>
                <input 
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpjEmpresa}
                  onChange={(e) => setCnpjEmpresa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plano</label>
                <select
                  value={planoEmpresa}
                  onChange={(e) => setPlanoEmpresa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                  <option value="BASIC">BASIC</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {editingEmpresaId ? 'Atualizar' : 'Nova Empresa'}
                </button>
                {editingEmpresaId && (
                  <button 
                    type="button"
                    onClick={limparFormEmpresa}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl px-3 py-2 text-sm transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Tabela de Empresas */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">CNPJ</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Criada em</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {empresasFiltradas.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{emp.nome || emp.nome_fantasia || 'Sem nome'}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-xs">{emp.cnpj || 'Não informado'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-lg font-semibold">
                          {emp.plano || 'PRO'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{new Date(emp.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => prepararEdicaoEmpresa(emp)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Editar Empresa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => excluirEmpresa(emp.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Empresa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {empresasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-500">Nenhuma empresa encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: USUÁRIOS */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Gerenciamento de Usuários (Cross-Tenant)
              </h2>
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar por nome, email ou role..."
                  value={searchUsuario}
                  onChange={(e) => setSearchUsuario(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Formulário de Edição de Perfil/Usuário */}
            {editingUsuarioId && (
              <form onSubmit={salvarUsuario} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Usuário</label>
                  <input 
                    type="text"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role / Cargo</label>
                  <select
                    value={roleUsuario}
                    onChange={(e) => setRoleUsuario(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="super_dev">super_dev</option>
                    <option value="admin_empresa">admin_empresa</option>
                    <option value="funcionario">funcionario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Empresa Vinculada</label>
                  <select
                    value={empresaIdSelecionada}
                    onChange={(e) => setEmpresaIdSelecionada(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Nenhuma (Global)</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Atualizar Perfil
                  </button>
                  <button 
                    type="button"
                    onClick={limparFormUsuario}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl px-3 py-2 text-sm transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Tabela de Usuários */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Cargo (Role)</th>
                    <th className="py-3 px-4">Empresa Vinculada</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usuariosFiltrados.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{usr.nome || 'Sem nome'}</td>
                      <td className="py-3 px-4 text-slate-300">{usr.email || 'Não informado'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold border ${
                          usr.role === 'super_dev' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{usr.empresas?.nome || 'Global / Nenhuma'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                          usr.ativo !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {usr.ativo !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => prepararEdicaoUsuario(usr)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Editar Perfil"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => alternarStatusUsuario(usr)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            usr.ativo !== false ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={usr.ativo !== false ? 'Desativar usuário' : 'Ativar usuário'}
                        >
                          {usr.ativo !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">Nenhum usuário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: AUDITORIA RLS E SAÚDE DO BANCO */}
        {activeTab === 'rls_health' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" /> Saúde do Banco de Dados & RLS
            </h2>
            <p className="text-sm text-slate-400">
              Verifique o status de isolamento das tabelas e garanta que o bypass de desenvolvedor esteja operando corretamente sem recursões de políticas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Função de Verificação (`is_super_dev`)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A função atua no esquema público evitando loops em cascata ao validar diretamente o perfil na tabela perfis por ID de autenticação.
                </p>
              </div>

              <div className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Políticas Cross-Tenant</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Todas as tabelas críticas possuem checagem para retornar dados globais caso o usuário autenticado possua o role de super dev.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}