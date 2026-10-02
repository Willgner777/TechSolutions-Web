import React from 'react';
import PropTypes from 'prop-types';
import { sair } from '../services/authService';

/**
 * Tela exibida quando o usuário está autenticado, mas não pode acessar o
 * sistema (sem perfil, desativado ou erro ao carregar o perfil).
 */
export default function TelaAcessoBloqueado({ mensagem }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-white font-black text-xl tracking-tighter">W</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Acesso indisponível</h1>
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">{mensagem}</div>
        <button
          onClick={sair}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3.5 px-4 rounded-2xl shadow-lg transition-all text-sm cursor-pointer"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

TelaAcessoBloqueado.propTypes = {
  mensagem: PropTypes.string.isRequired,
};
