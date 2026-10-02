import React from 'react';

/**
 * Tela cheia de carregamento exibida durante a verificação da sessão
 * e o carregamento inicial das rotas.
 */
export default function TelaCarregando() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-purple-200/80">A carregar WillTech Solutions...</p>
      </div>
    </div>
  );
}
