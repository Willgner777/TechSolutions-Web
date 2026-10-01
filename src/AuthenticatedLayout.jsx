import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './Admbases';
import AdminDevPage from './AdminDevPage';
import MenuInicial from './MenuInicial';
import { LogOut, ShieldCheck } from 'lucide-react';

export default function AuthenticatedLayout({ userProfile }) {
  const navigate = useNavigate();
  const eSuperDev = userProfile?.role?.toLowerCase() === 'super_dev' || userProfile?.role?.toLowerCase() === 'superdev';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* Barra Superior Responsiva com Logoff e Atalho de Dev */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              WillTech Operations
              {eSuperDev && (
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SUPER DEV
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {userProfile?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {eSuperDev && (
            <button
              onClick={() => navigate('/admin-dev')}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Painel Dev
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Container de Rotas Responsivo */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Routes>
          <Route path="/menu-inicial" element={<MenuInicial userProfile={userProfile} />} />
          
          <Route
            path="/admin-dev"
            element={
              eSuperDev ? (
                <AdminDevPage userProfile={userProfile} />
              ) : (
                <Navigate to="/menu-inicial" replace />
              )
            }
          />

          <Route
            path="*"
            element={<Navigate to={eSuperDev ? '/admin-dev' : '/menu-inicial'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}