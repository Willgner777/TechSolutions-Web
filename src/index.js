import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import TelaErroConfiguracao from './components/TelaErroConfiguracao';
import { erroConfiguracao } from './services/supabaseClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {erroConfiguracao ? (
      <TelaErroConfiguracao mensagem={erroConfiguracao} />
    ) : (
      <ErrorBoundary variante="tela-cheia">
        <App />
      </ErrorBoundary>
    )}
  </React.StrictMode>
);
