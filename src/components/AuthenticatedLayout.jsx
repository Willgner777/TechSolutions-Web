import React, { lazy, Suspense, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import ErrorBoundary from './ErrorBoundary';
import PageLoader from './PageLoader';

// Páginas carregadas sob demanda: só são baixadas quando o usuário abre a aba.
const FuncionariosPage = lazy(() => import('../pages/FuncionariosPage'));
const ContratosPage = lazy(() => import('../pages/ContratosPage'));

/**
 * Layout do painel principal para usuários autenticados:
 * menu lateral + conteúdo da aba selecionada.
 */
export default function AuthenticatedLayout({ userProfile, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('funcionarios');

  const abrirConsoleDev = useCallback(() => navigate('/admin-dev'), [navigate]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Menu Sidebar Lateral */}
      <Menu
        usuarioAtual={userProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        abrirConsoleDev={abrirConsoleDev}
      />

      {/* Conteúdo dinâmico de acordo com a aba selecionada no Menu */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <ErrorBoundary key={activeTab} variante="pagina">
          <Suspense fallback={<PageLoader />}>
            {activeTab === 'funcionarios' && <FuncionariosPage userProfile={userProfile} />}
            {activeTab === 'contratos' && <ContratosPage userProfile={userProfile} />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

AuthenticatedLayout.propTypes = {
  userProfile: PropTypes.shape({
    role: PropTypes.string,
    nome: PropTypes.string,
    email: PropTypes.string,
    empresa_id: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};
