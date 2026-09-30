import React from 'react';
import { NavLink } from 'react-router-dom';
import { BuildingOfficeIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ userRole }) {
  const isSuperDev = userRole === 'super-dev';
  const isGestor = userRole === 'Gestor Geral' || isSuperDev;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xl font-bold tracking-wider text-blue-400">
          SISTEMA DE GESTÃO
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </NavLink>

          {/* Seção Cadastros Gerais */}
          {isGestor && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Cadastros Gerais
              </p>

              {/* Visível apenas para super-dev */}
              {isSuperDev && (
                <NavLink
                  to="/cadastros/empresas"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-400" />
                  Empresas (Multitenant)
                </NavLink>
              )}

              {/* Visível para super-dev e gestores */}
              <NavLink
                to="/cadastros/pessoal"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <UserGroupIcon className="w-5 h-5 text-emerald-400" />
                Gestão de Pessoal
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}