import React, { useState, useEffect } from 'react';
import { supabase, criarClienteIsolado } from './Admbases';
import { 
  Building2, Users, ShieldCheck, Plus, RefreshCw, 
  CheckCircle2, AlertCircle, Database, Edit, Trash2, X, LogOut
} from 'lucide-react';

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('empresas');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Listas de dados
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Form State: Empresa
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');

  // Form State: Usuário
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

      const usuariosComEmpresa = (dataUsuarios || []).map(usr => {
        const emp = (dataEmpresas || []).find(e => e.id === usr.empresa_id);
        return {
          ...usr,
          empresas: emp ? { nome: emp.nome } : null
        };
      });

      setUsuarios(usuariosComEmpresa);

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- AÇÕES: EMPRESAS ---
  const handleSaveEmpresa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

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

  const handleEditEmpresa = (emp) => {
    setEditingEmpresaId(emp.id);
    setNomeEmpresa(emp.nome || '');
    setCnpjEmpresa(emp.cnpj || '');
    setPlanoEmpresa(emp.plano || 'PRO');
  };

  const handleDeleteEmpresa = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('empresas').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Empresa removida com sucesso!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetEmpresaForm = () => {
    setEditingEmpresaId(null);
    setNomeEmpresa('');
    setCnpjEmpresa('');
    setPlanoEmpresa('PRO');
  };

  // --- AÇÕES: USUÁRIOS ---
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

  const handleEditUsuario = (usr) => {
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setRoleUsuario(usr.role || 'admin_empresa');
    setEmpresaIdSelecionada(usr.empresa_id || '');
  };

  const handleDeleteUsuario = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('perfis').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Usuário removido!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetUsuarioForm = () => {
    setEditingUsuarioId(null);
    setNomeUsuario('');
    setEmailUsuario('');
    setSenhaUsuario('');
    setRoleUsuario('admin_empresa');
    setEmpresaIdSelecionada('');
  };

  return (
    <div className="text-slate-800 font-sans">
      {/* HEADER SUPER DEV */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-mono text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Admin Console Global (Super Dev)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">Gestão da Plataforma Multi-tenant</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarDadosGlobais}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold border border-red-200 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Empresas Cadastradas</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{empresas.length}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center text-purple-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Usuários Totais</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{usuarios.length}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Status do Sistema</p>
            <h3 className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> RLS Ativo & Seguro
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-700">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FEEDBACK */}
      {feedback.message && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* TABS */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('empresas')}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'empresas' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cadastrar & Listar Empresas
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'usuarios' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cadastrar & Vincular Usuários
        </button>
      </div>

      {/* TAB EMPRESAS */}
      {activeTab === 'empresas' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-3xl h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                {editingEmpresaId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
              </h3>
              {editingEmpresaId && (
                <button onClick={resetEmpresaForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSaveEmpresa} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nome / Razão Social</label>
                <input
                  type="text"
                  required
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Ex: Transportadora K-Log Ltda"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">CNPJ</label>
                <input
                  type="text"
                  required
                  value={cnpjEmpresa}
                  onChange={(e) => setCnpjEmpresa(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Plano</label>
                <select
                  value={planoEmpresa}
                  onChange={(e) => setPlanoEmpresa(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="BASIC">Basic (Até 5 veículos)</option>
                  <option value="PRO">Pro (Até 20 veículos)</option>
                  <option value="ENTERPRISE">Enterprise (Ilimitado)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                {loading ? 'Salvando...' : editingEmpresaId ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 rounded-3xl overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Empresas Cadastradas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-xs font-mono text-slate-500 uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Nome</th>
                    <th className="p-3">CNPJ</th>
                    <th className="p-3">Plano</th>
                    <th className="p-3 text-right rounded-r-xl">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {empresas.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{emp.nome}</td>
                      <td className="p-3 text-xs font-mono">{emp.cnpj}</td>
                      <td className="p-3">
                        <span className="bg-purple-100 text-purple-700 text-xs font-mono px-2 py-0.5 rounded-md border border-purple-200">
                          {emp.plano || 'PRO'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditEmpresa(emp)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteEmpresa(emp.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg">
                            <Trash2 className="w-4 h-4" />
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

      {/* TAB USUÁRIOS */}
      {activeTab === 'usuarios' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-3xl h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                {editingUsuarioId ? 'Editar Usuário' : 'Criar & Vincular Usuário'}
              </h3>
              {editingUsuarioId && (
                <button onClick={resetUsuarioForm} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSaveUsuario} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              {!editingUsuarioId && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">E-mail</label>
                    <input
                      type="email"
                      required
                      value={emailUsuario}
                      onChange={(e) => setEmailUsuario(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Senha Inicial</label>
                    <input
                      type="password"
                      required
                      value={senhaUsuario}
                      onChange={(e) => setSenhaUsuario(e.target.value)}
                      placeholder="••••••••"
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500">Nível de Acesso (Role)</label>
                <select
                  value={roleUsuario}
                  onChange={(e) => setRoleUsuario(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="admin_empresa">Admin da Empresa</option>
                  <option value="funcionario">Funcionário / Motorista</option>
                  <option value="super_dev">Super Dev (Acesso Global)</option>
                </select>
              </div>

              {roleUsuario !== 'super_dev' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500">Empresa Vinculada</label>
                  <select
                    required
                    value={empresaIdSelecionada}
                    onChange={(e) => setEmpresaIdSelecionada(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione uma empresa...</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                {loading ? 'Salvando...' : editingUsuarioId ? 'Atualizar Perfil' : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 rounded-3xl overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Usuários do Sistema</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-xs font-mono text-slate-500 uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Nome / E-mail</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3 text-right rounded-r-xl">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usuarios.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-medium text-slate-800">{usr.nome || 'Sem Nome'}</p>
                        <p className="text-xs text-slate-500 font-mono">{usr.email}</p>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                          usr.role === 'super_dev' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {usr.empresas?.nome || (usr.role === 'super_dev' ? 'Acesso Global' : 'Sem Empresa')}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditUsuario(usr)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUsuario(usr.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg">
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}