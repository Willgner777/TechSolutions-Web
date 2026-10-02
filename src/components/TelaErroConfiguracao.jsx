import React from 'react';
import PropTypes from 'prop-types';

/**
 * Tela exibida quando a aplicação não consegue iniciar por falta de
 * configuração (variáveis de ambiente do `.env`).
 */
export default function TelaErroConfiguracao({ mensagem }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-white font-black text-xl tracking-tighter">W</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Configuração incompleta</h1>
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">{mensagem}</div>
      </div>
    </div>
  );
}

TelaErroConfiguracao.propTypes = {
  mensagem: PropTypes.string.isRequired,
};
