import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { hojeLocal } from './utils';
import { Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AbastecimentosPage({ userProfile }) {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    veiculo_id: '',
    motorista_id: '',
    data: hojeLocal(),
    valor_total: '',
    litros: '',
    km_no_abastecimento: '',
    posto: ''
  });

  useEffect(() => {
    if (userProfile?.empresa_id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.empresa_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [absRes, vRes, mRes] = await Promise.all([
        supabase.from('abastecimentos').select('*, veiculos(placa, modelo), motoristas(nome)').eq('empresa_id', userProfile.empresa_id).order('data', { ascending: false }),
        supabase.from('veiculos').select('id, placa, modelo').eq('empresa_id', userProfile.empresa_id),
        supabase.from('motoristas').select('id, nome').eq('empresa_id', userProfile.empresa_id)
      ]);

      if (absRes.error) throw absRes.error;
      setAbastecimentos(absRes.data || []);
      setVeiculos(vRes.data || []);
      setMotoristas(mRes.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar dados: ' + err.message });
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
        valor_total: Number(formData.valor_total),
        litros: Number(formData.litros),
        km_no_abastecimento: Number(formData.km_no_abastecimento)
      };

      const { error } = await supabase.from('abastecimentos').insert([payload]);
      if (error) throw error;

      setFeedback({ type: 'success', message: 'Abastecimento registado com sucesso!' });
      setModalOpen(false);
      setFormData({ veiculo_id: '', motorista_id: '', data: hojeLocal(), valor_total: '', litros: '', km_no_abastecimento: '', posto: '' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar abastecimento: ' + err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover este registo?')) return;
    try {
      const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Controlo de Abastecimentos</h1>
          <p className="text-sm text-slate-500 mt-1">Registo de combustíveis, postos e custos operacionais.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-lg shadow-purple-500/30 transition-all"
        >
          <Plus size={18} /> Registar Abastecimento
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 border ${feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                <th className="py-4 px-6">Data</th>
                <th className="py-4 px-6">Veículo</th>
                <th className="py-4 px-6">Motorista</th>
                <th className="py-4 px-6">Posto</th>
                <th className="py-4 px-6">Litros / Valor</th>
                <th className="py-4 px-6">Quilometragem</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">A carregar abastecimentos...</td>
                </tr>
              ) : abastecimentos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">Nenhum registo encontrado.</td>
                </tr>
              ) : (
                abastecimentos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-600">{item.data}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{item.veiculos?.modelo} <span className="text-purple-600 font-mono">({item.veiculos?.placa})</span></td>
                    <td className="py-4 px-6 text-slate-600">{item.motoristas?.nome || 'N/D'}</td>
                    <td className="py-4 px-6 text-slate-600">{item.posto || '-'}</td>
                    <td className="py-4 px-6 text-slate-600">{item.litros} L <span className="text-emerald-700 font-semibold ml-2">R$ {Number(item.valor_total).toFixed(2)}</span></td>
                    <td className="py-4 px-6 text-slate-600">{item.km_no_abastecimento?.toLocaleString()} km</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Registar Novo Abastecimento</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Veículo</label>
                  <select
                    required
                    value={formData.veiculo_id}
                    onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione o veículo</option>
                    {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} ({v.placa})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Motorista</label>
                  <select
                    value={formData.motorista_id}
                    onChange={(e) => setFormData({ ...formData, motorista_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione o motorista</option>
                    {motoristas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Posto de Combustível</label>
                  <input
                    type="text"
                    placeholder="Nome do posto"
                    value={formData.posto}
                    onChange={(e) => setFormData({ ...formData, posto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Litros</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.litros}
                    onChange={(e) => setFormData({ ...formData, litros: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Quilometragem</label>
                  <input
                    type="number"
                    required
                    value={formData.km_no_abastecimento}
                    onChange={(e) => setFormData({ ...formData, km_no_abastecimento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-lg shadow-purple-500/30">Salvar Registo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}