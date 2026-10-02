import { useCallback, useState, useEffect, useRef } from 'react';
import { 
  listarMateriaisDaEmpresa, 
  listarTodosMateriais,
  criarMaterial, 
  atualizarMaterial, 
  alternarAtivoMaterial, 
  excluirMaterial,
  proximoCodigo
} from '../../services/materiaisService';
import { confirmarAcao } from '../../utils/browser';

/**
 * Hook para gestão de materiais no console Super Dev.
 * - Com empresa selecionada: lista e cadastra nessa empresa.
 * - Sem empresa selecionada: lista os materiais de TODAS as empresas e,
 *   para cadastrar, usa a empresa escolhida no formulário (empresaNova).
 *
 * IMPORTANTE: este hook NÃO retorna loading/feedback/limparFeedback.
 * Antes ele criava um useStatusOperacao próprio e devolvia esses valores, que
 * sobrescreviam (no spread do useAdminDev) os do painel: os erros e avisos de
 * salvar nunca apareciam na tela, pois o executar usado era o do painel.
 */
export function useAdminMateriais({ executar, mostrarSucesso, mostrarErro, empresaId }) {
  // controle próprio de "componente montado" (evita setState após desmontar)
  const montadoRef = useRef(true);
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  const isMounted = useCallback(() => montadoRef.current, []);

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
  // empresa escolhida no formulário quando nenhuma empresa está selecionada no painel
  const [empresaNova, setEmpresaNova] = useState('');

  const empresaAlvo = empresaId || empresaNova;

  const recarregarMateriais = useCallback(async () => {
    await executar(async () => {
      if (!empresaId) {
        const todos = await listarTodosMateriais();
        if (isMounted()) setMateriais(todos);
        return;
      }
      const [lista, prox] = await Promise.all([
        listarMateriaisDaEmpresa(empresaId),
        proximoCodigo(empresaId)
      ]);
      if (isMounted()) {
        setMateriais(lista);
        setProximoCod(prox);
      }
    }, { contexto: 'useAdminMateriais.recarregarMateriais' });
  }, [empresaId, executar, isMounted]);

  // Recarrega quando empresaId muda
  useEffect(() => {
    recarregarMateriais();
  }, [recarregarMateriais, empresaId]);

  // mostra o próximo código da empresa escolhida no formulário (modo "todas as empresas")
  useEffect(() => {
    if (empresaId) return;
    if (!empresaNova) {
      setProximoCod(1);
      return;
    }
    let cancelado = false;
    proximoCodigo(empresaNova)
      .then((prox) => { if (!cancelado) setProximoCod(prox); })
      .catch(() => { if (!cancelado) setProximoCod(1); });
    return () => { cancelado = true; };
  }, [empresaId, empresaNova]);

  const limparForm = useCallback(() => {
    setEditingId(null);
    setFormulario({ nome: '', descricao: '', umb: 'UN', codigo: null });
    setEmpresaNova('');
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
    if (!editingId && !empresaAlvo) {
      mostrarErro('Selecione a empresa do material.');
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
    }, { contexto: 'useAdminMateriais.salvar' });

    if (salvou) {
      limparForm();
      await recarregarMateriais();
    }
  }, [editingId, empresaAlvo, formulario, executar, mostrarSucesso, mostrarErro, limparForm, recarregarMateriais]);

  const remover = useCallback(async (id) => {
    if (!confirmarAcao('Excluir este material?')) return;
    const removeu = await executar(async () => {
      await excluirMaterial(id);
      mostrarSucesso('Material removido!');
    }, { contexto: 'useAdminMateriais.remover' });
    if (removeu) await recarregarMateriais();
  }, [executar, mostrarSucesso, recarregarMateriais]);

  const toggleAtivo = useCallback(async (mat) => {
    // a tabela considera "ativo" quando mat.ativo !== false
    const estaAtivo = mat.ativo !== false;
    const atualizou = await executar(async () => {
      await alternarAtivoMaterial(mat.id, !estaAtivo);
      mostrarSucesso(estaAtivo ? 'Material desativado' : 'Material ativado');
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
    empresaNova,
    setEmpresaNova,
  };
}
