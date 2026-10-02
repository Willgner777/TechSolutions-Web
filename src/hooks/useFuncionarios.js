import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './Admbases'; // IMPORTANTE: Ajuste o caminho de importação do Supabase
import { useStatusOperacao } from './useStatusOperacao';
import { obterEmpresaIdDoUsuarioAtual } from '../services/authService';
import { listarContratosResumoDaEmpresa } from '../services/contratosService';
import { atualizarPerfil, listarFuncionariosDaEmpresa } from '../services/perfisService';
import { moverParaLixeira } from '../services/lixeiraService';
import { cadastrarUsuarioComPerfil } from '../services/usuariosService';

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
 */
export function useFuncionarios(empresaIdDoPerfil = null) {
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
      senha: '', // Mantém em branco ao abrir edição
      cargo: func.cargo || '',
      setor: func.setor || '',
      contrato: func.contrato || '',
      uf: func.uf || '',
      dataAdmissao: func.data_admissao || '',
      dataDemissao: func.data_demissao || '',
      status: func.status || 'Ativo',
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

      const salvou = await executar(
        async () => {
          if (editingId) {
            // 1. Atualiza dados do perfil na tabela
            await atualizarPerfil(editingId, montarDadosDoPerfil(formulario));

            // 2. Se o Admin informou uma nova senha, redefine a senha no Supabase Auth
            if (formulario.senha && formulario.senha.trim() !== '') {
              const { error: errorSenha } = await supabase.auth.admin.updateUserById(
                editingId,
                { password: formulario.senha.trim() }
              );

              if (errorSenha) {
                throw new Error(`Dados atualizados, mas falhou ao alterar a senha: ${errorSenha.message}`);
              }
            }

            mostrarSucesso('Funcionário e credenciais atualizados com sucesso!');
            return;
          }

          // Fluxo de criação de novo funcionário
          await cadastrarUsuarioComPerfil({
            email: formulario.email,
            senha: formulario.senha,
            nome: formulario.nome,
            role: 'funcionario',
            dadosPerfil: { ...montarDadosDoPerfil(formulario), role: 'funcionario', empresa_id: empresaId },
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
    [editingId, empresaId, formulario, executar, mostrarSucesso, mostrarErro, limparFormulario, recarregar]
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