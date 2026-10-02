import React from 'react';
import PropTypes from 'prop-types';
import { Building2, Edit, X, Search, Trash, FileText, Download } from 'lucide-react';
import { UFS } from '../../utils/estados';
import { formatarTimestampBR } from '../../utils/formatters';
import { confirmarAcao } from '../../utils/browser';
import { exportarCSV } from '../../utils/utils';

/**
 * Aba "Contratos": cadastro, edição, filtros e listagem de contratos.
 * Recebe o estado e as ações prontos de `useAdminDev`.
 */
export default function ContratosTab({ admin }) {
  const {
    buscaContrato,
    contratosFiltrados,
    editingContratoId,
    empresaContratoId,
    empresas,
    exibirFormContrato,
    filtroEmpresaContrato,
    limparFormContrato,
    loading,
    moverParaLixeira,
    nomeContrato,
    nomeDaEmpresa,
    prepararEdicaoContrato,
    salvarContrato,
    setBuscaContrato,
    setEmpresaContratoId,
    setExibirFormContrato,
    setFiltroEmpresaContrato,
    setNomeContrato,
    setUfContrato,
    ufContrato,
  } = admin;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

      {/* BOTÃO PARA ABRIR O FORMULÁRIO DE NOVO CONTRATO */}
      {!exibirFormContrato && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Lista de Contratos</h3>
          <button
            onClick={() => {
              limparFormContrato();
              setExibirFormContrato(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <FileText className="w-4 h-4" /> Novo Contrato
          </button>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
      {exibirFormContrato && (
        <form onSubmit={salvarContrato} className={`p-6 rounded-2xl space-y-5 border ${
          editingContratoId ? 'bg-slate-50 border-slate-200' : 'bg-purple-50/50 border-purple-200'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              editingContratoId ? 'text-purple-700' : 'text-purple-900'
            }`}>
              <FileText className="w-4 h-4 text-purple-600" />
              {editingContratoId ? 'Editar Contrato' : 'Cadastrar Novo Contrato'}
            </h3>
            <button type="button" onClick={limparFormContrato} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Empresa / Filial *</label>
              <select
                value={empresaContratoId}
                onChange={(e) => setEmpresaContratoId(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
              >
                <option value="">Selecione a empresa...</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome || emp.nome_fantasia} {emp.matriz_id ? '(Filial)' : '(Matriz)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Nome do Contrato *</label>
              <input
                type="text"
                required
                value={nomeContrato}
                onChange={(e) => setNomeContrato(e.target.value)}
                placeholder="Ex: Contrato SP-01"
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Estado (UF)</label>
              <select
                value={ufContrato}
                onChange={(e) => setUfContrato(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
              >
                <option value="">Selecione o Estado...</option>
                {UFS.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={limparFormContrato} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">
              {editingContratoId ? 'Atualizar Contrato' : 'Cadastrar Contrato'}
            </button>
          </div>
        </form>
      )}

      {/* BUSCA E FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={buscaContrato}
            onChange={(e) => setBuscaContrato(e.target.value)}
            placeholder="Buscar por nome ou UF..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
          />
        </div>
        <select value={filtroEmpresaContrato} onChange={(e) => setFiltroEmpresaContrato(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
          <option value="">Todas as empresas</option>
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
          ))}
        </select>
      </div>

      {/* TABELA DE CONTRATOS */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
              <th className="py-4 px-5">Contrato</th>
              <th className="py-4 px-5">Empresa / Unidade</th>
              <th className="py-4 px-5">UF</th>
              <th className="py-4 px-5">Criado em</th>
              <th className="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contratosFiltrados.length > 0 ? contratosFiltrados.map(c => (
              <tr key={c.id} className="hover:bg-purple-50/30">
                <td className="py-4 px-5 font-semibold text-slate-800">{c.nome_contrato}</td>
                <td className="py-4 px-5">
                  {nomeDaEmpresa(c.empresa_id) ? (
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      {nomeDaEmpresa(c.empresa_id)}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Sem Empresa Vinculada
                    </span>
                  )}
                </td>
                <td className="py-4 px-5 font-bold text-slate-700">{c.estado_uf || '-'}</td>
                <td className="py-4 px-5 text-slate-600">{formatarTimestampBR(c.created_at)}</td>
                <td className="py-4 px-5 text-right space-x-2">
                  <button onClick={() => prepararEdicaoContrato(c)} className="p-2 bg-slate-100 text-purple-700 rounded-xl border border-slate-200">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirmarAcao('Mover este contrato para a Lixeira?')) moverParaLixeira('contratos', c.id, 'Contrato');
                    }}
                    className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">Nenhum contrato encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button onClick={() => exportarCSV(contratosFiltrados, 'contratos.csv')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>
    </div>
  );
}

ContratosTab.propTypes = {
  // Objeto retornado por `useAdminDev` (ver src/hooks/useAdminDev.js).
  admin: PropTypes.object.isRequired,
};
