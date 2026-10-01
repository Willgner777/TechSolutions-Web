import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  ShieldCheck, Building2, Users, RefreshCw, Edit, Trash2, X, LogOut, Search,
  UserCheck, UserX, Power, Briefcase, Mail, GitBranch, Trash, FileText
} from 'lucide-react';

export default function AdminDevPage() {
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'empresas' | 'lixeira'
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
  const [searchUsuario, setSearchUsuario] = useState('');
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [ativoUsuario, setAtivoUsuario] = useState(true);
  const [roleUsuario, setRoleUsuario] = useState('super_dev');
  const [cargoUsuario, setCargoUsuario] = useState('');
  const [contratoUsuario, setContratoUsuario] = useState(''); // Campo de Contrato
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
      // 1. Carregar Empresas Ativas
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (errEmpresas) throw errEmpresas;
      setEmpresas(dataEmpresas || []);

      // 2. Carregar Usuários Ativos
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('perfis')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (errUsuarios) throw errUsuarios;

      // 3. Carregar Lixeira de Usuários
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

  // --- MÉTODOS DE USUÁRIOS E FUNCIONÁRIOS ---
  const prepararEdicaoUsuario = (usr) => {
    setEditingUsuarioId(usr.id);
    setNomeUsuario(usr.nome || '');
    setEmailUsuario(usr.email || '');
    setSenhaUsuario('');
    setAtivoUsuario(usr.ativo !== false);
    setRoleUsuario(usr.role || 'super_dev');
    setCargoUsuario(usr.cargo || usr.cargo_nome || '');
    setContratoUsuario(usr.contrato || '');
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

  // --- MÉTODOS DE EMPRESAS E FILIAIS ---
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

      setFeedback({ type: 'success', message: 'Empresa/Filial salva com sucesso!' });
      setNomeEmpresa('');
      setCnpjEmpresa('');
      setEditingEmpresaId(null);
      carregarDadosGlobais({ manterFeedback: true });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar empresa: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

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

        {/* MENSAGEM FEEDBACK */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between ${
            feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* NAVEGAÇÃO DE ABAS */}
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

            {/* TABELA DE UTILIZADORES */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-4 px-5">Nome</th>
                    <th className="py-4 px-5">E-mail</th>
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
                        <button onClick={() => MoverParaLixeira(usr.id)} className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200" title="Mover para Lixeira">
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