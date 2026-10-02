import React from 'react';

/**
 * Indicador de carregamento da área de conteúdo (exibido enquanto uma página
 * carregada sob demanda ainda está sendo baixada).
 */
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="Carregando">
      <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
