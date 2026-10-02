import React from 'react';
import PropTypes from 'prop-types';
import { Package, Edit, X, Trash2, Power, Plus, Download } from 'lucide-react';
import { exportarCSV } from '../../utils/utils';

export default function MateriaisTab({ admin, empresaId: empresaIdProp }) {
  const {
    empresaIdSelecionada,
    empresas,
    materiais,
    exibirForm,
    editingId,
    formulario,
    setFormulario,
    proximoCod,
    abrirNovo,
    prepararEdicao,
    limparForm,
    salvar,
    remover,
    toggleAtivo,
    loading,
    empresaNova,
    setEmpresaNova,
  } = admin;

  // Prioriza o prop direto, depois o do admin
  const empresaId = empresaIdProp ?? empresaIdSelecionada;

  // sem empresa selecionada: mostra os materiais de todas as empresas
  const modoTodas = !empresaId;
  const nomeEmpresa = (id) => {
    const emp = empresas.find(e => e.id === id);
    return emp?.nome || emp?.nome_fantasia || '-';
  };

  const empresaAtual = empresas.find(e => e.id === empresaIdSelecionada);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Materiais Cadastrados
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Empresa: <span className="font-semibold text-purple-700">{modoTodas ? 'Todas as empresas' : (empresaAtual?.nome || empresaAtual?.nome_fantasia)}</span>
          </p>
        </div>

        {!exibirForm && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-semibold hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" /> Novo Material
          </button>
        )}
      </div>

      {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
      {exibirForm && (
        <form onSubmit={salvar} className="bg-purple-50/40 border border-purple-200 p-6 rounded-2xl space-y-5">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              {editingId ? 'Editar Material' : 'Cadastrar Novo Material'}
            </h4>
            <button type="button" onClick={limparForm} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {modoTodas && !editingId && (
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Empresa *</label>
                <select
                  required
                  value={empresaNova}
                  onChange={(e) => setEmpresaNova(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold"
                >
                  <option value="">Selecione a empresa do material</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Em modo edição com empresa selecionada, mostra empresa do material (read-only) */}
            {!modoTodas && editingId && (
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Empresa</label>
                <input
                  type="text"
                  disabled
                  value={empresaAtual?.nome || empresaAtual?.nome_fantasia || '—'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-600"
                />
              </div>
            )}

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
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Unidade (UMB)</label>
              <select
                value={formulario.umb}
                onChange={(e) => setFormulario({ ...formulario, umb: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold"
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
                className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-semibold hover:bg-purple-700 transition"
            >
              {editingId ? 'Atualizar Material' : 'Salvar Material'}
            </button>
          </div>
        </form>
      )}

      {/* TABELA DE MATERIAIS */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
              <th className="py-3.5 px-4 w-20">Cód</th>
              {modoTodas && <th className="py-3.5 px-4">Empresa</th>}
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
                <tr key={mat.id} className="hover:bg-purple-50/20">
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                    {String(mat.codigo).padStart(2, '0')}
                  </td>
                  {modoTodas && (
                    <td className="py-3.5 px-4 text-slate-600">{nomeEmpresa(mat.empresa_id)}</td>
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
                <td colSpan={modoTodas ? 7 : 6} className="py-8 text-center text-slate-400">
                  {modoTodas ? 'Nenhum material cadastrado.' : 'Nenhum material cadastrado para esta empresa.'}
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
  );
}

MateriaisTab.propTypes = {
  admin: PropTypes.object.isRequired,
};