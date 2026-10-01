import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './Admbases';
import Menu from './Menu';
import AdminDevPage from './AdminDevPage';
import FuncionariosPage from './FuncionariosPage';

export default function AuthenticatedLayout({ userProfile }) {
  const navigate = useNavigate();
  const eSuperDev = userProfile?.role === 'super_dev';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      {/* MENU LATERAL SIDEBAR */}
      <Menu
        usuarioAtual={userProfile}
        onLogout={handleLogout}
        abrirConsoleDev={() => navigate('/admin-dev')}
      />

      {/* ÁREA DE CONTEÚDO PRINCIPAL (ROTAS INTERNAS) */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Routes>
          {/* Rota do Cadastro de Funcionários */}
          <Route 
            path="/funcionarios" 
            element={<FuncionariosPage userProfile={userProfile} />} 
          />

          {/* Rota Exclusiva do Super Dev */}
          <Route 
            path="/admin-dev" 
            element={
              eSuperDev ? (
                <AdminDevPage userProfile={userProfile} />
              ) : (
                <Navigate to="/funcionarios" replace />
              )
            } 
          />

          {/* Rota Padrão (Redireciona para Funcionários se for usuário normal, ou Admin Dev se for Super Dev) */}
          <Route 
            path="*" 
            element={<Navigate to={eSuperDev ? "/admin-dev" : "/funcionarios"} replace />} 
          />
        </Routes>
      </main>
    </div>
  );
} 