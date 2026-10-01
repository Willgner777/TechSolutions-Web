import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  ShieldCheck, Building2, Users, RefreshCw, Edit, Trash2, X, LogOut, Search,
  Power, GitBranch, Trash
} from 'lucide-react';

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('empresas'); // 'usuarios' | 'empresas' | 'lixeira'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // ESTADOS: Empresas e Filiais
  const [empresas, setEmpresas] = useState([]);
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [ufEmpresa, setUfEmpresa] = useState('SP');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');
  const [tipoEmpresa, setTipoEmpresa] = useState('MATRIZ');
  const [matrizIdSelecionada, setMatrizIdSelecionada] = useState('');

  // ESTADOS: Usuários / Funcionários
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
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (errEmpresas) throw errEmpresas;
      setEmpresas(dataEmpresas || []);

      // 2. Carregar Usuários
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('perfis')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (errUsuarios) throw errUsuarios;

      // 3. Carregar Lixeira
      const { data: dataLixeira } = await supabase
        .from('perfis')
        .select('*')
        .not('deleted_at', 'is', null);
      setUsuariosLixeira(dataLixeira || []);

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

  // --- MÉTODOS DE EMPRESAS ---
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
      } else {
        const { error } = await supabase.from('empresas').insert([payload]);
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

  const excluirEmpresa = async (id) => {
    if (!window.confirm('Excluir esta empresa/filial?')) return;
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

  // --- MÉTODOS DE USUÁRIOS ---
  const prepararEdicaoUsuario = (usr) => {
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

  const MoverParaLixeira = async (id) => {
    if (!window.confirm('Deseja mover este utilizador para a Lixeira?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Utilizador movido para a Lixeira!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao mover para lixeira: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const restaurarDaLixeira = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ deleted_at: null })
        .eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Utilizador restaurado com sucesso!' });
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao restaurar: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => setActiveTab('lixeira')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'lixeira' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:bg-red-50'
            }`}
          >
            <Trash className="w-4 h-4" /> Lixeira ({usuariosLixeira.length})
          </button>
        </div>

        {/* TAB 1: UTILIZADORES */}
        {activeTab === 'usuarios' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
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

                  {/* CAMPO DE VÍNCULO DE EMPRESA / FILIAL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Empresa / Filial Vinculada {roleUsuario === 'super_dev' && '(Não aplicável ao Super Dev)'}
                    </label>
                    <select 
                      value={empresaIdSelecionada} 
                      onChange={(e) => setEmpresaIdSelecionada(e.target.value)} 
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
                    <input type="text" value={contratoUsuario} onChange={(e) => setContratoUsuario(e.target.value)} placeholder="Ex: Contrato SP-01" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
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

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-4 px-5">Nome</th>
                    <th className="py-4 px-5">E-mail</th>
                    <th className="py-4 px-5">Empresa / Unidade</th>
                    <th className="py-4 px-5">Cargo</th>
                    <th className="py-4 px-5">Contrato</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map(usr => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EMPRESAS & FILIAIS */}
        {activeTab === 'empresas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {editingEmpresaId ? 'Editar Empresa / Filial' : 'Cadastrar Empresa / Filial'}
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
                  className="w-full mt-2 bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer"
                >
                  {editingEmpresaId ? 'Atualizar Registro' : 'Cadastrar Empresa / Filial'}
                </button>
              </form>
            </div>

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
                            <button onClick={() => prepararEdicaoEmpresa(emp)} className="p-1.5 bg-slate-100 text-purple-700 rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => excluirEmpresa(emp.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg">
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

        {/* TAB 3: LIXEIRA */}
        {activeTab === 'lixeira' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trash className="w-4 h-4 text-red-600" /> Utilizadores Removidos (Lixeira)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuariosLixeira.map(usr => (
                    <tr key={usr.id}>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{usr.nome}</td>
                      <td className="py-3.5 px-4 text-slate-600">{usr.email}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button onClick={() => restaurarDaLixeira(usr.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                          Restaurar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}