import { useCallback, useEffect, useRef, useState } from 'react';
import { useStatusOperacao } from './useStatusOperacao';
import { listarMateriaisDaEmpresa, criarMaterial, atualizarMaterial, alternarAtivoMaterial, excluirMaterial, proximoCodigo } from '../services/materiaisService';
import { supabase } from '../services/supabaseClient';
import { confirmarAcao } from '../utils/browser';

/**
 * Hook para gestão de materiais.
 * - admin_empresa: filtra automaticamente pela empresa do usuário logado.
 * - super_dev (superDev = true): não precisa de empresa vinculada; vê as
 *   materiais de TODAS as empresas ou filtra por uma empresa escolhida.
 */
export function useMateriais(empresaId, { superDev = false } = {}) {
  const { loading, feedback, executar, mostrarSucesso, mostrarErro, limparFeedback, isMounted } = useStatusOperacao();

  // guarda a versão mais recente de mostrarErro sem entrar nas dependências (evita recarregar em loop)
  const mostrarErroRef = useRef(mostrarErro);
  mostrarErroRef.current = mostrarErro;

  const [materiais, setMateriais] = useState([]);
  const [exibirForm, setExibirForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formulario, setFormulario] = useState({ 
    nome: '', 
    descricao: '', 
    umb: 'UN',
    codigo: null
  });
  const [proximoCod, setProximoCod] = useState(1);

  // --- super_dev: lista de empresas e empresa escolhida ('' = todas) ---
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');

  useEffect(() => {
    if (!superDev) return undefined;
    let cancelado = false;
    (async () => {
      const { data, error } = await supabase.from('empresas').select('*');
      if (cancelado) return;
      if (error) {
        mostrarErroRef.current('Não foi possível carregar as empresas: ' + error.message);
        return;
      }
      setEmpresas(
        (data || []).map((e) => ({
          id: e.id,
          nome: e.nome || e.nome_fantasia || e.razao_social || String(e.id),
        }))
      );
    })();
    return () => { cancelado = true; };
  }, [superDev]);

  // empresa que está valendo agora para criar material
  const empresaAlvo = superDev ? empresaSelecionada : empresaId;

  const recarregarMateriais = useCallback(async () => {
    if (!superDev && !empresaId) {
      mostrarErroRef.current('Seu perfil não está vinculado a uma empresa (empresa_id vazio).');
      return;
    }
    await executar(async () => {
      // super_dev vendo todas as empresas
      if (superDev && !empresaSelecionada) {
        const listas = await Promise.all(
          empresas.map(async (emp) => {
            const lista = await listarMateriaisDaEmpresa(emp.id);
            return (lista || []).map((m) => ({ ...m, empresa_nome: emp.nome }));
          })
        );
        if (isMounted()) {
          setMateriais(listas.flat());
          setProximoCod(1);
        }
        return;
      }

      // uma empresa só (admin_empresa ou super_dev com empresa escolhida)
      const [lista, prox] = await Promise.all([
        listarMateriaisDaEmpresa(empresaAlvo),
        proximoCodigo(empresaAlvo)
      ]);
      const nomeEmpresa = empresas.find((e) => e.id === empresaAlvo)?.nome;
      if (isMounted()) {
        setMateriais(nomeEmpresa ? lista.map((m) => ({ ...m, empresa_nome: nomeEmpresa })) : lista);
        setProximoCod(prox);
      }
    }, { contexto: 'useMateriais.recarregarMateriais' });
  }, [superDev, empresaId, empresaSelecionada, empresaAlvo, empresas, executar, isMounted]);

  useEffect(() => {
    recarregarMateriais();
  }, [recarregarMateriais]);

  const limparForm = useCallback(() => {
    setEditingId(null);
    setFormulario({ nome: '', descricao: '', umb: 'UN', codigo: null });
    setExibirForm(false);
  }, []);

  const abrirNovo = useCallback(() => {
    limparForm();
    setExibirForm(true);
  }, [limparForm]);

  const prepararEdicao = useCallback((mat) => {
    setEditingId(mat.id);
    setFormulario({ 
      nome: mat.nome, 
      descricao: mat.descricao || '', 
      umb: mat.umb || 'UN',
      codigo: mat.codigo
    });
    setExibirForm(true);
  }, []);

  const salvar = useCallback(async (e) => {
    e.preventDefault();
    if (!formulario.nome.trim()) return;

    // editar não precisa de empresa; criar precisa saber a empresa dona do material
    if (!editingId && !empresaAlvo) {
      mostrarErroRef.current(
        superDev
          ? 'Selecione uma empresa na lista do topo antes de cadastrar o material.'
          : 'Não é possível salvar: perfil sem empresa vinculada.'
      );
      return;
    }

    const salvou = await executar(async () => {
      if (editingId) {
        await atualizarMaterial(editingId, formulario);
        mostrarSucesso('Material atualizado!');
      } else {
        await criarMaterial({ empresaId: empresaAlvo, ...formulario });
        mostrarSucesso('Material cadastrado!');
      }
    }, { contexto: 'useMateriais.salvar' });

    if (salvou) {
      limparForm();
      await recarregarMateriais();
    }
  }, [editingId, empresaAlvo, superDev, formulario, executar, mostrarSucesso, limparForm, recarregarMateriais]);

  const remover = useCallback(async (id) => {
    if (!confirmarAcao('Excluir este material?')) return;
    const removeu = await executar(async () => {
      await excluirMaterial(id);
      mostrarSucesso('Material removido!');
    }, { contexto: 'useMateriais.remover' });
    if (removeu) await recarregarMateriais();
  }, [executar, mostrarSucesso, recarregarMateriais]);

  const toggleAtivo = useCallback(async (mat) => {
    // a tela considera "ativo" quando mat.ativo !== false; o hook usa a mesma regra
    const estaAtivo = mat.ativo !== false;
    const atualizou = await executar(async () => {
      await alternarAtivoMaterial(mat.id, !estaAtivo);
      mostrarSucesso(estaAtivo ? 'Material desativado' : 'Material ativado');
    }, { contexto: 'useMateriais.toggleAtivo' });
    if (atualizou) await recarregarMateriais();
  }, [executar, mostrarSucesso, recarregarMateriais]);

  return {
    loading,
    feedback,
    limparFeedback,
    materiais,
    exibirForm,
    editingId,
    formulario,
    setFormulario,
    proximoCod,
    recarregarMateriais,
    abrirNovo,
    prepararEdicao,
    limparForm,
    salvar,
    remover,
    toggleAtivo,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
  };
}
