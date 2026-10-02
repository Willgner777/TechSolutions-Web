import { useCallback, useMemo, useState } from 'react';
import { listarTodasEmpresas } from '../../services/empresasService';
import { listarTodosPerfis } from '../../services/perfisService';
import { listarTodosContratos } from '../../services/contratosService';

/**
 * Carrega e organiza os dados globais do painel Super Dev: empresas, usuários
 * e contratos (ativos e na lixeira), além dos totais exibidos no resumo.
 *
 * @param {{ executar: Function, isMounted: () => boolean }} deps - Utilitários de `useStatusOperacao`.
 */
export function useAdminDados({ executar, isMounted }) {
  const [empresas, setEmpresas] = useState([]);
  const [empresasLixeira, setEmpresasLixeira] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLixeira, setUsuariosLixeira] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [contratosLixeira, setContratosLixeira] = useState([]);

  /**
   * Recarrega empresas, usuários e contratos em paralelo.
   * @param {{ manterFeedback?: boolean }} [opcoes] - Se `true`, preserva a mensagem de feedback atual.
   * @returns {Promise<boolean>}
   */
  const carregarDadosGlobais = useCallback(
    ({ manterFeedback = false } = {}) =>
      executar(
        async () => {
          const [todasEmpresas, todosUsuarios, todosContratos] = await Promise.all([
            listarTodasEmpresas(),
            listarTodosPerfis(),
            listarTodosContratos(),
          ]);
          if (!isMounted()) return;

          const empresasAtivas = todasEmpresas.filter((e) => !e.deleted_at);
          const usuariosAtivos = todosUsuarios
            .filter((u) => !u.deleted_at)
            .map((usr) => {
              const emp = empresasAtivas.find((e) => e.id === usr.empresa_id);
              return { ...usr, empresas: emp ? { nome: emp.nome || emp.nome_fantasia } : null };
            });

          setEmpresas(empresasAtivas);
          setEmpresasLixeira(todasEmpresas.filter((e) => e.deleted_at));
          setUsuarios(usuariosAtivos);
          setUsuariosLixeira(todosUsuarios.filter((u) => u.deleted_at));
          setContratos(todosContratos.filter((c) => !c.deleted_at));
          setContratosLixeira(todosContratos.filter((c) => c.deleted_at));
        },
        {
          contexto: 'useAdminDados.carregarDadosGlobais',
          prefixoErro: 'Erro ao carregar dados: ',
          limparFeedbackAntes: !manterFeedback,
        }
      ),
    [executar, isMounted]
  );

  const nomeDaEmpresa = useCallback(
    (id) => {
      const emp = [...empresas, ...empresasLixeira].find((e) => e.id === id);
      return emp ? emp.nome || emp.nome_fantasia : null;
    },
    [empresas, empresasLixeira]
  );

  const contratosDaEmpresa = useCallback((empId) => contratos.filter((c) => c.empresa_id === empId), [contratos]);

  const empresasMatrizes = useMemo(() => empresas.filter((e) => !e.matriz_id), [empresas]);

  const totalAtivos = useMemo(() => usuarios.filter((u) => u.ativo !== false).length, [usuarios]);
  const totalInativos = usuarios.length - totalAtivos;
  const totalSemEmpresa = useMemo(
    () => usuarios.filter((u) => u.role !== 'super_dev' && !u.empresas).length,
    [usuarios]
  );
  const totalLixeira = usuariosLixeira.length + empresasLixeira.length + contratosLixeira.length;

  return {
    empresas,
    empresasLixeira,
    usuarios,
    usuariosLixeira,
    contratos,
    contratosLixeira,
    carregarDadosGlobais,
    nomeDaEmpresa,
    contratosDaEmpresa,
    empresasMatrizes,
    totalAtivos,
    totalInativos,
    totalSemEmpresa,
    totalLixeira,
  };
}
