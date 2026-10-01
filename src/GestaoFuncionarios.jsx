import React, { useState, useEffect } from 'react';
import { supabase } from './Admbases'; // Ajuste o caminho se necessário
import { 
  Users, UserPlus, Search, Edit, Trash, X, RefreshCw 
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

export default function GestaoFuncionarios() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [busca, setBusca] = useState('');

  const [empresaId, setEmpresaId] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [contratos, setContratos] = useState([]);

  // Estado que controla a exibição do formulário
  const [exibirForm, setExibirForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('');
  const [setor, setSetor] = useState('');
  const [contrato, setContrato] = useState('');
  const [uf, setUf] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataDemissao, setDataDemissao] = useState('');
  const [status, setStatus] = useState('Ativo');

  useEffect(() => {
    carregarPerfilEmpresaEFuncionarios();
  }, []);

  const formatarDataBR = (dataIso) => {
    if (!dataIso) return '-';
    const partes = dataIso.split('-');
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const carregarPerfilEmpresaEFuncionarios = async () => {
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

      // Buscar contratos da empresa
      try {
        const { data: dataContratos } = await supabase
          .from('contratos')
          .select('id, nome_contrato, estado_uf')
          .eq('empresa_id', perfil.empresa_id)
          .is('deleted_at', null)
          .order('nome_contrato', { ascending: true });
        if (dataContratos) setContratos(dataContratos);
      } catch (e) {
        // Falha ao buscar contratos
      }

      // Buscar funcionários
      const { data: dataFunc, error: errFunc } = await supabase
        .from('perfis')
        .select('*')
        .eq('empresa_id', perfil.empresa_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (errFunc) throw errFunc;
      setFuncionarios(dataFunc || []);

    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setNome('');
    setEmail('');
    setSenha('');
    setCargo('');
    setSetor('');
    setContrato('');
    setUf('');
    setDataAdmissao('');
    setDataDemissao('');
    setStatus('Ativo');
    setExibirForm(false);
  };

  const prepararEdicao = (func) => {
    setEditingId(func.id);
    setNome(func.nome || '');
    setEmail(func.email || '');
    setSenha('');
    setCargo(func.cargo || '');
    setSetor(func.setor || '');
    setContrato(func.contrato || '');
    setUf(func.uf || '');
    setDataAdmissao(func.data_admissao || '');
    setDataDemissao(func.data_demissao || '');
    setStatus(func.status || 'Ativo');
    setExibirForm(true);
  };

  const salvarFuncionario = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('perfis')
          .update({
            nome,
            email,
            cargo,
            setor,
            contrato,
            uf,
            data_admissao: dataAdmissao || null,
            data_demissao: dataDemissao || null,
            status,
            ativo: status === 'Ativo'
          })
          .eq('id', editingId);

        if (error) throw error;
        setFeedback({ type: 'success', message: 'Funcionário atualizado!' });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome, role: 'funcionario' } }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: perfilError } = await supabase
            .from('perfis')
            .upsert([{
              id: authData.user.id,
              nome,
              email,
              role: 'funcionario',
              empresa_id: empresaId,
              cargo,
              setor,
              contrato,
              uf,
              data_admissao: dataAdmissao || null,
              data_demissao: dataDemissao || null,
              status,
              ativo: status === 'Ativo'
            }]);

          if (perfilError) throw perfilError;
        }

        setFeedback({ type: 'success', message: 'Funcionário cadastrado com sucesso!' });
      }

      limparFormulario();
      carregarPerfilEmpresaEFuncionarios();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const moverParaLixeira = async (id) => {
    if (!window.confirm('Deseja remover este funcionário?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setFeedback({ type: 'success', message: 'Funcionário removido!' });
      carregarPerfilEmpresaEFuncionarios();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const funcionariosFiltrados = funcionarios.filter(f => 
    (f.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (f.email || '').toLowerCase().includes(busca.toLowerCase()) ||
    (f.cargo || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-purple-600" />
              Gestão de Funcionários
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cadastre e gerencie a equipe da empresa</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={carregarPerfilEmpresaEFuncionarios}
              className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* BOTÃO QUE ABRE O FORMULÁRIO */}
            {!exibirForm && (
              <button
                onClick={() => {
                  limparFormulario();
                  setExibirForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold text-sm rounded-2xl shadow-md hover:bg-purple-700 transition"
              >
                <UserPlus className="w-4 h-4" /> + Novo Funcionário
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
          <form onSubmit={salvarFuncionario} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <button type="button" onClick={limparFormulario} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Senha Provisória *</label>
                  <input
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo</label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Setor / Departamento</label>
                <input
                  type="text"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contrato Vinculado</label>
                <select
                  value={contrato}
                  onChange={(e) => setContrato(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="">Selecione um contrato...</option>
                  {contratos.map(c => (
                    <option key={c.id} value={c.nome_contrato}>
                      {c.nome_contrato}{c.estado_uf ? ` - ${c.estado_uf}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="">Selecione o Estado...</option>
                  {ESTADOS_BRASIL.map(est => (
                    <option key={est.sigla} value={est.sigla}>{est.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  value={dataAdmissao}
                  onChange={(e) => setDataAdmissao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Demissão</label>
                <input
                  type="date"
                  value={dataDemissao}
                  onChange={(e) => setDataDemissao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Afastado">Afastado</option>
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
                {editingId ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
              </button>
            </div>
          </form>
        )}

        {/* TABELA DE FUNCIONÁRIOS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">Cargo / Setor</th>
                  <th className="py-3.5 px-4">UF</th>
                  <th className="py-3.5 px-4">Admissão</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {funcionariosFiltrados.length > 0 ? (
                  funcionariosFiltrados.map((func) => (
                    <tr key={func.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{func.nome || 'Sem Nome'}</div>
                        <div className="text-[11px] text-slate-500">{func.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{func.cargo || '-'}</div>
                        <span className="text-[10px] text-slate-400">{func.setor}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{func.uf || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatarDataBR(func.data_admissao)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold border ${
                          func.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {func.status || 'Ativo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button onClick={() => prepararEdicao(func)} className="p-1.5 bg-slate-100 text-purple-700 rounded-xl">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moverParaLixeira(func.id)} className="p-1.5 bg-red-50 text-red-600 rounded-xl">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Nenhum funcionário encontrado.
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