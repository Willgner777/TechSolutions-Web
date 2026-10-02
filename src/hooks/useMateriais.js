import { useCallback, useEffect, useState } from 'react';
import { useStatusOperacao } from './useStatusOperacao';
import { listarMateriaisDaEmpresa, criarMaterial, atualizarMaterial, alternarAtivoMaterial, excluirMaterial, proximoCodigo } from '../services/materiaisService';
import { confirmarAcao } from '../utils/browser';

/**
 * Hook para gestão de materiais no dashboard do admin_empresa.
 * Filtra automaticamente pela empresa do usuário logado.
 */
export function useMateriais(empresaId) {
  const { loading, feedback, executar, mostrarSucesso, mostrarErro, limparFeedback, isMounted } = useStatusOperacao();

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

  const recarregarMateriais = useCallback(async () => {
    if (!empresaId) return;
    await executar(async () => {
      const [lista, prox] = await Promise.all([
        listarMateriaisDaEmpresa(empresaId),
        proximoCodigo(empresaId)
      ]);
      if (isMounted()) {
        setMateriais(lista);
        setProximoCod(prox);
      }
    }, { contexto: 'useMateriais.recarregarMateriais' });
  }, [empresaId, executar, isMounted]);

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
    if (!formulario.nome.trim() || !empresaId) return;

    const salvou = await executar(async () => {
      if (editingId) {
        await atualizarMaterial(editingId, formulario);
        mostrarSucesso('Material atualizado!');
      } else {
        await criarMaterial({ empresaId, ...formulario });
        mostrarSucesso('Material cadastrado!');
      }
    }, { contexto: 'useMateriais.salvar' });

    if (salvou) {
      limparForm();
      await recarregarMateriais();
    }
  }, [editingId, empresaId, formulario, executar, mostrarSucesso, limparForm, recarregarMateriais]);

  const remover = useCallback(async (id) => {
    if (!confirmarAcao('Excluir este material?')) return;
    const removeu = await executar(async () => {
      await excluirMaterial(id);
      mostrarSucesso('Material removido!');
    }, { contexto: 'useMateriais.remover' });
    if (removeu) await recarregarMateriais();
  }, [executar, mostrarSucesso, recarregarMateriais]);

  const toggleAtivo = useCallback(async (mat) => {
    const atualizou = await executar(async () => {
      await alternarAtivoMaterial(mat.id, !mat.ativo);
      mostrarSucesso(mat.ativo ? 'Material desativado' : 'Material ativado');
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
  };
}