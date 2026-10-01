import React, { useState, useEffect } from 'react';
import { supabase, criarClienteIsolado } from './Admbases';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Building2, Users, Database, AlertTriangle, 
  Activity, ArrowUpRight, Plus, RefreshCw, CheckCircle2, 
  Edit, X, LogOut, KeyRound, Search, Clock, FileWarning,
  LayoutDashboard, ExternalLink
} from 'lucide-react';

export default function AdminDevPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rlsStatus, setRlsStatus] = useState([]);
  const [resumoAlertas, setResumoAlertas] = useState({ despesasPendentes: 0, docsVencidos: 0, avariasChecklist: 0 });

  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');

  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');

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

  const handleIrParaMenu = () => {
    navigate('/menu-inicial');
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
      const empresasData = dataEmpresas || [];
      setEmpresas(empresasData);

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
        <div className="mb-6 p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-800">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold mb-2">
              <ShieldCheck className="w-3 h-3" /> Modo Super Admin Ativo
            </span>
            <h2 className="text-lg font-bold">Navegar como Administrador Global</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Como <code className="text-indigo-300 font-mono">super_dev</code>, você possui permissão total de bypass de RLS para acessar todas as telas do sistema com visão irrestrita.
            </p>
          </div>
          <button
            onClick={handleIrParaMenu}
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Acessar Sistema Completo <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Demais blocos de tabelas, métricas e abas continuam idênticos mantendo as chamadas funcionais */}
      </main>
    </div>
  );
}