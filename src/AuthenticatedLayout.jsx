import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDevPage from './AdminDevPage';
import { supabase } from './Admbases';

function TelaAcessoNegado() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xl">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-sm text-slate-400">
            Esta aplicação é de uso exclusivo para administradores de desenvolvimento. O seu perfil não possui permissão de acesso.
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-2xl shadow-lg transition-all text-sm cursor-pointer"
        >
          Sair e voltar ao login
        </button>
      </div>
    </div>
  );
}

export default function AuthenticatedLayout({ userProfile }) {
  const eSuperDev = userProfile?.role === 'super_dev';

  if (!eSuperDev) {
    return <TelaAcessoNegado />;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <main>
        <Routes>
          {/* Rota principal do Super Dev */}
          <Route path="/admin-dev" element={<AdminDevPage userProfile={userProfile} />} />
          
          {/* Qualquer outra rota redireciona para o painel admin-dev */}
          <Route path="*" element={<Navigate to="/admin-dev" replace />} />
        </Routes>
      </main>
    </div>
  );
}