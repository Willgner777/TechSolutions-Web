import React from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, Building2, Edit, X, Search, Power, Trash, UserPlus } from 'lucide-react';
import OpcoesContrato from '../OpcoesContrato';

/**
 * Aba "Utilizadores": filtros, cadastro, edição e listagem de usuários da plataforma.
 * Recebe o estado e as ações prontos de `useAdminDev`.
 */
export default function UsuariosTab({ admin }) {
  const {
    ativoUsuario,
    buscaUsuario,
    cargoUsuario,
    confirmarMoverUsuarioParaLixeira,
    contratoUsuario,
    contratos,
    criarNovoUsuario,
    editingUsuarioId,
    emailUsuario,
    empresaIdSelecionada,
    empresas,
    exibirFormNovoUsuario,
    filtroEmpresaUsuario,
    filtroRoleUsuario,
    filtroStatusUsuario,
    limparFormNovoUsuario,
    limparFormUsuario,
    loading,
    nomeUsuario,
    novaEmpresaId,
    novaSenha,
    novoCargo,
    novoContrato,
    novoEmail,
    novoNome,
    novoRole,
    prepararEdicaoUsuario,
    roleUsuario,
    senhaUsuario,
    salvarUsuario,
    setAtivoUsuario,
    setBuscaUsuario,
    setCargoUsuario,
    setContratoUsuario,
    setEmailUsuario,
    setEmpresaIdSelecionada,
    setExibirFormNovoUsuario,
    setFiltroEmpresaUsuario,
    setFiltroRoleUsuario,
    setFiltroStatusUsuario,
    setNomeUsuario,
    setNovaEmpresaId,
    setNovaSenha,
    setNovoCargo,
    setNovoContrato,
    setNovoEmail,
    setNovoNome,
    setNovoRole,
    setRoleUsuario,
    setSenhaUsuario,
    usuariosFiltrados,
  } = admin;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* BOTÃO PARA ABRIR O FORMULÁRIO DE NOVO FUNCIONÁRIO */}
      {!exibirFormNovoUsuario && !editingUsuarioId && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Lista de Utilizadores</h3>
          <button
            onClick={() => {
              limparFormUsuario();
              setExibirFormNovoUsuario(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <UserPlus className="w-4 h-4" /> Novo Funcionário
          </button>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO: NOVO FUNCIONÁRIO */}
      {exibirFormNovoUsuario && (
        <form onSubmit={criarNovoUsuario} className="bg-purple-50/50 border border-purple-200 p-6 rounded-2xl space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-600" /> Cadastrar Novo Funcionário / Usuário
            </h3>
            <button type="button" onClick={limparFormNovoUsuario} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Nome Completo *</label>
              <input type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">E-mail *</label>
              <input type="email" required value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="joao@empresa.com" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Senha Provisória *</label>
              <input type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Permissão (Role)</label>
              <select value={novoRole} onChange={(e) => setNovoRole(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                <option value="funcionario">funcionario</option>
                <option value="admin_empresa">admin_empresa</option>
                <option value="super_dev">super_dev (Acesso Total)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Empresa / Filial Vinculada</label>
              <select 
                value={novaEmpresaId} 
                onChange={(e) => { setNovaEmpresaId(e.target.value); setNovoContrato(''); }} 
                disabled={novoRole === 'super_dev'}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Nenhuma / Sem Empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome || emp.nome_fantasia} {emp.matriz_id ? '(Filial)' : '(Matriz)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Cargo Operacional</label>
              <input type="text" value={novoCargo} onChange={(e) => setNovoCargo(e.target.value)} placeholder="Ex: Motorista, Gerente" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Contrato Vinculado</label>
              <select
                value={novoContrato}
                onChange={(e) => setNovoContrato(e.target.value)}
                disabled={novoRole === 'super_dev' || !novaEmpresaId}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
              >
                <OpcoesContrato contratos={contratos} empresaId={novoRole === 'super_dev' ? '' : novaEmpresaId} valorAtual={novoContrato} />
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={limparFormNovoUsuario} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">Cadastrar Funcionário</button>
          </div>
        </form>
      )}

      {/* FORMULÁRIO DE EDIÇÃO */}
      {editingUsuarioId && (
        <form onSubmit={salvarUsuario} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-5">
          <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Editar Perfil / Funcionário
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Nome</label>
              <input type="text" value={nomeUsuario} onChange={(e) => setNomeUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">E-mail (Editável)</label>
              <input type="email" value={emailUsuario} onChange={(e) => setEmailUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Senha</label>
              <input type="password" value={senhaUsuario} onChange={(e) => setSenhaUsuario(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Permissão (Role)</label>
              <select value={roleUsuario} onChange={(e) => setRoleUsuario(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                <option value="super_dev">super_dev (Acesso Total)</option>
                <option value="admin_empresa">admin_empresa</option>
                <option value="funcionario">funcionario</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Empresa / Filial Vinculada {roleUsuario === 'super_dev' && '(Não aplicável ao Super Dev)'}
              </label>
              <select 
                value={empresaIdSelecionada} 
                onChange={(e) => { setEmpresaIdSelecionada(e.target.value); setContratoUsuario(''); }} 
                disabled={roleUsuario === 'super_dev'}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Nenhuma / Sem Empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome || emp.nome_fantasia} {emp.matriz_id ? '(Filial)' : '(Matriz)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Cargo Operacional</label>
              <input type="text" value={cargoUsuario} onChange={(e) => setCargoUsuario(e.target.value)} placeholder="Ex: Motorista, Gerente" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Contrato Vinculado</label>
              <select
                value={contratoUsuario}
                onChange={(e) => setContratoUsuario(e.target.value)}
                disabled={roleUsuario === 'super_dev' || !empresaIdSelecionada}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
              >
                <OpcoesContrato contratos={contratos} empresaId={roleUsuario === 'super_dev' ? '' : empresaIdSelecionada} valorAtual={contratoUsuario} />
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Status de Acesso</label>
              <button
                type="button"
                onClick={() => setAtivoUsuario(!ativoUsuario)}
                className={`w-full py-3 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-between ${
                  ativoUsuario ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                <span>{ativoUsuario ? 'Utilizador Ativo' : 'Utilizador Inativo'}</span>
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={limparFormUsuario} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-semibold">Atualizar Utilizador</button>
          </div>
        </form>
      )}

      {/* BUSCA E FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={buscaUsuario}
            onChange={(e) => setBuscaUsuario(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cargo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
          />
        </div>
        <select value={filtroEmpresaUsuario} onChange={(e) => setFiltroEmpresaUsuario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
          <option value="">Todas as empresas</option>
          <option value="sem">Sem empresa vinculada</option>
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nome || emp.nome_fantasia}</option>
          ))}
        </select>
        <select value={filtroRoleUsuario} onChange={(e) => setFiltroRoleUsuario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
          <option value="">Todas as permissões</option>
          <option value="super_dev">super_dev</option>
          <option value="admin_empresa">admin_empresa</option>
          <option value="funcionario">funcionario</option>
        </select>
        <select value={filtroStatusUsuario} onChange={(e) => setFiltroStatusUsuario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs">
          <option value="">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase">
              <th className="py-4 px-5">Nome</th>
              <th className="py-4 px-5">E-mail</th>
              <th className="py-4 px-5">Empresa / Unidade</th>
              <th className="py-4 px-5">Permissão</th>
              <th className="py-4 px-5">Cargo</th>
              <th className="py-4 px-5">Contrato</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuariosFiltrados.length > 0 ? usuariosFiltrados.map(usr => (
              <tr key={usr.id} className="hover:bg-purple-50/30">
                <td className="py-4 px-5 font-semibold text-slate-800">{usr.nome || 'Sem nome'}</td>
                <td className="py-4 px-5 text-slate-600">{usr.email || 'Não informado'}</td>
                <td className="py-4 px-5">
                  {usr.role === 'super_dev' ? (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">
                      Global (Super Dev)
                    </span>
                  ) : usr.empresas?.nome ? (
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      {usr.empresas.nome}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Sem Empresa Vinculada
                    </span>
                  )}
                </td>
                <td className="py-4 px-5 font-mono text-xs text-slate-600">{usr.role || '-'}</td>
                <td className="py-4 px-5 text-slate-700">{usr.cargo || '-'}</td>
                <td className="py-4 px-5 text-slate-700">{usr.contrato || '-'}</td>
                <td className="py-4 px-5">
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${
                    usr.ativo !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {usr.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-4 px-5 text-right space-x-2">
                  <button onClick={() => prepararEdicaoUsuario(usr)} className="p-2 bg-slate-100 text-purple-700 rounded-xl border border-slate-200">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirmarMoverUsuarioParaLixeira(usr.id)} className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400">Nenhum utilizador encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

UsuariosTab.propTypes = {
  // Objeto retornado por `useAdminDev` (ver src/hooks/useAdminDev.js).
  admin: PropTypes.object.isRequired,
};
