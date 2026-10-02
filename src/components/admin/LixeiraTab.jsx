import React from 'react';
import PropTypes from 'prop-types';
import { Trash } from 'lucide-react';
import { formatarTimestampBR } from '../../utils/formatters';

/**
 * Aba "Lixeira": usuários, empresas e contratos excluídos, com opção de restaurar.
 * Recebe o estado e as ações prontos de `useAdminDev`.
 */
export default function LixeiraTab({ admin }) {
  const {
    contratosLixeira,
    empresasLixeira,
    nomeDaEmpresa,
    restaurarDaLixeira,
    usuariosLixeira,
  } = admin;

  return (
    <div className="space-y-8">

      {/* LIXEIRA: UTILIZADORES */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Trash className="w-4 h-4 text-red-600" /> Utilizadores Removidos ({usuariosLixeira.length})
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Removido em</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosLixeira.length > 0 ? usuariosLixeira.map(usr => (
                <tr key={usr.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{usr.nome}</td>
                  <td className="py-3.5 px-4 text-slate-600">{usr.email}</td>
                  <td className="py-3.5 px-4 text-slate-600">{nomeDaEmpresa(usr.empresa_id) || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatarTimestampBR(usr.deleted_at)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => restaurarDaLixeira('perfis', usr.id, 'Utilizador')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                      Restaurar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">Nenhum utilizador na lixeira.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIXEIRA: EMPRESAS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Trash className="w-4 h-4 text-red-600" /> Empresas Removidas ({empresasLixeira.length})
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">CNPJ</th>
                <th className="py-3 px-4">Removida em</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empresasLixeira.length > 0 ? empresasLixeira.map(emp => (
                <tr key={emp.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{emp.nome || emp.nome_fantasia}</td>
                  <td className="py-3.5 px-4 text-slate-600">{emp.cnpj || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatarTimestampBR(emp.deleted_at)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => restaurarDaLixeira('empresas', emp.id, 'Empresa')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                      Restaurar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">Nenhuma empresa na lixeira.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIXEIRA: CONTRATOS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Trash className="w-4 h-4 text-red-600" /> Contratos Removidos ({contratosLixeira.length})
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                <th className="py-3 px-4">Contrato</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Removido em</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contratosLixeira.length > 0 ? contratosLixeira.map(c => (
                <tr key={c.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{c.nome_contrato}</td>
                  <td className="py-3.5 px-4 text-slate-600">{nomeDaEmpresa(c.empresa_id) || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatarTimestampBR(c.deleted_at)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => restaurarDaLixeira('contratos', c.id, 'Contrato')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                      Restaurar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">Nenhum contrato na lixeira.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

LixeiraTab.propTypes = {
  // Objeto retornado por `useAdminDev` (ver src/hooks/useAdminDev.js).
  admin: PropTypes.object.isRequired,
};
