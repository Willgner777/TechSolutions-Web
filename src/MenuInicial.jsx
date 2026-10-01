import React, { useState } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Edit2,
  UserCheck,
  MapPin,
  Calendar,
  ShieldCheck,
  User,
  Mail,
  FileText,
  AlignLeft,
  X,
  LogOut,
  Layoutmenu
} from 'lucide-react';

export default function MenuInicial() {
  // 1. ESTADOS DA SIDEBAR E NAVEGAÇÃO
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cadastrosOpen, setCadastrosOpen] = useState(true); // Controla o menu sanfona de Cadastros
  const [activeMenu, setActiveMenu] = useState('funcionarios'); // Menu selecionado

  // 2. ESTADOS DO MÓDULO DE FUNCIONÁRIOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // MOCK DE EMPRESAS / FILIAIS
  const empresasMock = [
    { id: 'emp_1', nome: 'Empresa Matriz - HQ', uf: 'SP' },
    { id: 'emp_2', nome: 'Filial Regional Nordeste', uf: 'CE' },
    { id: 'emp_3', nome: 'Filial Regional Sul', uf: 'PR' }
  ];

  // HIERARQUIAS (Roles)
  const roles = [
    { value: 'admin_global', label: 'Admin Global' },
    { value: 'admin_master', label: 'Admin Master' },
    { value: 'admin_premium', label: 'Admin Premium' },
    { value: 'admin', label: 'Admin' },
    { value: 'operacional', label: 'Operacional' },
    { value: 'aprendiz', label: 'Aprendiz' }
  ];

  // LISTA DE FUNCIONÁRIOS
  const [funcionarios, setFuncionarios] = useState([
    {
      id: 'usr_101',
      nome: 'Carlos Eduardo Silva',
      email: 'carlos.eduardo@empresa.com',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      cargo: 'Coordenador Operacional',
      gestor_email: 'gerente.geral@empresa.com',
      role: 'admin_premium',
      empresa_id: 'emp_1',
      empresa_nome: 'Empresa Matriz - HQ',
      uf: 'SP',
      contrato_nome: 'Contrato Operação SP-Capital',
      matricula_re: 'RE-8842',
      data_admissao: '2024-02-15',
      data_demissao: '',
      turno: 'Diurno (08:00 - 18:00)',
      descricao: 'Gestor responsável pelo acompanhamento dos contratos da região sudeste.',
      ativo: true
    },
    {
      id: 'usr_102',
      nome: 'Mariana Costa Lima',
      email: 'mariana.costa@empresa.com',
      cpf: '987.654.321-11',
      telefone: '(85) 99123-8877',
      cargo: 'Técnica de Campo Residente',
      gestor_email: 'carlos.eduardo@empresa.com',
      role: 'operacional',
      empresa_id: 'emp_2',
      empresa_nome: 'Filial Regional Nordeste',
      uf: 'CE',
      contrato_nome: 'Contrato Prestação de Serviço - Ceará',
      matricula_re: 'RE-3310',
      data_admissao: '2025-06-01',
      data_demissao: '',
      turno: 'Comercial (08:00 - 17:00)',
      descricao: 'Atua no atendimento operacional em rotas no interior do estado.',
      ativo: true
    }
  ]);

  // ESTADO DO FORMULÁRIO DE CADASTRO
  const initialFormState = {
    id: null,
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: '',
    cargo: '',
    gestor_email: '',
    role: 'operacional',
    empresa_id: 'emp_1',
    contrato_nome: '',
    matricula_re: '',
    data_admissao: new Date().toISOString().split('T')[0],
    data_demissao: '',
    turno: 'Diurno (08:00 - 18:00)',
    descricao: '',
    ativo: true
  };

  const [formData, setFormData] = useState(initialFormState);

  // AÇÕES DE MODAL E MANIPULAÇÃO
  const handleOpenModal = (func = null) => {
    if (func) {
      setFormData({ ...func, senha: '' });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const empSelecionada = empresasMock.find(e => e.id === formData.empresa_id);
    
    const payload = {
      ...formData,
      empresa_nome: empSelecionada ? empSelecionada.nome : 'Empresa Matriz',
      uf: empSelecionada ? empSelecionada.uf : 'SP'
    };

    if (formData.id) {
      setFuncionarios(prev => prev.map(f => f.id === formData.id ? payload : f));
    } else {
      setFuncionarios(prev => [...prev, { ...payload, id: `usr_${Date.now()}` }]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setFuncionarios(prev => prev.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f));
  };

  // FILTRAGEM
  const funcionariosFiltrados = funcionarios.filter(f => {
    const matchSearch = f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.contrato_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.matricula_re.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'todos' || 
                        (filterStatus === 'ativos' && f.ativo) || 
                        (filterStatus === 'inativos' && !f.ativo);
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* ========================================== */}
      {/* 1. BARRA LATERAL (SIDEBAR)                */}
      {/* ========================================== */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        
        {/* LOGO DA EMPRESA NO TOPO */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              TM
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-100 truncate">Empresa Matriz Ltda</p>
                <p className="text-[10px] text-slate-400 font-mono">Portal do Gestor</p>
              </div>
            )}
          </div>
        </div>

        {/* LISTA DE MENUS */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          
          {/* Item 1: menu / Inicio */}
          <button
            onClick={() => setActiveMenu('menu')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'menu' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Layoutmenu className="w-4 h-4 text-indigo-400 shrink-0" />
            {sidebarOpen && <span>menu</span>}
          </button>

          {/* Item 2: GRUPO CADASTROS (COM SUBMENU SANFONA) */}
          <div>
            <button
              onClick={() => setCadastrosOpen(!cadastrosOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                {sidebarOpen && <span>Cadastros</span>}
              </div>
              {sidebarOpen && (
                cadastrosOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Submenu Funcionários */}
            {cadastrosOpen && sidebarOpen && (
              <div className="ml-4 mt-1 pl-3 border-l border-slate-800 space-y-1">
                <button
                  onClick={() => setActiveMenu('funcionarios')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeMenu === 'funcionarios'
                      ? 'bg-indigo-600/10 text-indigo-400 font-semibold border-l-2 border-indigo-500 rounded-l-none'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Funcionários</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RODAPÉ DA SIDEBAR */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
              AG
            </div>
            {sidebarOpen && (
              <div className="truncate text-xs">
                <p className="font-semibold text-slate-200 truncate">Administrador</p>
                <span className="text-[10px] text-emerald-400 font-mono">Sessão Ativa</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (DIREITA)   */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {activeMenu === 'funcionarios' ? 'Cadastro de Funcionários' : 'menu / Menu Inicial'}
            </h1>
            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Matriz & Prestadores de Serviço
            </span>
          </div>

          {activeMenu === 'funcionarios' && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Cadastrar Funcionário
            </button>
          )}
        </header>

        {/* CONTEÚDO DA PÁGINA */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeMenu === 'funcionarios' ? (
            <>
              {/* FILTROS E PESQUISA */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, e-mail, cargo, RE ou contrato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="ativos">Apenas Ativos</option>
                    <option value="inativos">Apenas Inativos</option>
                  </select>
                </div>
              </div>

              {/* TABELA DE FUNCIONÁRIOS */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Funcionário / E-mail</th>
                        <th className="py-3.5 px-4">Cargo & Gestor Imediato</th>
                        <th className="py-3.5 px-4">Região / Contrato Alocado</th>
                        <th className="py-3.5 px-4">Admissão & Turno</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {funcionariosFiltrados.map((func) => (
                        <tr key={func.id} className="hover:bg-slate-50/80 transition-all">
                          
                          {/* Nome e E-mail */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {func.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{func.nome}</p>
                                <p className="text-slate-400 font-mono text-[11px]">{func.email}</p>
                                {func.matricula_re && (
                                  <span className="text-[10px] text-slate-500 font-mono">RE: {func.matricula_re}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Cargo e Gestor Direct */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{func.cargo || 'Cargo não informado'}</p>
                            {func.gestor_email ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                <UserCheck className="w-3 h-3 text-indigo-500" />
                                Gestor: <span className="font-mono text-slate-700">{func.gestor_email}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Sem gestor direto</span>
                            )}
                          </td>

                          {/* Empresa / Região / Contrato */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">{func.empresa_nome}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                <MapPin className="w-2.5 h-2.5 text-indigo-500" /> UF: {func.uf}
                              </span>
                              {func.contrato_nome && (
                                <span className="text-[11px] text-indigo-700 font-medium">
                                  • {func.contrato_nome}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Data de Admissão */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{func.data_admissao ? new Date(func.data_admissao).toLocaleDateString('pt-BR') : '-'}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{func.turno}</p>
                          </td>

                          {/* Status Ativo/Inativo */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(func.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                func.ativo
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {func.ativo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {func.ativo ? 'ATIVO' : 'INATIVO'}
                            </button>
                          </td>

                          {/* Ação Editar */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenModal(func)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                              title="Editar Funcionário"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
              <p className="text-slate-500 text-sm">Selecione uma opção no menu lateral para visualizar.</p>
            </div>
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* 3. MODAL DE CADASTRO / EDIÇÃO             */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                {formData.id ? 'Editar Dados do Funcionário' : 'Cadastrar Novo Funcionário'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SEÇÃO 1: Dados Pessoais */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> 1. Dados Pessoais & Credenciais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silva"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">E-mail Corporativo *</label>
                    <input
                      type="email"
                      required
                      placeholder="colaborador@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {!formData.id && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Senha Inicial *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 2: Cargo e Gestor */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> 2. Função & Gestão Direta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Cargo / Função *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Coordenador Operacional, Técnico de Campo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">E-mail do Gestor Imediato</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="gestor@empresa.com"
                        value={formData.gestor_email}
                        onChange={(e) => setFormData({ ...formData, gestor_email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: Admissão e Região */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> 3. Admissão & Região
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Data de Admissão</label>
                    <input
                      type="date"
                      value={formData.data_admissao}
                      onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Turno de Trabalho</label>
                    <select
                      value={formData.turno}
                      onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Diurno (08:00 - 18:00)">Diurno (08:00 - 18:00)</option>
                      <option value="Comercial (08:00 - 17:00)">Comercial (08:00 - 17:00)</option>
                      <option value="Noturno (22:00 - 06:00)">Noturno (22:00 - 06:00)</option>
                      <option value="Escala 12x36">Escala 12x36</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Unidade / Região Matriz</label>
                    <select
                      value={formData.empresa_id}
                      onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {empresasMock.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nome} ({emp.uf})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: Vínculo de Contrato */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> 4. Vínculo de Contrato da Região
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Contrato Vinculado (Região / Prestador)</label>
                    <input
                      type="text"
                      placeholder="Ex: Contrato Operação Ceará"
                      value={formData.contrato_nome}
                      onChange={(e) => setFormData({ ...formData, contrato_nome: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Matrícula / RE do Colaborador</label>
                    <input
                      type="text"
                      placeholder="Ex: RE-9921"
                      value={formData.matricula_re}
                      onChange={(e) => setFormData({ ...formData, matricula_re: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* BOTOES DE AÇÃO */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Salvar Funcionário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}