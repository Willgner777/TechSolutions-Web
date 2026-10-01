import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDevPage from './AdminDevPage';
import MenuInicial from './MenuInicial';

function RotaSuperDev({ userProfile, children }) {
  if (userProfile?.role !== 'super_dev') {
    return <Navigate to="/menu-inicial" replace />;
  }
  return children;
}

export default function AuthenticatedLayout({ userProfile }) {
  const eSuperDev = userProfile?.role === 'super_dev';

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <main className="p-6">
        <Routes>
          <Route path="/menu-inicial" element={<MenuInicial userProfile={userProfile} />} />

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
            element={<Navigate to={eSuperDev ? '/admin-dev' : '/menu-inicial'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}