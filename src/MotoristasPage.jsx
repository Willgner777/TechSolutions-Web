import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { Users, Plus, Search, Edit3, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MotoristasPage({ userProfile }) {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMotorista, setCurrentMotorista] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({ nome: '', cpf: '', cnh: '', categoria_cnh: 'B', status: 'ativo' });

  useEffect(() => {
    if (userProfile?.empresa_id) fetchMotoristas();
  }, [userProfile]);

  const fetchMotoristas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .eq('empresa_id', userProfile.empresa_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMotoristas(data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar motoristas: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      const payload = { ...formData, empresa_id: userProfile.empresa_id };

      if (currentMotorista) {
        const { error } = await supabase.from('motoristas').update(payload).eq('id', currentMotorista.id);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Motorista atualizado com sucesso!' });
      } else {
        const { error } = await supabase.from('motoristas').insert([payload]);
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Motorista registado com sucesso!' });
      }

      closeModal();
      fetchMotoristas();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar motorista: ' + err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover este motorista?')) return;
    try {
      const { error } = await supabase.from('motoristas').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Motorista removido com sucesso!' });
      fetchMotoristas();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao remover motorista: ' + err.message });
    }
  };

  const openModal = (motorista = null) => {
    if (motorista) {
      setCurrentMotorista(motorista);
      setFormData({ nome: motorista.nome, cpf: motorista.cpf, cnh: motorista.cnh, categoria_cnh: motorista.categoria_cnh, status: motorista.status });
    } else {
      setCurrentMotorista(null);
      setFormData({ nome: '', cpf: '', cnh: '', categoria_cnh: 'B', status: 'ativo' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentMotorista(null);
  };

  const filteredMotoristas = motoristas.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cpf.includes(searchTerm) ||
    m.cnh.includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Gestão de Motoristas</h1>
          <p className="text-sm text-slate-400 mt-1">Registo de colaboradores, CNH e controlos operacionais.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all"
        >
          <Plus size={18} /> Novo Motorista
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 border ${feedback.type === 'error' ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'}`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Pesquisar por nome, CPF ou CNH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">CPF</th>
                <th className="py-4 px-6">CNH / Cat</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">A carregar motoristas...</td>
                </tr>
              ) : filteredMotoristas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">Nenhum motorista encontrado.</td>
                </tr>
              ) : (
                filteredMotoristas.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-200">{m.nome}</td>
                    <td className="py-4 px-6 text-slate-300 font-mono">{m.cpf}</td>
                    <td className="py-4 px-6 text-slate-300 font-mono">{m.cnh} <span className="text-xs text-purple-400 font-bold ml-1">({m.categoria_cnh})</span></td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${m.status === 'ativo' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => openModal(m)} className="p-2 text-slate-400 hover:text-purple-400 transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
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
              <h2 className="text-lg font-bold text-slate-100">{currentMotorista ? 'Editar Motorista' : 'Registar Novo Motorista'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Registo CNH</label>
                  <input
                    type="text"
                    required
                    value={formData.cnh}
                    onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoria CNH</label>
                  <select
                    value={formData.categoria_cnh}
                    onChange={(e) => setFormData({ ...formData, categoria_cnh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40">Salvar Motorista</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}