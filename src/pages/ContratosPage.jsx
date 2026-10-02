import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileText, Plus, Search, Edit, Trash, X, RefreshCw } from 'lucide-react';
import FeedbackBanner from '../components/FeedbackBanner';
import { useContratos } from '../hooks/useContratos';
import { ESTADOS_BRASIL } from '../utils/estados';
import { confirmarAcao } from '../utils/browser';

/**
 * Tela de cadastro e gestão de contratos da empresa.
 * Toda a regra de negócio e acesso a dados está em `useContratos`.
 */
export default function ContratosPage({ userProfile }) {
  const {
    loading,
    feedback,
    limparFeedback,
    busca,
    setBusca,
    contratosFiltrados,
    exibirForm,
    editingId,
    formulario,
    atualizarCampo,
    recarregar,
    abrirNovo,
    prepararEdicao,
    limparFormulario,
    salvar,
    remover,
  } = useContratos(userProfile?.empresa_id);

  const confirmarRemocao = useCallback(
    (id) => {
      if (confirmarAcao('Deseja remover este contrato?')) remover(id);
    },
    [remover]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-purple-600" />
              Cadastro de Contratos
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cadastre e gerencie os contratos da empresa</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={recarregar}
              className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {!exibirForm && (
              <button
                onClick={abrirNovo}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold text-sm rounded-2xl shadow-md hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" /> Novo Contrato
              </button>
            )}
          </div>
        </div>

        <FeedbackBanner feedback={feedback} onFechar={limparFeedback} />

        {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        {exibirForm && (
          <form onSubmit={salvar} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Editar Contrato' : 'Novo Contrato'}
              </h2>
              <button type="button" onClick={limparFormulario} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Contrato *</label>
                <input
                  type="text"
                  required
                  value={formulario.nomeContrato}
                  onChange={(e) => atualizarCampo('nomeContrato', e.target.value)}
                  placeholder="Ex: Contrato SP-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
                <select
                  value={formulario.estadoUf}
                  onChange={(e) => atualizarCampo('estadoUf', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="">Selecione o Estado...</option>
                  {ESTADOS_BRASIL.map(est => (
                    <option key={est.sigla} value={est.sigla}>{est.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={limparFormulario}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-semibold shadow-md"
              >
                {editingId ? 'Salvar Alterações' : 'Cadastrar Contrato'}
              </button>
            </div>
          </form>
        )}

        {/* TABELA DE CONTRATOS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou UF..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="py-3.5 px-4">Contrato</th>
                  <th className="py-3.5 px-4">UF</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contratosFiltrados.length > 0 ? (
                  contratosFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{c.nome_contrato}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{c.estado_uf || '-'}</td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button onClick={() => prepararEdicao(c)} className="p-1.5 bg-slate-100 text-purple-700 rounded-xl">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => confirmarRemocao(c.id)} className="p-1.5 bg-red-50 text-red-600 rounded-xl">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400">
                      Nenhum contrato encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

ContratosPage.propTypes = {
  userProfile: PropTypes.shape({
    empresa_id: PropTypes.string,
  }),
};
