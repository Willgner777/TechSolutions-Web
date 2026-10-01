import React, { useState } from 'react';
import { 
  Users, ChevronDown, ChevronRight, LogOut, 
  FolderTree, Code, Menu as MenuIcon, X, FileText 
} from 'lucide-react';

export default function Menu({ usuarioAtual, activeTab, setActiveTab, onLogout, abrirConsoleDev }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuCadastrosOpen, setMenuCadastrosOpen] = useState(true);

  return (
    <>
      {/* BOTÃO MOBILE PARA ABRIR O MENU */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
            W
          </div>
          <span className="font-bold text-slate-900 text-sm">Sistema ERP</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* OVERLAY PARA MOBILE */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* SIDEBAR / MENU LATERAL */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 
        flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* CABEÇALHO DO MENU */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                <span className="text-white font-black text-xl tracking-tighter">W</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight">Sistema ERP</h2>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {usuarioAtual?.role || 'FUNCIONÁRIO'}
                </span>
              </div>
            </div>
          </div>

          {/* ITENS DE NAVEGAÇÃO */}
          <nav className="p-4 space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Navegação
            </span>

            {/* PASTA: CADASTROS */}
            <div>
              <button
                onClick={() => setMenuCadastrosOpen(!menuCadastrosOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  menuCadastrosOpen ? 'bg-purple-50/60 text-purple-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderTree className="w-4 h-4 text-purple-600" />
                  <span>Cadastros</span>
                </div>
                {menuCadastrosOpen ? (
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* SUBMENU: FUNCIONÁRIOS E CONTRATOS */}
              {menuCadastrosOpen && (
                <div className="ml-4 pl-3 border-l-2 border-purple-100 mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('funcionarios');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'funcionarios' 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                        : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Funcionários</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('contratos');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'contratos' 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                        : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Contratos</span>
                  </button>
                </div>
              )}
            </div>

            {/* BOTÃO EXCLUSIVO PARA SUPER DEV */}
            {usuarioAtual?.role === 'super_dev' && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={abrirConsoleDev}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-purple-900 transition-all cursor-pointer shadow-sm"
                >
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>Console Super Dev</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* PERFIL DO USUÁRIO & BOTÃO DE LOGOUT */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                {usuarioAtual?.nome ? usuarioAtual.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{usuarioAtual?.nome || 'Utilizador'}</p>
                <p className="text-[10px] text-slate-400 truncate">{usuarioAtual?.email || 'email@exemplo.com'}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              title="Sair para o Login"
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}