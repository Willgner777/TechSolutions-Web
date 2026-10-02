import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Package, PackagePlus, Search, Edit, Trash2, X, RefreshCw, Download, Power } from 'lucide-react';
import FeedbackBanner from '../components/FeedbackBanner';
import { useMateriais } from '../hooks/useMateriais';
import { exportarCSV } from '../utils/utils';

/**
 * Tela de cadastro e gestão de materiais da empresa (para admin_empresa).
 * Usa o hook useAdminMateriais que já filtra pela empresa do usuário logado.
 */
export default function MateriaisPage({ userProfile }) {
  // super_dev enxerga todas as empresas e não precisa de empresa vinculada
  const superDev = [userProfile?.perfil, userProfile?.role, userProfile?.papel, userProfile?.tipo]
    .includes('super_dev');

  const {
    loading,
    feedback,
    limparFeedback,
    materiais,
    exibirForm,
    editingId,
    formulario,
    setFormulario,
    proximoCod,
    recarregarMateriais,
    abrirNovo,
    prepararEdicao,
    limparForm,
    salvar,
    remover,
    toggleAtivo,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
  } = useMateriais(userProfile?.empresa_id, { superDev });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-7 h-7 text-purple-600" />
              Gestão de Materiais
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cadastre e gerencie os materiais da empresa</p>
          </div>

          <div className="flex items-center gap-3">
            {superDev && (
              <select
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                className="bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold"
              >
                <option value="">Todas as empresas</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            )}
            <button
              onClick={recarregarMateriais}
              className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => exportarCSV(materiais, 'materiais.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            
            {!exibirForm && (
              <button
                onClick={abrirNovo}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold text-sm rounded-2xl shadow-md hover:bg-purple-700 transition"
              >
                <PackagePlus className="w-4 h-4" /> + Novo Material
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
                {editingId ? 'Editar Material' : 'Novo Material'}
              </h2>
              <button type="button" onClick={limparForm} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Código</label>
                <input
                  type="text"
                  disabled
                  value={editingId ? String(formulario.codigo).padStart(2, '0') : String(proximoCod).padStart(2, '0')}
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-slate-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Material *</label>
                <input
                  type="text"
                  required
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: Botina tam 45 masculino"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unidade (UMB)</label>
                <select
                  value={formulario.umb}
                  onChange={(e) => setFormulario({ ...formulario, umb: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold"
                >
                  <option value="UN">UN (Unidade)</option>
                  <option value="PAR">PAR (Par)</option>
                  <option value="KG">KG (Quilograma)</option>
                  <option value="MT">MT (Metro)</option>
                  <option value="LT">LT (Litro)</option>
                  <option value="CX">CX (Caixa)</option>
                  <option value="PCT">PCT (Pacote)</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição / Detalhes</label>
                <textarea
                  rows={2}
                  value={formulario.descricao}
                  onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                  placeholder="Detalhes adicionais (marca, especificações, etc.)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={limparForm}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-semibold shadow-md"
              >
                {editingId ? 'Atualizar Material' : 'Salvar Material'}
              </button>
            </div>
          </form>
        )}

        {/* TABELA DE MATERIAIS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="py-3.5 px-4 w-20">Cód</th>
                  {superDev && <th className="py-3.5 px-4">Empresa</th>}
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4">UMB</th>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materiais.length > 0 ? (
                  materiais.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {String(mat.codigo).padStart(2, '0')}
                      </td>
                      {superDev && (
                        <td className="py-3.5 px-4 text-slate-600">{mat.empresa_nome || '-'}</td>
                      )}
                      <td className="py-3.5 px-4 font-bold text-slate-800">{mat.nome}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{mat.umb || 'UN'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{mat.descricao || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold border ${
                          mat.ativo !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {mat.ativo !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => toggleAtivo(mat)}
                          title={mat.ativo !== false ? 'Desativar' : 'Ativar'}
                          className={`p-1.5 rounded-xl border ${
                            mat.ativo !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => prepararEdicao(mat)}
                          className="p-1.5 bg-slate-100 text-purple-700 rounded-xl"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remover(mat.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={superDev ? 7 : 6} className="py-8 text-center text-slate-400">
                      Nenhum material cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => exportarCSV(materiais, 'materiais.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

MateriaisPage.propTypes = {
  userProfile: PropTypes.shape({
    empresa_id: PropTypes.string,
    perfil: PropTypes.string,
    role: PropTypes.string,
    papel: PropTypes.string,
    tipo: PropTypes.string,
  }),
};