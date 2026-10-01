import React from 'react';
import { Users, Plus, Search } from 'lucide-react';

export default function FuncionariosPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestão de Funcionários</h2>
          <p className="text-xs text-slate-500">Cadastre e gerencie a equipe da empresa</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Novo Funcionário
        </button>
      </div>

      {/* Conteúdo / Tabela */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="p-3.5">Nome</th>
                <th className="p-3.5">Cargo</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3.5 font-bold text-slate-800">Exemplo Funcionário</td>
                <td className="p-3.5 text-slate-600">Motorista</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">Ativo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}