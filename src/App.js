import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthSession } from './hooks/useAuthSession';
import TelaCarregando from './components/TelaCarregando';
import TelaAcessoBloqueado from './components/TelaAcessoBloqueado';

// Code splitting: cada rota é baixada apenas quando necessária.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDevPage = lazy(() => import('./pages/AdminDevPage'));
const AuthenticatedLayout = lazy(() => import('./components/AuthenticatedLayout'));

const ROTA_ADMIN_DEV = '/admin-dev';
const ROTA_DASHBOARD = '/dashboard';
const ROTA_LOGIN = '/login';

/**
 * Raiz da aplicação: controla sessão, bloqueios de acesso e rotas.
 */
export default function App() {
  const { session, userProfile, erroPerfil, loading, logout } = useAuthSession();

  if (loading) return <TelaCarregando />;

  // Tratamento de acessos bloqueados/sem perfil
  if (session) {
    if (!userProfile) {
      return <TelaAcessoBloqueado mensagem={erroPerfil || 'Perfil não encontrado.'} />;
    }
    if (userProfile.ativo === false) {
      return <TelaAcessoBloqueado mensagem="Este utilizador está desativado." />;
    }
  }

  const eSuperDev = userProfile?.role === 'super_dev';
  const home = eSuperDev ? ROTA_ADMIN_DEV : ROTA_DASHBOARD;

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<TelaCarregando />}>
        <Routes>
          <Route path={ROTA_LOGIN} element={!session ? <LoginPage /> : <Navigate to={home} replace />} />

          {/* Console Super Dev */}
          <Route
            path={ROTA_ADMIN_DEV}
            element={
              session && eSuperDev ? (
                <AdminDevPage />
              ) : (
                <Navigate to={session ? ROTA_DASHBOARD : ROTA_LOGIN} replace />
              )
            }
          />

          {/* Painel principal para usuários / funcionários */}
          <Route
            path={ROTA_DASHBOARD}
            element={
              session ? (
                <AuthenticatedLayout userProfile={userProfile} onLogout={logout} />
              ) : (
                <Navigate to={ROTA_LOGIN} replace />
              )
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to={session ? home : ROTA_LOGIN} replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
