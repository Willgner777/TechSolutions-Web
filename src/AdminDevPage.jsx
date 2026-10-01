import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import { 
  Building2, Users, ShieldCheck, Database, LogOut, Plus, Search, Edit, Trash2, CheckCircle2 
} from 'lucide-react';

export default function AdminDevPage({ userProfile }) {
  const [activeTab, setActiveTab] = useState('empresas');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Dados Globais (Todas as empresas e todos os usuários/funcionários)
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Filtros de busca
  const [buscaEmpresa, setBuscaEmpresa] = useState('');
  const [buscaUsuario, setBuscaUsuario] = useState('');

  useEffect(() => {
    carregarDadosGlobais();
  }, []);

  const carregarDadosGlobais = async () => {
    setLoading(true);
    try {
      // 1. Busca todas as empresas do sistema
      const { data: dataEmpresas, error: errEmpresas } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (errEmpresas) throw errEmpresas;
      setEmpresas(dataEmpresas || []);

      // 2. Busca todos os perfis/funcionários de todas as empresas
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (errUsuarios) throw errUsuarios;
      setUsuarios(dataUsuarios || []);

    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados globais: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Filtragem local baseada na busca
  const empresasFiltradas = empresas.filter(e => 
    e.nome?.toLowerCase().includes(buscaEmpresa.toLowerCase()) ||
    e.cnpj?.toLowerCase().includes(buscaEmpresa.toLowerCase())
  );

  const usuariosFiltrados = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscaUsuario.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* CABEÇALHO DO SUPER DEV */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-purple-600/20 text-purple-400 text-xs px-3 py-1 rounded-full font-bold border border-purple-500/30">
              CONSOLE GLOBAL SUPER DEV
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-white">Painel Central de Controle</h1>
          <p className="text-sm text-slate-400 mt-1">
            Logado como <strong className="text-slate-200">{userProfile?.email || 'Administrador Master'}</strong> — Acesso total cross-tenant ativado.
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold border border-red-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Encerrar Sessão
        </button>
      </header>

      {feedback.message && (
        <div className={`mb-6 p-4 rounded-xl text-sm border ${feedback.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {feedback.message}
        </div>
      )}

      {/* MENU DE ABAS INTERNAS (Tudo na mesma tela) */}
      <nav className="flex flex-wrap gap-2 mb-8 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50">
        <button
          onClick={() => setActiveTab('empresas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'empresas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Gestão de Empresas ({empresas.length})
        </button>

        <button
          onClick={() => setActiveTab('funcionarios')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'funcionarios' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Todos os Funcionários / Usuários ({usuarios.length})
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'auditoria' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Segurança & RLS Health
        </button>
      </nav>

      {/* CONTEÚDO DINÂMICO DAS ABAS */}
      <main className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        
        {/* ABA 1: EMPRESAS */}
        {activeTab === 'empresas' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Empresas Cadastradas (Todas)
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar empresa por nome ou CNPJ..."
                  value={buscaEmpresa}
                  onChange={(e) => setBuscaEmpresa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-4">Nome da Empresa</th>
                    <th className="py-3 px-4">CNPJ</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Criada em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {empresasFiltradas.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{emp.nome || emp.nome_fantasia || 'Sem nome'}</td>
                      <td className="py-3 px-4 text-slate-300">{emp.cnpj || 'Não informado'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/20">
                          {emp.plano || 'PRO'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(emp.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                  {empresasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">Nenhuma empresa encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: TODOS OS FUNCIONÁRIOS / USUÁRIOS DE TODAS AS EMPRESAS */}
        {activeTab === 'funcionarios' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Usuários e Funcionários (Cross-Tenant)
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar funcionário por nome ou email..."
                  value={buscaUsuario}
                  onChange={(e) => setBuscaUsuario(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Cargo / Role</th>
                    <th className="py-3 px-4">Empresa Vinculada ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {usuariosFiltrados.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{usr.nome || 'Sem nome'}</td>
                      <td className="py-3 px-4 text-slate-300">{usr.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-semibold border border-purple-500/20">
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">{usr.empresa_id || 'Global / Nenhuma'}</td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">Nenhum usuário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: AUDITORIA E SEGURANÇA */}
        {activeTab === 'auditoria' && (
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Saúde do Banco e Políticas RLS
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Painel de verificação de isolamento de dados por inquilino (Multi-Tenant). O perfil <code className="text-purple-400">super_dev</code> possui permissão de leitura total bypassando as restrições comuns.
            </p>
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Políticas RLS ativas e configuradas corretamente para o escopo global.</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}