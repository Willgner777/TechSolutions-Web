import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FormPessoalPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    cargo: '',
    departamento: '',
    empresa_id: '',
    email: '',
    role: 'Operador',
    status: 'Ativo'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Inserção/Atualização via Supabase API aqui
    console.log('Salvando dados:', formData);
    navigate('/cadastros/pessoal');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cadastro de Funcionário</h1>
          <p className="text-sm text-slate-500">Preencha os dados cadastrais e de acesso ao sistema.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cadastros/pessoal')}
          className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Pessoais e Profissionais */}
        <div className="bg-slate-50 p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">1. Informações Pessoais e Contrato</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nome Completo *</label>
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">CPF *</label>
              <input
                type="text"
                name="cpf"
                required
                value={formData.cpf}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Matrícula</label>
              <input
                type="text"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Cargo</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Departamento</label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Afastado">Afastado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 2: Permissões de Acesso ao Sistema */}
        <div className="bg-slate-50 p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">2. Credenciais e Perfil de Acesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">E-mail de Login *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nível de Permissão (Role) *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Operador">Operador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Gestor Geral">Gestor Geral</option>
                <option value="super-dev">Super Dev (Administrador Global)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/cadastros/pessoal')}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Salvar Cadastramento
          </button>
        </div>
      </form>
    </div>
  );
}