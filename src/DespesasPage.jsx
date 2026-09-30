import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { DollarSign, Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DespesasPage({ userProfile }) {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    categoria: 'pedagio',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    status_pagamento: 'pago'
  });

  useEffect(() => {
    if (userProfile?.empresa_id) fetchDespesas();
  }, [userProfile]);

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('empresa_id', userProfile.empresa_id)
        .order('data', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar despesas: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        ...formData,
        empresa_id: userProfile.empresa_id,
        valor: Number(formData.valor)
      };

      const { error } = await supabase.from('despesas').insert([payload]);
      if (error) throw error;

      setFeedback({ type: 'success', message: 'Despesa registada com sucesso!' });
      setModalOpen(false);
      setFormData({ categoria: 'pedagio', descricao: '', valor: '', data: new Date().toISOString().split('T')[0], status_pagamento: 'pago' });
      fetchDespesas();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar despesa: ' + err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover esta despesa?')) return;
    try {
      const { error } = await supabase.from('despesas').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Registo removido com sucesso!' });
      fetchDespesas();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao remover: ' + err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Gestão de Despesas</h1>
          <p className="text-sm text-slate-400 mt-1">Controlo financeiro operacional (pedágios, seguros, multas, peças).</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all"
        >
          <Plus size={18} /> Nova Despesa
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 border ${feedback.type === 'error' ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'}`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
                <th className="py-4 px-6">Data</th>
                <th className="py-4 px-6">Categoria</th>
                <th className="py-4 px-6">Descrição</th>
                <th className="py-4 px-6">Valor (R$)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">A carregar despesas...</td>
                </tr>
              ) : despesas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">Nenhuma despesa registada.</td>
                </tr>
              ) : (
                despesas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-300">{item.data}</td>
                    <td className="py-4 px-6 capitalize font-medium text-slate-200">{item.categoria}</td>
                    <td className="py-4 px-6 text-slate-400">{item.descricao}</td>
                    <td className="py-4 px-6 text-emerald-400 font-semibold">R$ {Number(item.valor).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${item.status_pagamento === 'pago' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'}`}>
                        {item.status_pagamento}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-lg font-bold text-slate-100">Registar Nova Despesa</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="pedagio">Pedágio</option>
                    <option value="multa">Multa</option>
                    <option value="pecas">Peças</option>
                    <option value="seguro">Seguro</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status de Pagamento</label>
                  <select
                    value={formData.status_pagamento}
                    onChange={(e) => setFormData({ ...formData, status_pagamento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento de portagem rodoviária"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40">Salvar Despesa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}