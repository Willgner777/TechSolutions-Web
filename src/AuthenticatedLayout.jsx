import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './Admbases';
import { 
  LayoutDashboard, Truck, Users, Fuel, Wrench, 
  CheckSquare, DollarSign, ShieldAlert, LogOut, Menu, X 
} from 'lucide-react';

import DashboardPage from './DashboardPage';
import VeiculosPage from './VeiculosPage';
import MotoristasPage from './MotoristasPage';
import AbastecimentosPage from './AbastecimentosPage';
import ManutencoesPage from './ManutencoesPage';
import ChecklistPage from './ChecklistPage';
import DespesasPage from './DespesasPage';

export default function AuthenticatedLayout({ userProfile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Veículos', icon: Truck, path: '/veiculos' },
    { label: 'Motoristas', icon: Users, path: '/motoristas' },
    { label: 'Abastecimentos', icon: Fuel, path: '/abastecimentos' },
    { label: 'Manutenções', icon: Wrench, path: '/manutencoes' },
    { label: 'Checklists', icon: CheckSquare, path: '/checklists' },
    { label: 'Despesas', icon: DollarSign, path: '/despesas' },
  ];

  // Adiciona o painel admin dev em segurança se for super_dev
  if (userProfile?.role === 'super_dev') {
    navItems.push({ label: 'Painel Admin Dev', icon: ShieldAlert, path: '/admin-dev' });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-purple-500 selection:text-white">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-900/40">W</div>
          <span className="font-semibold text-lg tracking-wide">WillTech <span className="text-purple-400">Frotas</span></span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-900/50">W</div>
          <div>
            <h1 className="font-bold text-base leading-tight">WillTech</h1>
            <span className="text-xs text-purple-400 font-medium">Gestão Operacional</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { 
                  e.preventDefault(); 
                  window.history.pushState({}, '', item.path); 
                  window.dispatchEvent(new PopStateEvent('popstate')); 
                  setSidebarOpen(false); 
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all group"
              >
                <Icon size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm">
              {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-slate-200">{userProfile?.nome || 'Utilizador'}</p>
              <p className="text-xs text-purple-400 truncate capitalize">{userProfile?.role || 'Cargo'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
          >
            <LogOut size={16} />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage userProfile={userProfile} />} />
          <Route path="/veiculos" element={<VeiculosPage userProfile={userProfile} />} />
          <Route path="/motoristas" element={<MotoristasPage userProfile={userProfile} />} />
          <Route path="/abastecimentos" element={<AbastecimentosPage userProfile={userProfile} />} />
          <Route path="/manutencoes" element={<ManutencoesPage userProfile={userProfile} />} />
          <Route path="/checklists" element={<ChecklistPage userProfile={userProfile} />} />
          <Route path="/despesas" element={<DespesasPage userProfile={userProfile} />} />
          <Route path="/admin-dev" element={<AdminDevPage userProfile={userProfile} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

// Componente placeholder caso o AdminDevPage ainda não esteja criado no projeto
function AdminDevPage({ userProfile }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Painel Administrativo do Programador</h1>
      <p className="text-slate-400">Bem-vindo, {userProfile?.nome}. Aqui podes gerir globalmente todas as empresas da plataforma.</p>
    </div>
  );
}