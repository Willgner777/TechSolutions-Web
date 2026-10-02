import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

/**
 * Faixa de mensagem de sucesso/erro exibida no topo das telas de cadastro.
 * Não renderiza nada quando não há mensagem.
 */
export default function FeedbackBanner({ feedback, onFechar }) {
  if (!feedback.message) return null;

  return (
    <div
      className={`p-4 rounded-2xl text-sm border flex items-center justify-between ${
        feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
      }`}
    >
      <span>{feedback.message}</span>
      <button onClick={onFechar}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

FeedbackBanner.propTypes = {
  feedback: PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  onFechar: PropTypes.func.isRequired,
};
