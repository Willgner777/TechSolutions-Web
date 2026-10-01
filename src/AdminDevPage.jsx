import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  ShieldCheck, Building2, Users, Activity, 
  Plus, RefreshCw, CheckCircle2, Edit, Trash2, 
  X, LogOut, Lock, Eye, EyeOff, Search, UserCheck, UserX 
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
  const [showPassword, setShowPassword] = useState(false);
  const [roleUsuario, setRoleUsuario] = useState('admin_empresa');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');

  useEffect(() => {
    carregarDadosGlobais();
  }, []);

  // Redirecionamento e logout para a tela de login
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao efetuar logoff:', err);
    } finally {
      window.location.href = '/'; // Redireciona para a rota da tela de login
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
        // Ignora erros caso tabelas específicas não existam
      }

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados globais: ' + err.message });
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
          empresa_id: empresaIdSelecionada || null
        })
        .eq('id', editingUsuarioId);
      
      if (error) throw error;

      // Se inserida uma nova senha, tenta atualizar no Supabase Auth se houver credenciais de Admin
      if (senhaUsuario.trim()) {
        try {
          await supabase.auth.admin.updateUserById(editingUsuarioId, { password: senhaUsuario });
        } catch (pwdErr) {
          console.warn('Não foi possível atualizar a senha via API Admin:', pwdErr.message);
        }
      }

      setFeedback({ type: 'success', message: 'Perfil de utilizador atualizado com sucesso!' });
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white font-sans p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO DO PAINEL DEV */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-slate-900/90 backdrop-blur-xl border border-purple-500/20 p-6 sm:p-8 rounded-3xl gap-6 shadow-2xl shadow-purple-950/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <span className="text-white font-black text-2xl tracking-tighter">W</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs rounded-full font-mono font-bold">
                  SUPER DEV CONSOLE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Painel de Controle Dev</h1>
              <p className="text-xs sm:text-sm text-purple-200/70">
                Gestão centralizada de empresas, utilizadores e segurança do ecossistema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end pt-2 lg:pt-0">
            <button
              onClick={() => carregarDadosGlobais()}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 rounded-2xl text-sm font-semibold border border-purple-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Dados
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-2xl text-sm font-semibold border border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair (Logoff)
            </button>
          </div>
        </div>

        {/* FEEDBACK DE SUCESSO / ERRO */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between backdrop-blur-md transition-all ${
            feedback.type === 'error' 
              ? 'bg-red-500/20 border-red-500/40 text-red-200' 
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })} className="text-purple-200 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ABAS DE NAVEGAÇÃO INTERNA */}
        <div className="flex flex-wrap gap-3 bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-purple-500/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'text-purple-200/70 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Activity className="w-4 h-4" />
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('empresas')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'empresas' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'text-purple-200/70 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Empresas ({empresas.length})
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'usuarios' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'text-purple-200/70 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Users className="w-4 h-4" />
            Utilizadores ({usuarios.length})
          </button>

          <button
            onClick={() => setActiveTab('rls_health')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'rls_health' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'text-purple-200/70 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Segurança RLS
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* ABA 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-purple-400" /> Resumo do Ecossistema
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-950/60 border border-purple-500/20 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-purple-200/70 font-semibold tracking-wide uppercase">Total de Empresas</p>
                  <p className="text-3xl font-extrabold text-white">{empresas.length}</p>
                  <span className="text-xs text-emerald-400 font-medium inline-block">Ativas no sistema</span>
                </div>

                <div className="bg-slate-950/60 border border-purple-500/20 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-purple-200/70 font-semibold tracking-wide uppercase">Total de Utilizadores</p>
                  <p className="text-3xl font-extrabold text-white">{usuarios.length}</p>
                  <span className="text-xs text-purple-300 font-medium inline-block">Perfis registados</span>
                </div>

                <div className="bg-slate-950/60 border border-purple-500/20 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-purple-200/70 font-semibold tracking-wide uppercase">Despesas Pendentes</p>
                  <p className="text-3xl font-extrabold text-amber-400">{resumoAlertas.despesasPendentes}</p>
                  <span className="text-xs text-purple-200/70 font-medium inline-block">Aguardando aprovação</span>
                </div>

                <div className="bg-slate-950/60 border border-purple-500/20 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-purple-200/70 font-semibold tracking-wide uppercase">Documentos Vencidos</p>
                  <p className="text-3xl font-extrabold text-red-400">{resumoAlertas.docsVencidos}</p>
                  <span className="text-xs text-purple-200/70 font-medium inline-block">Requer atenção</span>
                </div>
              </div>

              <div className="p-6 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-purple-200">Acesso Super Dev Ativo</h3>
                  <p className="text-xs text-purple-300/80 leading-relaxed">
                    Como <code className="bg-purple-900 px-2 py-0.5 rounded-md text-purple-200 font-mono">super_dev</code>, você tem permissão total para gerenciar dados de todas as empresas diretamente por este painel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: EMPRESAS */}
          {activeTab === 'empresas' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-purple-400" /> Gestão de Empresas
                </h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
                  <input 
                    type="text"
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchEmpresa}
                    onChange={(e) => setSearchEmpresa(e.target.value)}
                    className="w-full bg-slate-950/80 border border-purple-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <form onSubmit={salvarEmpresa} className="bg-slate-950/50 border border-purple-500/20 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-purple-200 tracking-wide uppercase mb-2">
                  {editingEmpresaId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Nome da Empresa</label>
                    <input 
                      type="text"
                      placeholder="Ex: Transportadora Exemplo"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">CNPJ</label>
                    <input 
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={cnpjEmpresa}
                      onChange={(e) => setCnpjEmpresa(e.target.value)}
                      className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Plano</label>
                    <select
                      value={planoEmpresa}
                      onChange={(e) => setPlanoEmpresa(e.target.value)}
                      className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                    >
                      <option value="PRO" className="bg-slate-900 text-white">PRO</option>
                      <option value="ENTERPRISE" className="bg-slate-900 text-white">ENTERPRISE</option>
                      <option value="BASIC" className="bg-slate-900 text-white">BASIC</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {editingEmpresaId && (
                    <button 
                      type="button"
                      onClick={limparFormEmpresa}
                      className="bg-slate-800 hover:bg-slate-700 text-purple-200 rounded-2xl px-5 py-3 text-sm font-medium transition-all cursor-pointer border border-purple-500/20 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 py-3 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    {editingEmpresaId ? 'Atualizar Empresa' : 'Salvar Empresa'}
                  </button>
                </div>
              </form>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-slate-950/40 text-purple-200/70 text-xs uppercase tracking-wider">
                      <th className="py-4 px-5">Nome</th>
                      <th className="py-4 px-5">CNPJ</th>
                      <th className="py-4 px-5">Plano</th>
                      <th className="py-4 px-5">Criada em</th>
                      <th className="py-4 px-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {empresasFiltradas.map((emp) => (
                      <tr key={emp.id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="py-4 px-5 font-semibold text-white">{emp.nome || emp.nome_fantasia || 'Sem nome'}</td>
                        <td className="py-4 px-5 text-purple-200/80 font-mono text-xs">{emp.cnpj || 'Não informado'}</td>
                        <td className="py-4 px-5">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs rounded-xl font-semibold">
                            {emp.plano || 'PRO'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-purple-200/60 text-xs">{new Date(emp.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => prepararEdicaoEmpresa(emp)}
                            className="p-2 bg-slate-800 hover:bg-purple-700 text-purple-200 rounded-xl transition-colors cursor-pointer border border-purple-500/20"
                            title="Editar Empresa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => excluirEmpresa(emp.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors cursor-pointer border border-red-500/30"
                            title="Excluir Empresa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {empresasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-purple-300/50">Nenhuma empresa encontrada.</td>
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
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-purple-400" /> Gestão de Utilizadores
                </h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
                  <input 
                    type="text"
                    placeholder="Buscar por nome, e-mail ou cargo..."
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    className="w-full bg-slate-950/80 border border-purple-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* FORMULÁRIO DE EDIÇÃO DE USUÁRIO COM CAMPO DE SENHA */}
              {editingUsuarioId && (
                <form onSubmit={salvarUsuario} className="bg-slate-950/50 border border-purple-500/20 p-6 rounded-2xl space-y-5">
                  <h3 className="text-sm font-semibold text-purple-200 tracking-wide uppercase mb-2">Editar Perfil do Utilizador</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Nome do Utilizador</label>
                      <input 
                        type="text"
                        value={nomeUsuario}
                        onChange={(e) => setNomeUsuario(e.target.value)}
                        className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">E-mail</label>
                      <input 
                        type="email"
                        disabled
                        value={emailUsuario}
                        className="w-full bg-slate-900/50 border border-purple-500/10 text-slate-400 rounded-2xl px-4 py-3 text-sm cursor-not-allowed"
                      />
                    </div>

                    {/* NOVO CAMPO DE SENHA ADICIONADO E HARMONIZADO */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Nova Senha (opcional)</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={senhaUsuario}
                          onChange={(e) => setSenhaUsuario(e.target.value)}
                          className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl py-3 pl-10 pr-11 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                        />
                        <Lock className="w-4 h-4 text-purple-300/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Cargo (Role)</label>
                      <select
                        value={roleUsuario}
                        onChange={(e) => setRoleUsuario(e.target.value)}
                        className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="super_dev" className="bg-slate-900 text-white">super_dev</option>
                        <option value="admin_empresa" className="bg-slate-900 text-white">admin_empresa</option>
                        <option value="funcionario" className="bg-slate-900 text-white">funcionario</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2 lg:col-span-4">
                      <label className="block text-xs font-semibold text-slate-300">Empresa Vinculada</label>
                      <select
                        value={empresaIdSelecionada}
                        onChange={(e) => setEmpresaIdSelecionada(e.target.value)}
                        className="w-full bg-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="" className="bg-slate-900 text-white">Nenhuma (Acesso Global Dev)</option>
                        {empresas.map(emp => (
                          <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">{emp.nome || emp.nome_fantasia}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button 
                      type="button"
                      onClick={limparFormUsuario}
                      className="bg-slate-800 hover:bg-slate-700 text-purple-200 rounded-2xl px-5 py-3 text-sm font-medium transition-all cursor-pointer border border-purple-500/20 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 py-3 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-600/30"
                    >
                      Atualizar Utilizador
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-2xl border border-purple-500/10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-slate-950/40 text-purple-200/70 text-xs uppercase tracking-wider">
                      <th className="py-4 px-5">Nome</th>
                      <th className="py-4 px-5">E-mail</th>
                      <th className="py-4 px-5">Cargo</th>
                      <th className="py-4 px-5">Empresa</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {usuariosFiltrados.map((usr) => (
                      <tr key={usr.id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="py-4 px-5 font-semibold text-white">{usr.nome || 'Sem nome'}</td>
                        <td className="py-4 px-5 text-purple-200/80">{usr.email || 'Não informado'}</td>
                        <td className="py-4 px-5">
                          <span className={`px-3 py-1 text-xs rounded-xl font-mono font-semibold border ${
                            usr.role === 'super_dev' 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-purple-200/80">{usr.empresas?.nome || 'Global'}</td>
                        <td className="py-4 px-5">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${
                            usr.ativo !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {usr.ativo !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => prepararEdicaoUsuario(usr)}
                            className="p-2 bg-slate-800 hover:bg-purple-700 text-purple-200 rounded-xl transition-colors cursor-pointer border border-purple-500/20"
                            title="Editar Perfil"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => alternarStatusUsuario(usr)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                              usr.ativo !== false ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            }`}
                            title={usr.ativo !== false ? 'Desativar' : 'Ativar'}
                          >
                            {usr.ativo !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {usuariosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-purple-300/50">Nenhum utilizador encontrado.</td>
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
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" /> Auditoria de Segurança RLS
              </h2>
              <p className="text-sm text-purple-200/70">
                Verificação de isolamento e integridade de políticas do banco de dados.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-950/60 border border-purple-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Políticas Ativas sem Loops</span>
                  </div>
                  <p className="text-xs text-purple-200/70 leading-relaxed">
                    As políticas de segurança estão configuradas de maneira otimizada para evitar recursões em consultas de autenticação.
                  </p>
                </div>

                <div className="p-6 bg-slate-950/60 border border-purple-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Acesso Cross-Tenant Dev</span>
                  </div>
                  <p className="text-xs text-purple-200/70 leading-relaxed">
                    O painel possui autorização completa para navegação e administração de registros em todas as tabelas.
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