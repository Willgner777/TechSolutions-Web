import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { supabase } from './Admbases';
import {
  LayoutDashboard, Truck, Users, Fuel, Wrench,
  CheckSquare, DollarSign, ShieldAlert, LogOut, Menu, X,
} from 'lucide-react';

import DashboardPage from './DashboardPage';
import VeiculosPage from './VeiculosPage';
import MotoristasPage from './MotoristasPage';
import AbastecimentosPage from './AbastecimentosPage';
import ManutencoesPage from './ManutencoesPage';
import ChecklistPage from './ChecklistPage';
import DespesasPage from './DespesasPage';
import AdminDevPage from './AdminDevPage';

const NAV_EMPRESA = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Veículos', icon: Truck, path: '/veiculos' },
  { label: 'Motoristas', icon: Users, path: '/motoristas' },
  { label: 'Abastecimentos', icon: Fuel, path: '/abastecimentos' },
  { label: 'Manutenções', icon: Wrench, path: '/manutencoes' },
  { label: 'Checklists', icon: CheckSquare, path: '/checklists' },
  { label: 'Despesas', icon: DollarSign, path: '/despesas' },
];

function SemEmpresa() {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-3">
      <h1 className="text-2xl font-bold text-slate-800">Usuário sem empresa</h1>
      <p className="text-sm text-slate-500">
        O seu usuário ainda não está vinculado a uma empresa. Peça a um administrador para fazer o vínculo.
      </p>
    </div>
  );
}

export default function AuthenticatedLayout({ userProfile, home }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSuperDev = userProfile?.role === 'super_dev';
  const temEmpresa = Boolean(userProfile?.empresa_id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    ...(temEmpresa ? NAV_EMPRESA : []),
    ...(isSuperDev ? [{ label: 'Painel Admin Dev', icon: ShieldAlert, path: '/admin-dev' }] : []),
  ];

  const empresaRoute = (pagina) => (temEmpresa ? pagina : <SemEmpresa />);
  const cargo = (userProfile?.role || 'Cargo').replace(/_/g, ' ');

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-white text-slate-800 flex flex-col md:flex-row font-sans selection:bg-purple-500 selection:text-white">
      {/* Topbar mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-indigo-950 to-purple-900 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/30">W</div>
          <span className="font-semibold text-lg tracking-wide">WillTech <span className="text-purple-300">Frotas</span></span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-purple-200 hover:text-white" aria-label="Menu">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/60" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Menu lateral (mesmo painel roxo do login) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-black text-xl tracking-tighter">W</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-white tracking-wide">WillTech</h1>
            <span className="text-xs text-purple-200/70 font-medium">Gestão Operacional</span>
          </div>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20 shadow-lg shadow-purple-500/10'
                      : 'text-purple-200/70 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-purple-300' : 'text-purple-300/60 group-hover:text-purple-300'} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-sm">
              {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{userProfile?.nome || 'Utilizador'}</p>
              <p className="text-xs text-purple-200/70 truncate capitalize">{userProfile?.empresas?.nome || cargo}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-rose-200 hover:bg-rose-500/10 border border-rose-300/30 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Terminar Sessão</span>
          </button>
          <p className="text-[11px] text-purple-300/50 text-center mt-3">© 2026 Todos os direitos reservados.</p>
        </div>
      </aside>

      {/* Conteúdo (mesmo fundo branco do lado direito do login) */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-white p-6 md:p-8">
        <Routes>
          <Route path="/dashboard" element={empresaRoute(<DashboardPage userProfile={userProfile} />)} />
          <Route path="/veiculos" element={empresaRoute(<VeiculosPage userProfile={userProfile} />)} />
          <Route path="/motoristas" element={empresaRoute(<MotoristasPage userProfile={userProfile} />)} />
          <Route path="/abastecimentos" element={empresaRoute(<AbastecimentosPage userProfile={userProfile} />)} />
          <Route path="/manutencoes" element={empresaRoute(<ManutencoesPage userProfile={userProfile} />)} />
          <Route path="/checklists" element={empresaRoute(<ChecklistPage userProfile={userProfile} />)} />
          <Route path="/despesas" element={empresaRoute(<DespesasPage userProfile={userProfile} />)} />
          <Route path="/admin-dev" element={isSuperDev ? <AdminDevPage /> : <Navigate to={home} replace />} />
          <Route path="*" element={temEmpresa || isSuperDev ? <Navigate to={home} replace /> : <SemEmpresa />} />
        </Routes>
      </main>
    </div>
  );
}
