import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDevPage from './AdminDevPage';
import MenuInicial from './MenuInicial'; // Menu para usuários comuns das empresas

// Componente Guardião estrito para o Super Dev
function RotaSuperDev({ userProfile, children }) {
  if (userProfile?.role !== 'super_dev') {
    return <Navigate to="/menu-inicial" replace />;
  }
  return children;
}

export default function AuthenticatedLayout({ userProfile }) {
  const eSuperDev = userProfile?.role === 'super_dev';

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <main>
        <Routes>
          {/* Se for super_dev, qualquer tentativa de acessar /menu-inicial redireciona direto para o painel unico /admin-dev */}
          <Route 
            path="/menu-inicial" 
            element={eSuperDev ? <Navigate to="/admin-dev" replace /> : <MenuInicial userProfile={userProfile} />} 
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
            element={<Navigate to={eSuperDev ? '/admin-dev' : '/menu-inicial'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}