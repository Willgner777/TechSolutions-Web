import { useCallback, useState, useEffect, useRef } from 'react';
import { 
  listarMateriaisDaEmpresa, 
  criarMaterial, 
  atualizarMaterial, 
  alternarAtivoMaterial, 
  excluirMaterial,
  proximoCodigo
} from '../../services/materiaisService';
import { confirmarAcao } from '../../utils/browser';

/**
 * Hook para gestão de materiais no console Super Dev.
 * Aceita `empresaId` (string) ou `getEmpresaId` (function) para reagir a mudanças de empresa.
 */
export function useAdminMateriais({ executar, mostrarSucesso, mostrarErro, recarregar, empresaId, getEmpresaId }) {
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

  const lastEmpresaIdRef = useRef(null);

  const getCurrentEmpresaId = () => typeof getEmpresaId === 'function' ? getEmpresaId() : empresaId;

  const recarregarMateriais = useCallback(async () => {
    const eid = getCurrentEmpresaId();
    if (!eid) return;
    await executar(async () => {
      const [lista, prox] = await Promise.all([
        listarMateriaisDaEmpresa(eid),
        proximoCodigo(eid)
      ]);
      setMateriais(lista);
      setProximoCod(prox);
    }, { contexto: 'useAdminMateriais.recarregarMateriais' });
  }, [executar]);

  // Polling para detectar troca de empresa na aba Empresas
  useEffect(() => {
    const interval = setInterval(() => {
      const currentId = getCurrentEmpresaId();
      if (currentId && currentId !== lastEmpresaIdRef.current) {
        lastEmpresaIdRef.current = currentId;
        recarregarMateriais();
      }
    }, 400);
    return () => clearInterval(interval);
  }, [recarregarMateriais]);

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
    const eid = getCurrentEmpresaId();
    if (!formulario.nome.trim() || !eid) return;

    const salvou = await executar(async () => {
      if (editingId) {
        await atualizarMaterial(editingId, formulario);
        mostrarSucesso('Material atualizado!');
      } else {
        await criarMaterial({ empresaId: eid, ...formulario });
        mostrarSucesso('Material cadastrado!');
      }
    }, { contexto: 'useAdminMateriais.salvar' });

    if (salvou) {
      limparForm();
      await recarregarMateriais();
    }
  }, [editingId, formulario, executar, mostrarSucesso, limparForm, recarregarMateriais]);

  const remover = useCallback(async (id) => {
    if (!confirmarAcao('Excluir este material?')) return;
    const removeu = await executar(async () => {
      await excluirMaterial(id);
      mostrarSucesso('Material removido!');
    }, { contexto: 'useAdminMateriais.remover' });
    if (removeu) await recarregarMateriais();
  }, [executar, mostrarSucesso, recarregarMateriais]);

  const toggleAtivo = useCallback(async (mat) => {
    const atualizou = await executar(async () => {
      await alternarAtivoMaterial(mat.id, !mat.ativo);
      mostrarSucesso(mat.ativo ? 'Material desativado' : 'Material ativado');
    }, { contexto: 'useAdminMateriais.toggleAtivo' });
    if (atualizou) await recarregarMateriais();
  }, [executar, mostrarSucesso, recarregarMateriais]);

  return {
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
    setExibirForm,
  };
}