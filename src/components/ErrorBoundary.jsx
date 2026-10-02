import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../utils/logger';

/**
 * Captura erros de renderização dos componentes filhos para que uma falha
 * isolada não derrube a aplicação inteira ("tela branca").
 *
 * Variantes:
 *  - "tela-cheia": usada na raiz da aplicação; oferece recarregar a página.
 *  - "pagina": usada dentro do layout (o menu continua utilizável); oferece tentar novamente.
 */
export default class ErrorBoundary extends React.Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    logger.error('ErrorBoundary', 'Erro de renderização não tratado.', erro, info?.componentStack);
  }

  tentarNovamente = () => {
    this.setState({ erro: null });
  };

  recarregarPagina = () => {
    window.location.reload();
  };

  render() {
    const { erro } = this.state;
    const { children, variante } = this.props;

    if (!erro) return children;

    const telaCheia = variante === 'tela-cheia';

    return (
      <div
        role="alert"
        className={
          telaCheia
            ? 'min-h-screen bg-white flex items-center justify-center p-6 font-sans'
            : 'flex items-center justify-center p-6 font-sans'
        }
      >
        <div className="max-w-md w-full space-y-5 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Algo deu errado</h1>
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
            Ocorreu um erro inesperado ao exibir esta tela. Tente novamente; se o problema persistir, contate o suporte.
          </div>
          <button
            onClick={telaCheia ? this.recarregarPagina : this.tentarNovamente}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3.5 px-4 rounded-2xl shadow-lg transition-all text-sm cursor-pointer"
          >
            {telaCheia ? 'Recarregar página' : 'Tentar novamente'}
          </button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  variante: PropTypes.oneOf(['tela-cheia', 'pagina']),
};

ErrorBoundary.defaultProps = {
  children: null,
  variante: 'tela-cheia',
};
