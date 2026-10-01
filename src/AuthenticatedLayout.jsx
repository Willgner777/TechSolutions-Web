import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDevPage from './AdminDevPage';

// Componente simples para a tela inicial das empresas/funcionários
function DashboardPage({ userProfile }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-800">
      <h1 className="text-2xl font-bold">Painel de Gestão</h1>
      <p className="text-sm text-slate-500 mt-1">
        Bem-vindo(a), <span className="font-semibold text-slate-700">{userProfile?.nome}</span>!
      </p>
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-700 text-sm">
        Sua empresa: <strong>{userProfile?.empresas?.nome || 'Não vinculada'}</strong> | Perfil: <strong>{userProfile?.role}</strong>
      </div>
    </div>
  );
}

// Componente Guardião: só permite entrada se for 'super_dev'
function RotaSuperDev({ userProfile, children }) {
  if (userProfile?.role !== 'super_dev') {
    // Se não for super_dev, manda de volta para o dashboard
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
          {/* Rota do Dashboard (Empresas e Funcionários) */}
          <Route path="/dashboard" element={<DashboardPage userProfile={userProfile} />} />

          {/* Rota Exclusiva de Super Dev com Proteção */}
          <Route
            path="/admin-dev"
            element={
              <RotaSuperDev userProfile={userProfile}>
                <AdminDevPage userProfile={userProfile} />
              </RotaSuperDev>
            }
          />

          {/* Fallback Inteligente: Redireciona de acordo com a Role do Usuário */}
          <Route
            path="*"
            element={<Navigate to={eSuperDev ? '/admin-dev' : '/dashboard'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}