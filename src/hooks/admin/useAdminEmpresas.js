import { useCallback, useState } from 'react';
import { atualizarEmpresa, criarEmpresa, definirEmpresaAtiva } from '../../services/empresasService';
import { confirmarAcao, rolarParaTopo } from '../../utils/browser';

/**
 * Formulário e ações da aba "Empresas & Filiais" do painel Super Dev.
 *
 * @param {{
 *   executar: Function,
 *   mostrarSucesso: Function,
 *   mostrarErro: Function,
 *   recarregar: Function,
 *   usuarios: object[],
 *   contratosDaEmpresa: (empresaId: string) => object[],
 *   moverParaLixeira: Function,
 * }} deps
 */
export function useAdminEmpresas({
  executar,
  mostrarSucesso,
  mostrarErro,
  recarregar,
  usuarios,
  contratosDaEmpresa,
  moverParaLixeira,
}) {
  const [exibirFormEmpresa, setExibirFormEmpresa] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpjEmpresa, setCnpjEmpresa] = useState('');
  const [ufEmpresa, setUfEmpresa] = useState('SP');
  const [planoEmpresa, setPlanoEmpresa] = useState('PRO');
  const [tipoEmpresa, setTipoEmpresa] = useState('MATRIZ');
  const [matrizIdSelecionada, setMatrizIdSelecionada] = useState('');

  const limparFormEmpresa = useCallback(() => {
    setEditingEmpresaId(null);
    setNomeEmpresa('');
    setCnpjEmpresa('');
    setUfEmpresa('SP');
    setPlanoEmpresa('PRO');
    setTipoEmpresa('MATRIZ');
    setMatrizIdSelecionada('');
    setExibirFormEmpresa(false);
  }, []);

  const prepararEdicaoEmpresa = useCallback((emp) => {
    setEditingEmpresaId(emp.id);
    setNomeEmpresa(emp.nome || emp.nome_fantasia || '');
    setCnpjEmpresa(emp.cnpj || '');
    setUfEmpresa(emp.uf || 'SP');
    setPlanoEmpresa(emp.plano || 'PRO');
    setTipoEmpresa(emp.matriz_id ? 'FILIAL' : 'MATRIZ');
    setMatrizIdSelecionada(emp.matriz_id || '');
    setExibirFormEmpresa(true);
    rolarParaTopo();
  }, []);

  const salvarEmpresa = useCallback(
    async (evento) => {
      evento.preventDefault();
      if (!nomeEmpresa.trim()) {
        mostrarErro('Insira o nome da empresa.');
        return;
      }

      const salvou = await executar(
        async () => {
          const dados = {
            nome: nomeEmpresa,
            cnpj: cnpjEmpresa,
            uf: ufEmpresa,
            plano: planoEmpresa,
            matriz_id: tipoEmpresa === 'FILIAL' ? matrizIdSelecionada || null : null,
          };

          if (editingEmpresaId) {
            await atualizarEmpresa(editingEmpresaId, dados);
          } else {
            await criarEmpresa(dados);
          }
          mostrarSucesso('Empresa / Filial salva com sucesso!');
        },
        { contexto: 'useAdminEmpresas.salvarEmpresa', prefixoErro: 'Erro ao salvar empresa: ' }
      );

      if (salvou) {
        limparFormEmpresa();
        await recarregar({ manterFeedback: true });
      }
    },
    [
      nomeEmpresa,
      cnpjEmpresa,
      ufEmpresa,
      planoEmpresa,
      tipoEmpresa,
      matrizIdSelecionada,
      editingEmpresaId,
      executar,
      mostrarSucesso,
      mostrarErro,
      limparFormEmpresa,
      recarregar,
    ]
  );

  const alternarAtivoEmpresa = useCallback(
    async (emp) => {
      const novoStatus = emp.ativo === false;
      const alterou = await executar(
        async () => {
          await definirEmpresaAtiva(emp.id, novoStatus);
          mostrarSucesso(novoStatus ? 'Empresa ativada!' : 'Empresa desativada!');
        },
        { contexto: 'useAdminEmpresas.alternarAtivoEmpresa', prefixoErro: 'Erro ao alterar status: ' }
      );
      if (alterou) await recarregar({ manterFeedback: true });
    },
    [executar, mostrarSucesso, recarregar]
  );

  const excluirEmpresa = useCallback(
    (emp) => {
      const qtdUsuarios = usuarios.filter((u) => u.empresa_id === emp.id).length;
      const qtdContratos = contratosDaEmpresa(emp.id).length;
      const nome = emp.nome || emp.nome_fantasia;
      const confirmado = confirmarAcao(
        `Mover "${nome}" para a Lixeira?\nVinculados: ${qtdUsuarios} utilizador(es) e ${qtdContratos} contrato(s).`
      );
      if (confirmado) moverParaLixeira('empresas', emp.id, 'Empresa');
    },
    [usuarios, contratosDaEmpresa, moverParaLixeira]
  );

  return {
    exibirFormEmpresa,
    setExibirFormEmpresa,
    editingEmpresaId,
    nomeEmpresa,
    setNomeEmpresa,
    cnpjEmpresa,
    setCnpjEmpresa,
    ufEmpresa,
    setUfEmpresa,
    planoEmpresa,
    setPlanoEmpresa,
    tipoEmpresa,
    setTipoEmpresa,
    matrizIdSelecionada,
    setMatrizIdSelecionada,
    limparFormEmpresa,
    prepararEdicaoEmpresa,
    salvarEmpresa,
    alternarAtivoEmpresa,
    excluirEmpresa,
  };
}
