import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Users, UserPlus, Search, Edit, Trash, X, RefreshCw } from 'lucide-react';
import FeedbackBanner from '../components/FeedbackBanner';
import { useFuncionarios } from '../hooks/useFuncionarios';
import { ESTADOS_BRASIL } from '../utils/estados';
import { formatarDataBR } from '../utils/formatters';
import { confirmarAcao } from '../utils/browser';

/**
 * Tela de cadastro e gestão de funcionários da empresa.
 * Toda a regra de negócio e acesso a dados está em `useFuncionarios`.
 */
export default function FuncionariosPage({ userProfile }) {
  const {
    loading,
    feedback,
    limparFeedback,
    busca,
    setBusca,
    contratos,
    funcionariosFiltrados,
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
  } = useFuncionarios(userProfile?.empresa_id);

  const confirmarRemocao = useCallback(
    (id) => {
      if (confirmarAcao('Deseja remover este funcionário?')) remover(id);
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
              <Users className="w-7 h-7 text-purple-600" />
              Gestão de Funcionários
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cadastre e gerencie a equipe da empresa</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={recarregar}
              className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* BOTÃO QUE ABRE O FORMULÁRIO */}
            {!exibirForm && (
              <button
                onClick={abrirNovo}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold text-sm rounded-2xl shadow-md hover:bg-purple-700 transition"
              >
                <UserPlus className="w-4 h-4" /> + Novo Funcionário
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
                {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <button type="button" onClick={limparFormulario} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formulario.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formulario.email}
                  onChange={(e) => atualizarCampo('email', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Senha Provisória *</label>
                <input
                  type="password"
                  required={!editingId}
                  value={formulario.senha}
                  onChange={(e) => atualizarCampo('senha', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo</label>
                <input
                  type="text"
                  value={formulario.cargo}
                  onChange={(e) => atualizarCampo('cargo', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Setor / Departamento</label>
                <input
                  type="text"
                  value={formulario.setor}
                  onChange={(e) => atualizarCampo('setor', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contrato Vinculado</label>
                <select
                  value={formulario.contrato}
                  onChange={(e) => atualizarCampo('contrato', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="">Selecione um contrato...</option>
                  {contratos.map(c => (
                    <option key={c.id} value={c.nome_contrato}>
                      {c.nome_contrato}{c.estado_uf ? ` - ${c.estado_uf}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
                <select
                  value={formulario.uf}
                  onChange={(e) => atualizarCampo('uf', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="">Selecione o Estado...</option>
                  {ESTADOS_BRASIL.map(est => (
                    <option key={est.sigla} value={est.sigla}>{est.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  value={formulario.dataAdmissao}
                  onChange={(e) => atualizarCampo('dataAdmissao', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Demissão</label>
                <input
                  type="date"
                  value={formulario.dataDemissao}
                  onChange={(e) => atualizarCampo('dataDemissao', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={formulario.status}
                  onChange={(e) => atualizarCampo('status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Afastado">Afastado</option>
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
                {editingId ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
              </button>
            </div>
          </form>
        )}

        {/* TABELA DE FUNCIONÁRIOS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">Cargo / Setor</th>
                  <th className="py-3.5 px-4">UF</th>
                  <th className="py-3.5 px-4">Admissão</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {funcionariosFiltrados.length > 0 ? (
                  funcionariosFiltrados.map((func) => (
                    <tr key={func.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{func.nome || 'Sem Nome'}</div>
                        <div className="text-[11px] text-slate-500">{func.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{func.cargo || '-'}</div>
                        <span className="text-[10px] text-slate-400">{func.setor}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{func.uf || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatarDataBR(func.data_admissao)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold border ${
                          func.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {func.status || 'Ativo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button onClick={() => prepararEdicao(func)} className="p-1.5 bg-slate-100 text-purple-700 rounded-xl">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => confirmarRemocao(func.id)} className="p-1.5 bg-red-50 text-red-600 rounded-xl">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Nenhum funcionário encontrado.
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

FuncionariosPage.propTypes = {
  userProfile: PropTypes.shape({
    empresa_id: PropTypes.string,
  }),
};
