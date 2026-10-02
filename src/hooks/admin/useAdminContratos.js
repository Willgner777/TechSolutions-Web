import { useCallback, useMemo, useState } from 'react';
import { atualizarContrato, criarContrato } from '../../services/contratosService';
import { rolarParaTopo } from '../../utils/browser';

/**
 * Formulário, filtros e ações da aba "Contratos" do painel Super Dev.
 *
 * @param {{
 *   executar: Function,
 *   mostrarSucesso: Function,
 *   mostrarErro: Function,
 *   recarregar: Function,
 *   contratos: object[],
 * }} deps
 */
export function useAdminContratos({ executar, mostrarSucesso, mostrarErro, recarregar, contratos }) {
  const [exibirFormContrato, setExibirFormContrato] = useState(false);
  const [editingContratoId, setEditingContratoId] = useState(null);
  const [nomeContrato, setNomeContrato] = useState('');
  const [ufContrato, setUfContrato] = useState('');
  const [empresaContratoId, setEmpresaContratoId] = useState('');
  const [buscaContrato, setBuscaContrato] = useState('');
  const [filtroEmpresaContrato, setFiltroEmpresaContrato] = useState('');

  const limparFormContrato = useCallback(() => {
    setEditingContratoId(null);
    setNomeContrato('');
    setUfContrato('');
    setEmpresaContratoId('');
    setExibirFormContrato(false);
  }, []);

  const prepararEdicaoContrato = useCallback((contrato) => {
    setEditingContratoId(contrato.id);
    setNomeContrato(contrato.nome_contrato || '');
    setUfContrato(contrato.estado_uf || '');
    setEmpresaContratoId(contrato.empresa_id || '');
    setExibirFormContrato(true);
    rolarParaTopo();
  }, []);

  const salvarContrato = useCallback(
    async (evento) => {
      evento.preventDefault();
      if (!empresaContratoId) {
        mostrarErro('Selecione a empresa do contrato.');
        return;
      }
      if (!nomeContrato.trim()) {
        mostrarErro('Informe o nome do contrato.');
        return;
      }

      const salvou = await executar(
        async () => {
          const dados = {
            nome_contrato: nomeContrato.trim(),
            estado_uf: ufContrato || null,
            empresa_id: empresaContratoId,
          };

          if (editingContratoId) {
            await atualizarContrato(editingContratoId, dados);
          } else {
            await criarContrato(dados);
          }
          mostrarSucesso('Contrato salvo com sucesso!');
        },
        { contexto: 'useAdminContratos.salvarContrato', prefixoErro: 'Erro ao salvar contrato: ' }
      );

      if (salvou) {
        limparFormContrato();
        await recarregar({ manterFeedback: true });
      }
    },
    [
      empresaContratoId,
      nomeContrato,
      ufContrato,
      editingContratoId,
      executar,
      mostrarSucesso,
      mostrarErro,
      limparFormContrato,
      recarregar,
    ]
  );

  const contratosFiltrados = useMemo(() => {
    const termo = buscaContrato.toLowerCase();
    return contratos.filter((c) => {
      const okBusca =
        !termo ||
        (c.nome_contrato || '').toLowerCase().includes(termo) ||
        (c.estado_uf || '').toLowerCase().includes(termo);
      const okEmpresa = !filtroEmpresaContrato || c.empresa_id === filtroEmpresaContrato;
      return okBusca && okEmpresa;
    });
  }, [contratos, buscaContrato, filtroEmpresaContrato]);

  return {
    exibirFormContrato,
    setExibirFormContrato,
    editingContratoId,
    nomeContrato,
    setNomeContrato,
    ufContrato,
    setUfContrato,
    empresaContratoId,
    setEmpresaContratoId,
    buscaContrato,
    setBuscaContrato,
    filtroEmpresaContrato,
    setFiltroEmpresaContrato,
    contratosFiltrados,
    limparFormContrato,
    prepararEdicaoContrato,
    salvarContrato,
  };
}
