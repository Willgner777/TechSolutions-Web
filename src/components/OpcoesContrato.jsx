import React from 'react';
import PropTypes from 'prop-types';

/**
 * Lista de `<option>` com os contratos de uma empresa, para uso dentro de um `<select>`.
 * Mantém o valor atual selecionável mesmo que o contrato não exista mais na lista.
 */
export default function OpcoesContrato({ contratos, empresaId = '', valorAtual = '' }) {
  const lista = empresaId ? contratos.filter((c) => c.empresa_id === empresaId) : [];
  const existe = lista.some((c) => c.nome_contrato === valorAtual);

  return (
    <>
      <option value="">Selecione um contrato...</option>
      {valorAtual && !existe && <option value={valorAtual}>{valorAtual}</option>}
      {lista.map((c) => (
        <option key={c.id} value={c.nome_contrato}>
          {c.nome_contrato}
          {c.estado_uf ? ` - ${c.estado_uf}` : ''}
        </option>
      ))}
    </>
  );
}

OpcoesContrato.propTypes = {
  contratos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      empresa_id: PropTypes.string,
      nome_contrato: PropTypes.string,
      estado_uf: PropTypes.string,
    })
  ).isRequired,
  empresaId: PropTypes.string,
  valorAtual: PropTypes.string,
};
