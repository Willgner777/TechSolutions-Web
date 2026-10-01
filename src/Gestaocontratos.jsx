import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases';
import {
  FileText, Plus, Search, Edit, Trash, X, RefreshCw
} from 'lucide-react';

const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'AC - Acre' },
  { sigla: 'AL', nome: 'AL - Alagoas' },
  { sigla: 'AP', nome: 'AP - Amapá' },
  { sigla: 'AM', nome: 'AM - Amazonas' },
  { sigla: 'BA', nome: 'BA - Bahia' },
  { sigla: 'CE', nome: 'CE - Ceará' },
  { sigla: 'DF', nome: 'DF - Distrito Federal' },
  { sigla: 'ES', nome: 'ES - Espírito Santo' },
  { sigla: 'GO', nome: 'GO - Goiás' },
  { sigla: 'MA', nome: 'MA - Maranhão' },
  { sigla: 'MT', nome: 'MT - Mato Grosso' },
  { sigla: 'MS', nome: 'MS - Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'MG - Minas Gerais' },
  { sigla: 'PA', nome: 'PA - Pará' },
  { sigla: 'PB', nome: 'PB - Paraíba' },
  { sigla: 'PR', nome: 'PR - Paraná' },
  { sigla: 'PE', nome: 'PE - Pernambuco' },
  { sigla: 'PI', nome: 'PI - Piauí' },
  { sigla: 'RJ', nome: 'RJ - Rio de Janeiro' },
  { sigla: 'RN', nome: 'RN - Rio Grande do Norte' },
  { sigla: 'RS', nome: 'RS - Rio Grande do Sul' },
  { sigla: 'RO', nome: 'RO - Rondônia' },
  { sigla: 'RR', nome: 'RR - Roraima' },
  { sigla: 'SC', nome: 'SC - Santa Catarina' },
  { sigla: 'SP', nome: 'SP - São Paulo' },
  { sigla: 'SE', nome: 'SE - Sergipe' },
  { sigla: 'TO', nome: 'TO - Tocantins' }
];

export default function GestaoContratos() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [busca, setBusca] = useState('');

  const [empresaId, setEmpresaId] = useState(null);
  const [contratos, setContratos] = useState([]);

  const [exibirForm, setExibirForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [nomeContrato, setNomeContrato] = useState('');
  const [estadoUf, setEstadoUf] = useState('');

  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { data: perfil, error: errPerfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (errPerfil || !perfil?.empresa_id) {
        throw new Error('Empresa vinculada não encontrada.');
      }

      setEmpresaId(perfil.empresa_id);

      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('empresa_id', perfil.empresa_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setNomeContrato('');
    setEstadoUf('');
    setExibirForm(false);
  };

  const prepararEdicao = (c) => {
    setEditingId(c.id);
    setNomeContrato(c.nome_contrato || '');
    setEstadoUf(c.estado_uf || '');
    setExibirForm(true);
  };

  const salvarContrato = async (e) => {
    e.preventDefault();
    if (!nomeContrato.trim()) {
      return setFeedback({ type: 'error', message: 'Informe o nome do contrato.' });
    }

    setLoading(true);
    try {
      const payload = {
        nome_contrato: nomeContrato.trim(),
        estado_uf: estadoUf || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('contratos')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Contrato atualizado!' });
      } else {
        const { error } = await supabase
          .from('contratos')
          .insert([{ ...payload, empresa_id: empresaId }]);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Contrato cadastrado com sucesso!' });
      }

      limparFormulario();
      carregarContratos();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const moverParaLixeira = async (id) => {
    if (!window.confirm('Deseja remover este contrato?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contratos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setFeedback({ type: 'success', message: 'Contrato removido!' });
      carregarContratos();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const contratosFiltrados = contratos.filter(c =>
    (c.nome_contrato || '').toLowerCase().includes(busca.toLowerCase()) ||
    (c.estado_uf || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-purple-600" />
              Cadastro de Contratos
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cadastre e gerencie os contratos da empresa</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={carregarContratos}
              className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {!exibirForm && (
              <button
                onClick={() => {
                  limparFormulario();
                  setExibirForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold text-sm rounded-2xl shadow-md hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" /> Novo Contrato
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between ${
            feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        {exibirForm && (
          <form onSubmit={salvarContrato} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Editar Contrato' : 'Novo Contrato'}
              </h2>
              <button type="button" onClick={limparFormulario} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Contrato *</label>
                <input
                  type="text"
                  required
                  value={nomeContrato}
                  onChange={(e) => setNomeContrato(e.target.value)}
                  placeholder="Ex: Contrato SP-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
                <select
                  value={estadoUf}
                  onChange={(e) => setEstadoUf(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="">Selecione o Estado...</option>
                  {ESTADOS_BRASIL.map(est => (
                    <option key={est.sigla} value={est.sigla}>{est.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={limparFormulario}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-semibold shadow-md"
              >
                {editingId ? 'Salvar Alterações' : 'Cadastrar Contrato'}
              </button>
            </div>
          </form>
        )}

        {/* TABELA DE CONTRATOS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou UF..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="py-3.5 px-4">Contrato</th>
                  <th className="py-3.5 px-4">UF</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contratosFiltrados.length > 0 ? (
                  contratosFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{c.nome_contrato}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{c.estado_uf || '-'}</td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button onClick={() => prepararEdicao(c)} className="p-1.5 bg-slate-100 text-purple-700 rounded-xl">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moverParaLixeira(c.id)} className="p-1.5 bg-red-50 text-red-600 rounded-xl">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400">
                      Nenhum contrato encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}