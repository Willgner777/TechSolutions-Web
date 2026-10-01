import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDevPage from './AdminDevPage';
import DashboardPage from './DashboardPage'; // Altere para o nome do componente principal da sua aplicação (ex: InicioPage, Home, etc.)

// Componente Guardião estrito para o Super Dev
function RotaSuperDev({ userProfile, children }) {
  if (userProfile?.role !== 'super_dev') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function AuthenticatedLayout({ userProfile }) {
  const eSuperDev = userProfile?.role === 'super_dev';

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <main>
        <Routes>
          {/* Se for super_dev, qualquer tentativa de acessar /dashboard redireciona direto para o painel único /admin-dev */}
          <Route 
            path="/dashboard" 
            element={eSuperDev ? <Navigate to="/admin-dev" replace /> : <DashboardPage userProfile={userProfile} />} 
          />

          {/* Tela Única e Definitiva do Super Dev (All-in-One) */}
          <Route
            path="/admin-dev"
            element={
              <RotaSuperDev userProfile={userProfile}>
                <AdminDevPage userProfile={userProfile} />
              </RotaSuperDev>
            }
          />

          {/* Redirecionamento Fallback Inteligente */}
          <Route
            path="*"
            element={<Navigate to={eSuperDev ? '/admin-dev' : '/dashboard'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}