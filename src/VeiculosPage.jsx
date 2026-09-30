import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { Plus, Search, Edit3, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VeiculosPage({ userProfile }) {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVeiculo, setCurrentVeiculo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({ placa: '', modelo: '', marca: '', ano: '', tipo: 'passeio', status: 'ativo', km_atual: 0 });

  useEffect(() => {
    if (userProfile?.empresa_id) fetchVeiculos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.empresa_id]);

  const fetchVeiculos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('empresa_id', userProfile.empresa_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVeiculos(data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar veículos: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      const payload = { ...formData, empresa_id: userProfile.empresa_id };

      if (currentVeiculo) {
        const { error } = await supabase.from('veiculos').update(payload).eq('id', currentVeiculo.id);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Veículo atualizado com sucesso!' });
      } else {
        const { error } = await supabase.from('veiculos').insert([payload]);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Veículo registado com sucesso!' });
      }

      closeModal();
      fetchVeiculos();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar veículo: ' + err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover este veículo?')) return;
    try {
      const { error } = await supabase.from('veiculos').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Veículo removido com sucesso!' });
      fetchVeiculos();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao remover veículo: ' + err.message });
    }
  };

  const openModal = (veiculo = null) => {
    if (veiculo) {
      setCurrentVeiculo(veiculo);
      setFormData({ placa: veiculo.placa, modelo: veiculo.modelo, marca: veiculo.marca, ano: veiculo.ano, tipo: veiculo.tipo, status: veiculo.status, km_atual: veiculo.km_atual });
    } else {
      setCurrentVeiculo(null);
      setFormData({ placa: '', modelo: '', marca: '', ano: new Date().getFullYear(), tipo: 'passeio', status: 'ativo', km_atual: 0 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentVeiculo(null);
  };

  const termo = searchTerm.toLowerCase();
  const filteredVeiculos = veiculos.filter(v =>
    (v.placa || '').toLowerCase().includes(termo) ||
    (v.modelo || '').toLowerCase().includes(termo) ||
    (v.marca || '').toLowerCase().includes(termo)
  );
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Gestão de Veículos</h1>
          <p className="text-sm text-slate-500 mt-1">Controle toda a frota de automóveis, carrinhas e camiões.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-lg shadow-purple-500/30 transition-all"
        >
          <Plus size={18} /> Novo Veículo
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 border ${feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Pesquisar por placa, modelo ou marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Tabela de Veículos */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                <th className="py-4 px-6">Veículo</th>
                <th className="py-4 px-6">Placa</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Quilometragem</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">A carregar veículos...</td>
                </tr>
              ) : filteredVeiculos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">Nenhum veículo encontrado.</td>
                </tr>
              ) : (
                filteredVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {v.marca} {v.modelo} <span className="text-xs text-slate-500">({v.ano})</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-purple-600">{v.placa}</td>
                    <td className="py-4 px-6 capitalize text-slate-600">{v.tipo}</td>
                    <td className="py-4 px-6 text-slate-600">{v.km_atual?.toLocaleString()} km</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${v.status === 'ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => openModal(v)} className="p-2 text-slate-500 hover:text-purple-600 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-modal-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <h2 className="text-lg font-bold text-slate-800">{currentVeiculo ? 'Editar Veículo' : 'Registar Novo Veículo'}</h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    placeholder="EX: ABC-1234"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="EX: Volkswagen"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="EX: Virtus / Onix"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ano</label>
                  <input
                    type="number"
                    required
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="passeio">Passeio</option>
                    <option value="van">Van</option>
                    <option value="caminhao">Camião</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Km Inicial</label>
                  <input
                    type="number"
                    required
                    value={formData.km_atual}
                    onChange={(e) => setFormData({ ...formData, km_atual: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-lg shadow-purple-500/30 transition-all"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}