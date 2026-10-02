import React from 'react';
import { ShieldCheck, Building2, Users, RefreshCw, LogOut, Trash, FileText } from 'lucide-react';
import FeedbackBanner from '../components/FeedbackBanner';
import UsuariosTab from '../components/admin/UsuariosTab';
import EmpresasTab from '../components/admin/EmpresasTab';
import ContratosTab from '../components/admin/ContratosTab';
import LixeiraTab from '../components/admin/LixeiraTab';
import { useAdminDev } from '../hooks/useAdminDev';

/**
 * Console Super Dev: gestão central de usuários, empresas, contratos e lixeira.
 * Estado e regras de negócio ficam em `useAdminDev`; as abas ficam em `components/admin`.
 */
export default function AdminDevPage() {
  const admin = useAdminDev();
  const {
    activeTab,
    carregarDadosGlobais,
    contratos,
    empresas,
    empresasMatrizes,
    feedback,
    handleLogout,
    limparFeedback,
    loading,
    setActiveTab,
    totalAtivos,
    totalInativos,
    totalLixeira,
    totalSemEmpresa,
    usuarios,
  } = admin;

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

        {/* RESUMO GERAL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" /> Empresas
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{empresas.length}</p>
            <p className="text-[11px] text-slate-500">{empresasMatrizes.length} matriz(es) · {empresas.length - empresasMatrizes.length} filial(is)</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Utilizadores
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{usuarios.length}</p>
            <p className="text-[11px] text-slate-500">{totalAtivos} ativo(s) · {totalInativos} inativo(s)</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" /> Contratos
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{contratos.length}</p>
            <p className="text-[11px] text-slate-500">cadastrados nas empresas</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Sem empresa
            </p>
            <p className={`text-2xl font-bold mt-2 ${totalSemEmpresa > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{totalSemEmpresa}</p>
            <p className="text-[11px] text-slate-500">utilizadores sem vínculo</p>
          </div>
        </div>

        <FeedbackBanner feedback={feedback} onFechar={limparFeedback} />

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
            onClick={() => setActiveTab('contratos')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'contratos' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <FileText className="w-4 h-4" /> Contratos ({contratos.length})
          </button>

          <button
            onClick={() => setActiveTab('lixeira')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer ${
              activeTab === 'lixeira' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:bg-red-50'
            }`}
          >
            <Trash className="w-4 h-4" /> Lixeira ({totalLixeira})
          </button>
        </div>

        {activeTab === 'usuarios' && <UsuariosTab admin={admin} />}
        {activeTab === 'empresas' && <EmpresasTab admin={admin} />}
        {activeTab === 'contratos' && <ContratosTab admin={admin} />}
        {activeTab === 'lixeira' && <LixeiraTab admin={admin} />}
      </div>
    </div>
  );
}
