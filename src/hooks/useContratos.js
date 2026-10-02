import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStatusOperacao } from './useStatusOperacao';
import { obterEmpresaIdDoUsuarioAtual } from '../services/authService';
import { atualizarContrato, criarContrato, listarContratosDaEmpresa } from '../services/contratosService';
import { moverParaLixeira } from '../services/lixeiraService';

const FORMULARIO_INICIAL = { nomeContrato: '', estadoUf: '' };

/**
 * Regras e dados da tela de Contratos: listagem, busca, cadastro, edição e remoção.
 *
 * @param {string | null} [empresaIdDoPerfil] - Empresa do usuário logado, quando já conhecida
 *   (evita consultas extras). Se ausente, é descoberta pelo usuário autenticado.
 */
export function useContratos(empresaIdDoPerfil = null) {
  const { loading, feedback, executar, mostrarSucesso, mostrarErro, limparFeedback, isMounted } = useStatusOperacao();

  const [busca, setBusca] = useState('');
  const [empresaId, setEmpresaId] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [exibirForm, setExibirForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  const recarregar = useCallback(
    () =>
      executar(
        async () => {
          const idEmpresa = empresaIdDoPerfil || (await obterEmpresaIdDoUsuarioAtual());
          const lista = await listarContratosDaEmpresa(idEmpresa);
          if (!isMounted()) return;
          setEmpresaId(idEmpresa);
          setContratos(lista);
        },
        { contexto: 'useContratos.recarregar' }
      ),
    [empresaIdDoPerfil, executar, isMounted]
  );

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const atualizarCampo = useCallback((campo, valor) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }, []);

  const limparFormulario = useCallback(() => {
    setEditingId(null);
    setFormulario(FORMULARIO_INICIAL);
    setExibirForm(false);
  }, []);

  const abrirNovo = useCallback(() => {
    setEditingId(null);
    setFormulario(FORMULARIO_INICIAL);
    setExibirForm(true);
  }, []);

  const prepararEdicao = useCallback((contrato) => {
    setEditingId(contrato.id);
    setFormulario({
      nomeContrato: contrato.nome_contrato || '',
      estadoUf: contrato.estado_uf || '',
    });
    setExibirForm(true);
  }, []);

  const salvar = useCallback(
    async (evento) => {
      evento.preventDefault();

      if (!formulario.nomeContrato.trim()) {
        mostrarErro('Informe o nome do contrato.');
        return;
      }
      if (!editingId && !empresaId) {
        mostrarErro('Empresa vinculada não encontrada.');
        return;
      }

      const salvou = await executar(
        async () => {
          const dados = {
            nome_contrato: formulario.nomeContrato.trim(),
            estado_uf: formulario.estadoUf || null,
          };

          if (editingId) {
            await atualizarContrato(editingId, dados);
            mostrarSucesso('Contrato atualizado!');
          } else {
            await criarContrato({ ...dados, empresa_id: empresaId });
            mostrarSucesso('Contrato cadastrado com sucesso!');
          }
        },
        { contexto: 'useContratos.salvar' }
      );

      if (salvou) {
        limparFormulario();
        await recarregar();
      }
    },
    [editingId, empresaId, formulario, executar, mostrarSucesso, mostrarErro, limparFormulario, recarregar]
  );

  const remover = useCallback(
    async (id) => {
      const removeu = await executar(
        async () => {
          await moverParaLixeira('contratos', id);
          mostrarSucesso('Contrato removido!');
        },
        { contexto: 'useContratos.remover' }
      );
      if (removeu) await recarregar();
    },
    [executar, mostrarSucesso, recarregar]
  );

  const contratosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return contratos.filter((c) =>
      [c.nome_contrato, c.estado_uf].some((valor) => (valor || '').toLowerCase().includes(termo))
    );
  }, [contratos, busca]);

  return {
    loading,
    feedback,
    limparFeedback,
    busca,
    setBusca,
    contratosFiltrados,
    exibirForm,
    editingId,
    formulario,
    atualizarCampo,
    recarregar,
    abrirNovo,
    prepararEdicao,
    limparFormulario,
    salvar,
    remover,
  };
}
