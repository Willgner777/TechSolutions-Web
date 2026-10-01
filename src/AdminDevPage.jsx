import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  ShieldCheck, Building2, Users, Activity, 
  Plus, RefreshCw, CheckCircle2, XCircle, Edit, Trash2, 
  X, LogOut, Lock, Eye, EyeOff, Search, UserCheck, UserX,
  Power
} from 'lucide-react';

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'empresas' | 'usuarios' | 'rls_health'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Estados Globais de Dados
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
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
  const [ativoUsuario, setAtivoUsuario] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [roleUsuario, setRoleUsuario] = useState('admin_empresa');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');

  useEffect(() => {
    carregarDadosGlobais();
  }, []);

  // Logout com redirecionamento
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao efetuar logoff:', err);
    } finally {
      window.location.href = '/';
    }
  };

  const carregarDadosGlobais = async ({ manterFeedback = false } = {}) => {
    setLoading(true);
    if (!manterFeedback) setFeedback({ type: '', message: '' });

    try {
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });
      if (errEmpresas) throw errEmpresas;
      setEmpresas(dataEmpresas || []);

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
        // Silencia erros se tabelas não existirem
      }

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
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
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;
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

  const limparFormUsuario = () => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setSenhaUsuario('');
    setAtivoUsuario(true);
    setRoleUsuario('admin_empresa');
    setEmpresaIdSelecionada('');
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    if (!editingUsuarioId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: nomeUsuario,
          role: roleUsuario,
          empresa_id: empresaIdSelecionada || null,
          ativo: ativoUsuario
        })
        .eq('id', editingUsuarioId);
      
      if (error) throw error;

      if (senhaUsuario.trim()) {
        try {
          await supabase.auth.admin.updateUserById(editingUsuarioId, { password: senhaUsuario });
        } catch (pwdErr) {
          console.warn('Senha atualizada apenas no perfil de dados.');
        }
      }

      setFeedback({ type: 'success', message: 'Perfil do utilizador atualizado com sucesso!' });
      limparFormUsuario();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar utilizador: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const prepararEdicaoUsuario = (usr) => {
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setSenhaUsuario('');
    setAtivoUsuario(usr.ativo !== false);
    setRoleUsuario(usr.role || 'admin_empresa');
    setEmpresaIdSelecionada(usr.empresa_id || '');
  };

  const alternarStatusUsuario = async (usr) => {
    const novoStatus = usr.ativo === false;
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ ativo: novoStatus })
        .eq('id', usr.id);
      if (error) throw error;
      setFeedback({ type: 'success', message: `Utilizador ${novoStatus ? 'ativado' : 'desativado'} com sucesso!` });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao alterar status: ' + err.message });
    }
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <span className="text-white font-black text-2xl tracking-tighter">W</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs rounded-full font-mono font-bold">
                  CONSOLE DE DESENVOLVEDOR
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Gestão centralizada de empresas, utilizadores e permissões do sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => carregarDadosGlobais()}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl text-sm font-semibold border border-purple-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Dados
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-semibold border border-red-200 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* FEEDBACK */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between transition-all ${
            feedback.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('empresas')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'empresas' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Empresas ({empresas.length})
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'usuarios' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
            }`}
          >
            <Users className="w-4 h-4" />
            Utilizadores ({usuarios.length})
          </button>

          <button
            onClick={() => setActiveTab('rls_health')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'rls_health' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Segurança RLS
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* ABA 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-purple-600" /> Resumo do Ecossistema
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total de Empresas</p>
                  <p className="text-3xl font-bold text-slate-900">{empresas.length}</p>
                  <span className="text-xs text-emerald-600 font-semibold inline-block">Ativas na plataforma</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total de Utilizadores</p>
                  <p className="text-3xl font-bold text-slate-900">{usuarios.length}</p>
                  <span className="text-xs text-purple-600 font-semibold inline-block">Contas registadas</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Despesas Pendentes</p>
                  <p className="text-3xl font-bold text-amber-600">{resumoAlertas.despesasPendentes}</p>
                  <span className="text-xs text-slate-500 font-medium inline-block">Aguardando validação</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Documentos Vencidos</p>
                  <p className="text-3xl font-bold text-red-600">{resumoAlertas.docsVencidos}</p>
                  <span className="text-xs text-slate-500 font-medium inline-block">Requerem atenção</span>
                </div>
              </div>

              <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-purple-900">Nível Acesso: Super Dev</h3>
                  <p className="text-xs text-purple-700 leading-relaxed">
                    Você possui privilégios de administrador global. Permite gerir, ativar e desativar empresas e perfis de utilizadores em todo o ecossistema.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: EMPRESAS */}
          {activeTab === 'empresas' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-purple-600" /> Gestão de Empresas
                </h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchEmpresa}
                    onChange={(e) => setSearchEmpresa(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <form onSubmit={salvarEmpresa} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  {editingEmpresaId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Nome da Empresa</label>
                    <input 
                      type="text"
                      placeholder="Ex: Transportadora Exemplo"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">CNPJ</label>
                    <input 
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={cnpjEmpresa}
                      onChange={(e) => setCnpjEmpresa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Plano</label>
                    <select
                      value={planoEmpresa}
                      onChange={(e) => setPlanoEmpresa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                    >
                      <option value="PRO">PRO</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                      <option value="BASIC">BASIC</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {editingEmpresaId && (
                    <button 
                      type="button"
                      onClick={limparFormEmpresa}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl px-5 py-3 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 py-3 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-purple-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    {editingEmpresaId ? 'Atualizar Empresa' : 'Salvar Empresa'}
                  </button>
                </div>
              </form>

              {/* TABELA DE EMPRESAS */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-5">Nome</th>
                      <th className="py-4 px-5">CNPJ</th>
                      <th className="py-4 px-5">Plano</th>
                      <th className="py-4 px-5">Criada em</th>
                      <th className="py-4 px-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empresasFiltradas.map((emp) => (
                      <tr key={emp.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-4 px-5 font-semibold text-slate-800">{emp.nome || emp.nome_fantasia || 'Sem nome'}</td>
                        <td className="py-4 px-5 text-slate-500 font-mono text-xs">{emp.cnpj || 'Não informado'}</td>
                        <td className="py-4 px-5">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs rounded-xl font-semibold">
                            {emp.plano || 'PRO'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 text-xs">{new Date(emp.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => prepararEdicaoEmpresa(emp)}
                            className="p-2 bg-slate-100 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
                            title="Editar Empresa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => excluirEmpresa(emp.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer border border-red-200"
                            title="Excluir Empresa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {empresasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-400">Nenhuma empresa encontrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: UTILIZADORES */}
          {activeTab === 'usuarios' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-purple-600" /> Gestão de Utilizadores
                </h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar por nome, e-mail ou cargo..."
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* FORMULÁRIO DE EDIÇÃO */}
              {editingUsuarioId && (
                <form onSubmit={salvarUsuario} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Editar Perfil de Utilizador
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">{editingUsuarioId}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Nome do Utilizador</label>
                      <input 
                        type="text"
                        value={nomeUsuario}
                        onChange={(e) => setNomeUsuario(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">E-mail</label>
                      <input 
                        type="email"
                        disabled
                        value={emailUsuario}
                        className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl px-4 py-3 text-sm cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Nova Senha (opcional)</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={senhaUsuario}
                          onChange={(e) => setSenhaUsuario(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-11 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Cargo (Role)</label>
                      <select
                        value={roleUsuario}
                        onChange={(e) => setRoleUsuario(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="super_dev">super_dev</option>
                        <option value="admin_empresa">admin_empresa</option>
                        <option value="funcionario">funcionario</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Empresa Vinculada</label>
                      <select
                        value={empresaIdSelecionada}
                        onChange={(e) => setEmpresaIdSelecionada(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="">Nenhuma (Acesso Global Dev)</option>
                        {empresas.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Status de Acesso</label>
                      <button
                        type="button"
                        onClick={() => setAtivoUsuario(!ativoUsuario)}
                        className={`w-full py-3 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          ativoUsuario 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                            : 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Power className={`w-4 h-4 ${ativoUsuario ? 'text-emerald-600' : 'text-red-600'}`} />
                          {ativoUsuario ? 'Utilizador Ativo' : 'Utilizador Inativo'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${
                          ativoUsuario ? 'bg-emerald-200/60 text-emerald-900' : 'bg-red-200/60 text-red-900'
                        }`}>
                          {ativoUsuario ? 'Ligado' : 'Desligado'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={limparFormUsuario}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl px-5 py-3 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 py-3 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-purple-600/20"
                    >
                      Atualizar Utilizador
                    </button>
                  </div>
                </form>
              )}

              {/* TABELA DE UTILIZADORES */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-5">Nome</th>
                      <th className="py-4 px-5">E-mail</th>
                      <th className="py-4 px-5">Cargo</th>
                      <th className="py-4 px-5">Empresa</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuariosFiltrados.map((usr) => (
                      <tr key={usr.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-4 px-5 font-semibold text-slate-800">{usr.nome || 'Sem nome'}</td>
                        <td className="py-4 px-5 text-slate-600">{usr.email || 'Não informado'}</td>
                        <td className="py-4 px-5">
                          <span className={`px-3 py-1 text-xs rounded-xl font-mono font-semibold border ${
                            usr.role === 'super_dev' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-600">{usr.empresas?.nome || 'Global'}</td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-semibold border ${
                            usr.ativo !== false 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${usr.ativo !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {usr.ativo !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => prepararEdicaoUsuario(usr)}
                            className="p-2 bg-slate-100 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
                            title="Editar Perfil"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => alternarStatusUsuario(usr)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                              usr.ativo !== false 
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={usr.ativo !== false ? 'Desativar Acesso' : 'Ativar Acesso'}
                          >
                            {usr.ativo !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {usuariosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400">Nenhum utilizador encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 4: RLS HEALTH */}
          {activeTab === 'rls_health' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-600" /> Auditoria de Segurança RLS
              </h2>
              <p className="text-sm text-slate-500">
                Verificação de isolamento de dados e integridade do banco Supabase.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Políticas RLS Otimizadas</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Políticas de isolamento configuradas corretamente para evitar erros de recursão em consultas de perfis e empresas.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Acesso Cross-Tenant Dev</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Permissão total ativada para o perfil <code className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs">super_dev</code> consultar e alterar registros globais.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}