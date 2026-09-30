import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { CheckSquare, Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChecklistPage({ userProfile }) {
  const [checklists, setChecklists] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    veiculo_id: '',
    motorista_id: '',
    data: new Date().toISOString().split('T')[0],
    pneus_ok: true,
    oleo_ok: true,
    luzes_ok: true,
    lataria_ok: true,
    observacoes: ''
  });

  useEffect(() => {
    if (userProfile?.empresa_id) fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chkRes, vRes, mRes] = await Promise.all([
        supabase.from('checklists').select('*, veiculos(placa, modelo), motoristas(nome)').eq('empresa_id', userProfile.empresa_id).order('data', { ascending: false }),
        supabase.from('veiculos').select('id, placa, modelo').eq('empresa_id', userProfile.empresa_id),
        supabase.from('motoristas').select('id, nome').eq('empresa_id', userProfile.empresa_id)
      ]);

      if (chkRes.error) throw chkRes.error;
      setChecklists(chkRes.data || []);
      setVeiculos(vRes.data || []);
      setMotoristas(mRes.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar checklists: ' + err.message });
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
        itens_ok: { pneus: formData.pneus_ok, oleo: formData.oleo_ok, luzes: formData.luzes_ok, lataria: formData.lataria_ok }
      };

      const { error } = await supabase.from('checklists').insert([payload]);
      if (error) throw error;

      setFeedback({ type: 'success', message: 'Checklist registado com sucesso!' });
      setModalOpen(false);
      setFormData({ veiculo_id: '', motorista_id: '', data: new Date().toISOString().split('T')[0], pneus_ok: true, oleo_ok: true, luzes_ok: true, lataria_ok: true, observacoes: '' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar checklist: ' + err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover este registo?')) return;
    try {
      const { error } = await supabase.from('checklists').delete().eq('id', id);
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Checklist Operacional</h1>
          <p className="text-sm text-slate-400 mt-1">Inspeções de segurança diárias efetuadas antes de rodar.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all"
        >
          <Plus size={18} /> Novo Checklist
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
                <th className="py-4 px-6">Veículo</th>
                <th className="py-4 px-6">Motorista</th>
                <th className="py-4 px-6">Inspeção Geral</th>
                <th className="py-4 px-6">Observações</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">A carregar checklists...</td>
                </tr>
              ) : checklists.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">Nenhum checklist encontrado.</td>
                </tr>
              ) : (
                checklists.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-300">{item.data}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">{item.veiculos?.modelo} <span className="text-purple-400 font-mono">({item.veiculos?.placa})</span></td>
                    <td className="py-4 px-6 text-slate-300">{item.motoristas?.nome || 'N/D'}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-emerald-950/50 text-emerald-400 border border-emerald-500/20">
                        Aprovado
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-xs truncate">{item.observacoes || 'Sem observações'}</td>
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
              <h2 className="text-lg font-bold text-slate-100">Registar Novo Checklist</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Motorista</label>
                  <select
                    value={formData.motorista_id}
                    onChange={(e) => setFormData({ ...formData, motorista_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione o motorista</option>
                    {motoristas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
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
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={formData.pneus_ok} onChange={(e) => setFormData({ ...formData, pneus_ok: e.target.checked })} className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0" />
                  Pneus em bom estado
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={formData.oleo_ok} onChange={(e) => setFormData({ ...formData, oleo_ok: e.target.checked })} className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0" />
                  Nível de óleo OK
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={formData.luzes_ok} onChange={(e) => setFormData({ ...formData, luzes_ok: e.target.checked })} className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0" />
                  Luzes e Setas OK
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={formData.lataria_ok} onChange={(e) => setFormData({ ...formData, lataria_ok: e.target.checked })} className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0" />
                  Lataria e Vidros OK
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações</label>
                <textarea
                  rows="2"
                  placeholder="Observações adicionais..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40">Salvar Checklist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}