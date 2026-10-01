import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './Admbases';
import { LogOut } from 'lucide-react';
import AdminDevPage from './AdminDevPage';

// Componente da tela inicial para empresas/funcionários
function DashboardPage({ userProfile }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Painel de Gestão</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bem-vindo(a), <span className="font-semibold text-slate-700">{userProfile?.nome}</span>!
          </p>
        </div>

        {/* BOTÃO DE LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold border border-red-200 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-700 text-sm">
        Sua empresa: <strong>{userProfile?.empresas?.nome || 'Não vinculada'}</strong> | Perfil: <strong>{userProfile?.role}</strong>
      </div>
    </div>
  );
}

// Componente Guardião: só permite entrada se for 'super_dev'
function RotaSuperDev({ userProfile, children }) {
  if (userProfile?.role !== 'super_dev') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function AuthenticatedLayout({ userProfile }) {
  const eSuperDev = userProfile?.role === 'super_dev';

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <main className="p-6">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage userProfile={userProfile} />} />

          <Route
            path="/admin-dev"
            element={
              <RotaSuperDev userProfile={userProfile}>
                <AdminDevPage userProfile={userProfile} />
              </RotaSuperDev>
            }
          />

          <Route
            path="*"
            element={<Navigate to={eSuperDev ? '/admin-dev' : '/dashboard'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}