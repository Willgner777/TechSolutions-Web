import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { Wrench, Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ManutencoesPage({ userProfile }) {
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    veiculo_id: '',
    tipo: 'preventiva',
    descricao: '',
    valor: '',
    data_agendada: new Date().toISOString().split('T')[0],
    status: 'pendente'
  });

  useEffect(() => {
    if (userProfile?.empresa_id) fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [manRes, vRes] = await Promise.all([
        supabase.from('manutencoes').select('*, veiculos(placa, modelo)').eq('empresa_id', userProfile.empresa_id).order('data_agendada', { ascending: false }),
        supabase.from('veiculos').select('id, placa, modelo').eq('empresa_id', userProfile.empresa_id)
      ]);

      if (manRes.error) throw manRes.error;
      setManutencoes(manRes.data || []);
      setVeiculos(vRes.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar manutenções: ' + err.message });
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
        valor: Number(formData.valor || 0)
      };

      const { error } = await supabase.from('manutencoes').insert([payload]);
      if (error) throw error;

      setFeedback({ type: 'success', message: 'Manutenção agendada com sucesso!' });
      setModalOpen(false);
      setFormData({ veiculo_id: '', tipo: 'preventiva', descricao: '', valor: '', data_agendada: new Date().toISOString().split('T')[0], status: 'pendente' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar manutenção: ' + err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover esta ordem de serviço?')) return;
    try {
      const { error } = await supabase.from('manutencoes').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Registo removido com sucesso!' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao remover: ' + err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Controlo de Manutenções</h1>
          <p className="text-sm text-slate-400 mt-1">Gestão de ordens de serviço preventivas e corretivas.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all"
        >
          <Plus size={18} /> Nova Manutenção
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
                <th className="py-4 px-6">Data Agendada</th>
                <th className="py-4 px-6">Veículo</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Descrição</th>
                <th className="py-4 px-6">Custo (R$)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">A carregar manutenções...</td>
                </tr>
              ) : manutencoes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">Nenhuma manutenção registada.</td>
                </tr>
              ) : (
                manutencoes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-300">{item.data_agendada}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">{item.veiculos?.modelo} <span className="text-purple-400 font-mono">({item.veiculos?.placa})</span></td>
                    <td className="py-4 px-6 capitalize text-slate-300">{item.tipo}</td>
                    <td className="py-4 px-6 text-slate-400 max-w-xs truncate">{item.descricao}</td>
                    <td className="py-4 px-6 text-slate-300 font-semibold">R$ {Number(item.valor).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${item.status === 'concluida' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' : item.status === 'em_andamento' ? 'bg-blue-950/50 text-blue-400 border border-blue-500/20' : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'}`}>
                        {item.status.replace('_', ' ')}
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
              <h2 className="text-lg font-bold text-slate-100">Agendar Nova Manutenção</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Veículo</label>
                <select
                  required
                  value={formData.veiculo_id}
                  onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecione o veículo</option>
                  {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} ({v.placa})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Manutenção</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="preventiva">Preventiva</option>
                    <option value="corretiva">Corretiva</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Data Agendada</label>
                  <input
                    type="date"
                    required
                    value={formData.data_agendada}
                    onChange={(e) => setFormData({ ...formData, data_agendada: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Custo Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição / Serviço</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Descreva o serviço a ser realizado..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40">Salvar Manutenção</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}