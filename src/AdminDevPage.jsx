import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  ShieldCheck, Building2, Users, Activity, 
  Plus, RefreshCw, Edit, Trash2, X, LogOut, Lock, Eye, EyeOff, Search,
  UserCheck, UserX, Power, Briefcase, Mail, GitBranch, FileText, CheckCircle2
} from 'lucide-react';

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'empresas' | 'contratos'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // ESTADOS: Empresas e Filiais
  const [empresas, setEmpresas] = useState([]);
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  
  // Campos do Form Empresa
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [ufEmpresa, setUfEmpresa] = useState('SP');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');
  const [tipoEmpresa, setTipoEmpresa] = useState('MATRIZ'); // 'MATRIZ' ou 'FILIAL'
  const [matrizIdSelecionada, setMatrizIdSelecionada] = useState('');

  // ESTADOS: Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [searchUsuario, setSearchUsuario] = useState('');
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [ativoUsuario, setAtivoUsuario] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [roleUsuario, setRoleUsuario] = useState('super_dev');
  const [cargoUsuario, setCargoUsuario] = useState('');
  const [empresaIdSelecionada, setEmpresaIdSelecionada] = useState('');

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
      // 1. Carregar Empresas
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });
      if (errEmpresas) throw errEmpresas;
      setEmpresas(dataEmpresas || []);

      // 2. Carregar Usuários/Perfis
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

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD EMPRESAS E FILIAIS ---
  const limparFormEmpresa = () => {
    setEditingEmpresaId(null);
    setNomeEmpresa('');
    setCnpjEmpresa('');
    setUfEmpresa('SP');
    setPlanoEmpresa('PRO');
    setTipoEmpresa('MATRIZ');
    setMatrizIdSelecionada('');
  };

  const prepararEdicaoEmpresa = (emp) => {
    setEditingEmpresaId(emp.id);
    setNomeEmpresa(emp.nome || emp.nome_fantasia || '');
    setCnpjEmpresa(emp.cnpj || '');
    setUfEmpresa(emp.uf || 'SP');
    setPlanoEmpresa(emp.plano || 'PRO');
    setTipoEmpresa(emp.matriz_id ? 'FILIAL' : 'MATRIZ');
    setMatrizIdSelecionada(emp.matriz_id || '');
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
        matriz_id: tipoEmpresa === 'FILIAL' ? (matrizIdSelecionada || null) : null,
        ativo: true
      };

      if (editingEmpresaId) {
        const { error } = await supabase.from('empresas').update(payload).eq('id', editingEmpresaId);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Empresa/Filial atualizada!' });
      } else {
        const { error } = await supabase.from('empresas').insert([payload]);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Empresa/Filial cadastrada com sucesso!' });
      }

      limparFormEmpresa();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar empresa: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const excluirEmpresa = async (id) => {
    if (!window.confirm('Tem certeza? Isso pode afetar usuários vinculados.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('empresas').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Empresa removida com sucesso!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao excluir: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD USUÁRIOS DEV ---
  const prepararEdicaoUsuario = (usr) => {
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setSenhaUsuario('');
    setAtivoUsuario(usr.ativo !== false);
    setRoleUsuario(usr.role || 'super_dev');
    setCargoUsuario(usr.cargo || usr.cargo_nome || '');
    setEmpresaIdSelecionada(usr.empresa_id || '');
  };

  const limparFormUsuario = () => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setSenhaUsuario('');
    setAtivoUsuario(true);
    setRoleUsuario('super_dev');
    setCargoUsuario('');
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
          empresa_id: roleUsuario === 'super_dev' ? null : (empresaIdSelecionada || null),
          ativo: ativoUsuario
        })
        .eq('id', editingUsuarioId);

      if (perfilError) throw perfilError;

      if (senhaUsuario.trim() || emailUsuario.trim()) {
        try {
          const updatePayload = {};
          if (senhaUsuario.trim()) updatePayload.password = senhaUsuario;
          if (emailUsuario.trim()) updatePayload.email = emailUsuario;
          await supabase.auth.admin.updateUserById(editingUsuarioId, updatePayload);
        } catch (authErr) {}
      }

      setFeedback({ type: 'success', message: 'Perfil do utilizador atualizado!' });
      limparFormUsuario();
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar perfil: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Listas de Matrizes para vinculo de Filiais
  const empresasMatrizes = empresas.filter(e => !e.matriz_id);

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
              <p className="text-xs sm:text-sm text-slate-500">
                Acesso global para e-mails, cargos, empresas/filiais e permissões RLS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => carregarDadosGlobais()}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl text-sm font-semibold border border-purple-200 transition-all cursor-pointer"
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
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'usuarios' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Users className="w-4 h-4" /> Gestão de Utilizadores ({usuarios.length})
          </button>

          <button
            onClick={() => setActiveTab('empresas')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'empresas' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Building2 className="w-4 h-4" /> Cadastrar Empresas & Filiais ({empresas.length})
          </button>
        </div>

        {/* TAB 1: UTILIZADORES */}
        {activeTab === 'usuarios' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" /> Utilizadores Cadastrados
              </h2>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar utilizadores..."
                  value={searchUsuario}
                  onChange={(e) => setSearchUsuario(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* FORM EDIÇÃO DEV */}
            {editingUsuarioId && (
              <form onSubmit={salvarUsuario} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Editar Perfil Dev
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{editingUsuarioId}</span>
                </div>
                
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
                    <label className="block text-xs font-semibold text-slate-600">Nova Senha</label>
                    <input type="password" value={senhaUsuario} onChange={(e) => setSenhaUsuario(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Permissão (Role)</label>
                    <select value={roleUsuario} onChange={(e) => setRoleUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                      <option value="super_dev">super_dev (Acesso Global)</option>
                      <option value="admin_empresa">admin_empresa</option>
                      <option value="funcionario">funcionario</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Cargo Operacional</label>
                    <input type="text" value={cargoUsuario} onChange={(e) => setCargoUsuario(e.target.value)} placeholder="Ex: Desenvolvedor, Gerente" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Empresa Vinculada</label>
                    <select value={empresaIdSelecionada} onChange={(e) => setEmpresaIdSelecionada(e.target.value)} disabled={roleUsuario === 'super_dev'} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100">
                      <option value="">{roleUsuario === 'super_dev' ? 'Global (Todas)' : 'Selecione a Empresa'}</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={limparFormUsuario} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-2xl text-sm font-semibold">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-sm font-semibold">Salvar Perfil</button>
                </div>
              </form>
            )}

            {/* TABELA DE UTILIZADORES */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-4 px-5">Nome</th>
                    <th className="py-4 px-5">E-mail</th>
                    <th className="py-4 px-5">Role</th>
                    <th className="py-4 px-5">Cargo</th>
                    <th className="py-4 px-5">Empresa</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map(usr => (
                    <tr key={usr.id} className="hover:bg-purple-50/30">
                      <td className="py-4 px-5 font-semibold text-slate-800">{usr.nome || 'Sem nome'}</td>
                      <td className="py-4 px-5 text-slate-600">{usr.email || 'Não informado'}</td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 text-xs rounded-lg font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {usr.role || 'funcionario'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-700">{usr.cargo || usr.cargo_nome || '-'}</td>
                      <td className="py-4 px-5 text-slate-600">{usr.empresas?.nome || 'Global'}</td>
                      <td className="py-4 px-5 text-right">
                        <button onClick={() => prepararEdicaoUsuario(usr)} className="p-2 bg-slate-100 hover:bg-purple-100 text-purple-700 rounded-xl border border-slate-200">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: GESTÃO DE EMPRESAS & FILIAIS */}
        {activeTab === 'empresas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* FORM CADASTRO EMPRESA/FILIAL */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {editingEmpresaId ? 'Editar Empresa / Filial' : 'Cadastrar Nova Empresa / Filial'}
                </h3>
                {editingEmpresaId && (
                  <button onClick={limparFormEmpresa} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={salvarEmpresa} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo de Cadastro</label>
                  <select 
                    value={tipoEmpresa} 
                    onChange={(e) => setTipoEmpresa(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-purple-700"
                  >
                    <option value="MATRIZ">Empresa Mãe (Matriz)</option>
                    <option value="FILIAL">Filial Vinculada</option>
                  </select>
                </div>

                {tipoEmpresa === 'FILIAL' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Selecione a Empresa Mãe (Matriz)</label>
                    <select 
                      value={matrizIdSelecionada} 
                      onChange={(e) => setMatrizIdSelecionada(e.target.value)}
                      required
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                    >
                      <option value="">Selecione uma Matriz...</option>
                      {empresasMatrizes.map(m => (
                        <option key={m.id} value={m.id}>{m.nome || m.nome_fantasia}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600">Razão Social / Nome Fantasia *</label>
                  <input 
                    type="text" 
                    required 
                    value={nomeEmpresa} 
                    onChange={(e) => setNomeEmpresa(e.target.value)} 
                    placeholder="Ex: Transportadora K-Log Ltda"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">CNPJ</label>
                    <input 
                      type="text" 
                      value={cnpjEmpresa} 
                      onChange={(e) => setCnpjEmpresa(e.target.value)} 
                      placeholder="00.000.000/0001-00"
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">UF (Estado)</label>
                    <input 
                      type="text" 
                      value={ufEmpresa} 
                      onChange={(e) => setUfEmpresa(e.target.value.toUpperCase())} 
                      placeholder="SP"
                      maxLength={2}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Plano de Assinatura</label>
                  <select 
                    value={planoEmpresa} 
                    onChange={(e) => setPlanoEmpresa(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                  >
                    <option value="BASIC">BASIC (Até 5 veículos)</option>
                    <option value="PRO">PRO (Até 20 veículos)</option>
                    <option value="ENTERPRISE">ENTERPRISE (Ilimitado)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  {editingEmpresaId ? 'Atualizar Registro' : 'Cadastrar Empresa / Filial'}
                </button>
              </form>
            </div>

            {/* TABELA LISTAGEM DE EMPRESAS & FILIAIS */}
            <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" /> Empresas e Filiais Cadastradas
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                      <th className="py-3 px-4">Empresa / Unidade</th>
                      <th className="py-3 px-4">CNPJ & UF</th>
                      <th className="py-3 px-4">Estrutura</th>
                      <th className="py-3 px-4">Plano</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empresas.map(emp => {
                      const ehFilial = !!emp.matriz_id;
                      const empresaMae = ehFilial ? empresas.find(m => m.id === emp.matriz_id) : null;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {emp.nome || emp.nome_fantasia}
                            {ehFilial && (
                              <p className="text-[10px] text-purple-600 font-normal flex items-center gap-1 mt-0.5">
                                <GitBranch className="w-3 h-3" /> Filial de: {empresaMae?.nome || 'Matriz'}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{emp.cnpj || 'Não informado'}</div>
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px] mt-0.5">
                              {emp.uf || 'SP'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ehFilial ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {ehFilial ? 'Filial' : 'Matriz Mãe'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{emp.plano || 'PRO'}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => prepararEdicaoEmpresa(emp)} className="p-1.5 bg-slate-100 hover:bg-purple-100 text-purple-700 rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => excluirEmpresa(emp.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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