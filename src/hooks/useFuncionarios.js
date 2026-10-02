import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStatusOperacao } from './useStatusOperacao';
import { obterEmpresaIdDoUsuarioAtual } from '../services/authService';
import { listarContratosResumoDaEmpresa } from '../services/contratosService';
import { atualizarPerfil, listarFuncionariosDaEmpresa } from '../services/perfisService';
import { moverParaLixeira } from '../services/lixeiraService';
import { atualizarCredenciaisAuth, cadastrarUsuarioComPerfil } from '../services/usuariosService';
import { podeUsarCadastros } from '../utils/utils';

const FORMULARIO_INICIAL = {
  nome: '',
  email: '',
  senha: '',
  cargo: '',
  setor: '',
  contrato: '',
  uf: '',
  dataAdmissao: '',
  dataDemissao: '',
  status: 'Ativo',
  role: 'funcionario',
};

/**
 * Converte o formulário nas colunas da tabela `perfis` (campos comuns a criar e editar).
 * @param {typeof FORMULARIO_INICIAL} f
 * @returns {object}
 */
const montarDadosDoPerfil = (f) => ({
  nome: f.nome,
  email: f.email,
  cargo: f.cargo,
  setor: f.setor,
  contrato: f.contrato,
  uf: f.uf,
  data_admissao: f.dataAdmissao || null,
  data_demissao: f.dataDemissao || null,
  status: f.status,
  ativo: f.status === 'Ativo',
});

/**
 * Regras e dados da tela de Funcionários: listagem, busca, cadastro, edição e remoção.
 *
 * @param {string | null} [empresaIdDoPerfil] - Empresa do usuário logado, quando já conhecida
 *   (evita consultas extras). Se ausente, é descoberta pelo usuário autenticado.
 * @param {string | null} [roleDoUsuarioAtual] - Role do usuário logado.
 */
export function useFuncionarios(empresaIdDoPerfil = null, roleDoUsuarioAtual = null) {
  const { loading, feedback, executar, mostrarSucesso, mostrarErro, limparFeedback, isMounted } = useStatusOperacao();

  const [busca, setBusca] = useState('');
  const [empresaId, setEmpresaId] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [exibirForm, setExibirForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  const recarregar = useCallback(
    () =>
      executar(
        async () => {
          const idEmpresa = empresaIdDoPerfil || (await obterEmpresaIdDoUsuarioAtual());
          const [contratosResumo, equipe] = await Promise.all([
            listarContratosResumoDaEmpresa(idEmpresa),
            listarFuncionariosDaEmpresa(idEmpresa),
          ]);
          if (!isMounted()) return;
          setEmpresaId(idEmpresa);
          setContratos(contratosResumo);
          setFuncionarios(equipe);
        },
        { contexto: 'useFuncionarios.recarregar' }
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

  const prepararEdicao = useCallback((func) => {
    setEditingId(func.id);
    setFormulario({
      nome: func.nome || '',
      email: func.email || '',
      senha: '',
      cargo: func.cargo || '',
      setor: func.setor || '',
      contrato: func.contrato || '',
      uf: func.uf || '',
      dataAdmissao: func.data_admissao || '',
      dataDemissao: func.data_demissao || '',
      status: func.status || 'Ativo',
      role: func.role || 'funcionario',
    });
    setExibirForm(true);
  }, []);

  const salvar = useCallback(
    async (evento) => {
      evento.preventDefault();

      if (!editingId && !empresaId) {
        mostrarErro('Empresa vinculada não encontrada.');
        return;
      }

      const podeDefinirRole = podeUsarCadastros(roleDoUsuarioAtual);
      const roleParaCriar = podeDefinirRole ? (formulario.role || 'funcionario') : 'funcionario';
      const roleParaAtualizar = podeDefinirRole ? (formulario.role || 'funcionario') : undefined;

      const salvou = await executar(
        async () => {
          if (editingId) {
            const dadosPerfil = montarDadosDoPerfil(formulario);
            if (roleParaAtualizar) dadosPerfil.role = roleParaAtualizar;
            await atualizarPerfil(editingId, dadosPerfil);
            if (formulario.senha.trim()) {
              await atualizarCredenciaisAuth(editingId, { senha: formulario.senha });
            }
            mostrarSucesso('Funcionário atualizado!');
            return;
          }
          await cadastrarUsuarioComPerfil({
            email: formulario.email,
            senha: formulario.senha,
            nome: formulario.nome,
            role: roleParaCriar,
            dadosPerfil: { ...montarDadosDoPerfil(formulario), role: roleParaCriar, empresa_id: empresaId },
          });
          mostrarSucesso('Funcionário cadastrado com sucesso!');
        },
        { contexto: 'useFuncionarios.salvar' }
      );

      if (salvou) {
        limparFormulario();
        await recarregar();
      }
    },
    [editingId, empresaId, formulario, executar, mostrarSucesso, mostrarErro, limparFormulario, recarregar, roleDoUsuarioAtual]
  );

  const remover = useCallback(
    async (id) => {
      const removeu = await executar(
        async () => {
          await moverParaLixeira('perfis', id);
          mostrarSucesso('Funcionário removido!');
        },
        { contexto: 'useFuncionarios.remover' }
      );
      if (removeu) await recarregar();
    },
    [executar, mostrarSucesso, recarregar]
  );

  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return funcionarios.filter((f) =>
      [f.nome, f.email, f.cargo].some((valor) => (valor || '').toLowerCase().includes(termo))
    );
  }, [funcionarios, busca]);

  return {
    loading,
    feedback,
    limparFeedback,
    busca,
    setBusca,
    contratos,
    funcionariosFiltrados,
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
