import React from 'react';
import PropTypes from 'prop-types';
import { Building2, Users, Edit, Trash2, X, Power, GitBranch, FileText } from 'lucide-react';

/**
 * Aba "Empresas & Filiais": cadastro, edição, ativação e listagem.
 * Recebe o estado e as ações prontos de `useAdminDev`.
 */
export default function EmpresasTab({ admin }) {
  const {
    alternarAtivoEmpresa,
    cnpjEmpresa,
    contratosDaEmpresa,
    editingEmpresaId,
    empresas,
    empresasMatrizes,
    excluirEmpresa,
    exibirFormEmpresa,
    limparFormEmpresa,
    loading,
    matrizIdSelecionada,
    nomeEmpresa,
    planoEmpresa,
    prepararEdicaoEmpresa,
    salvarEmpresa,
    setCnpjEmpresa,
    setExibirFormEmpresa,
    setMatrizIdSelecionada,
    setNomeEmpresa,
    setPlanoEmpresa,
    setTipoEmpresa,
    setUfEmpresa,
    tipoEmpresa,
    ufEmpresa,
    usuarios,
  } = admin;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

      {/* BOTÃO PARA ABRIR O FORMULÁRIO */}
      {!exibirFormEmpresa && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Empresas e Filiais Cadastradas</h3>
          <button
            onClick={() => {
              limparFormEmpresa();
              setExibirFormEmpresa(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <Building2 className="w-4 h-4" /> Nova Empresa / Filial
          </button>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
      {exibirFormEmpresa && (
        <form onSubmit={salvarEmpresa} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              {editingEmpresaId ? 'Editar Empresa / Filial' : 'Cadastrar Empresa / Filial'}
            </h3>
            <button type="button" onClick={limparFormEmpresa} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Tipo de Cadastro</label>
              <select 
                value={tipoEmpresa} 
                onChange={(e) => setTipoEmpresa(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-purple-700"
              >
                <option value="MATRIZ">Empresa Mãe (Matriz)</option>
                <option value="FILIAL">Filial Vinculada</option>
              </select>
            </div>

            {tipoEmpresa === 'FILIAL' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600">Selecione a Empresa Mãe (Matriz)</label>
                <select 
                  value={matrizIdSelecionada} 
                  onChange={(e) => setMatrizIdSelecionada(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
                >
                  <option value="">Selecione uma Matriz...</option>
                  {empresasMatrizes.filter(m => m.id !== editingEmpresaId).map(m => (
                    <option key={m.id} value={m.id}>{m.nome || m.nome_fantasia}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600">Razão Social / Nome Fantasia *</label>
              <input 
                type="text" 
                required 
                value={nomeEmpresa} 
                onChange={(e) => setNomeEmpresa(e.target.value)} 
                placeholder="Ex: Transportadora K-Log Ltda"
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">CNPJ</label>
              <input 
                type="text" 
                value={cnpjEmpresa} 
                onChange={(e) => setCnpjEmpresa(e.target.value)} 
                placeholder="00.000.000/0001-00"
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">UF (Estado)</label>
              <input 
                type="text" 
                value={ufEmpresa} 
                onChange={(e) => setUfEmpresa(e.target.value.toUpperCase())} 
                placeholder="SP"
                maxLength={2}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Plano de Assinatura</label>
              <select 
                value={planoEmpresa} 
                onChange={(e) => setPlanoEmpresa(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800"
              >
                <option value="BASIC">BASIC (Até 5 veículos)</option>
                <option value="PRO">PRO (Até 20 veículos)</option>
                <option value="ENTERPRISE">ENTERPRISE (Ilimitado)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={limparFormEmpresa} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">
              {editingEmpresaId ? 'Atualizar Registro' : 'Cadastrar Empresa / Filial'}
            </button>
          </div>
        </form>
      )}

      {/* TABELA DE EMPRESAS */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
              <th className="py-4 px-5">Empresa / Unidade</th>
              <th className="py-4 px-5">CNPJ / UF</th>
              <th className="py-4 px-5">Plano</th>
              <th className="py-4 px-5">Vínculos</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empresas.length > 0 ? empresas.map(emp => {
              const ehFilial = !!emp.matriz_id;
              const empresaMae = ehFilial ? empresas.find(m => m.id === emp.matriz_id) : null;
              const empAtiva = emp.ativo !== false;
              const qtdUsuarios = usuarios.filter(u => u.empresa_id === emp.id).length;
              const qtdContratos = contratosDaEmpresa(emp.id).length;

              return (
                <tr key={emp.id} className="hover:bg-purple-50/30">
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-800">{emp.nome || emp.nome_fantasia}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        ehFilial ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {ehFilial ? 'Filial' : 'Matriz'}
                      </span>
                      {ehFilial && (
                        <span className="text-[11px] text-purple-600 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> de {empresaMae?.nome || 'Matriz'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-slate-600">{emp.cnpj || 'Não informado'}</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                        {emp.uf || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{emp.plano || 'PRO'}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-4 text-slate-700 whitespace-nowrap">
                      <span className="flex items-center gap-1.5" title="Utilizadores">
                        <Users className="w-3.5 h-3.5 text-purple-600" /> <span className="font-bold">{qtdUsuarios}</span>
                      </span>
                      <span className="flex items-center gap-1.5" title="Contratos">
                        <FileText className="w-3.5 h-3.5 text-purple-600" /> <span className="font-bold">{qtdContratos}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold border whitespace-nowrap ${
                      empAtiva ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {empAtiva ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => alternarAtivoEmpresa(emp)} title={empAtiva ? 'Desativar' : 'Ativar'} className={`p-2 rounded-xl border ${empAtiva ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => prepararEdicaoEmpresa(emp)} title="Editar" className="p-2 bg-slate-100 text-purple-700 rounded-xl border border-slate-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => excluirEmpresa(emp)} title="Mover para a lixeira" className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">Nenhuma empresa cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

EmpresasTab.propTypes = {
  // Objeto retornado por `useAdminDev` (ver src/hooks/useAdminDev.js).
  admin: PropTypes.object.isRequired,
};
