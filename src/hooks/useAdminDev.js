import { useCallback, useEffect, useState } from 'react';
import { useStatusOperacao } from './useStatusOperacao';
import { useAdminDados } from './admin/useAdminDados';
import { useAdminLixeira } from './admin/useAdminLixeira';
import { useAdminEmpresas } from './admin/useAdminEmpresas';
import { useAdminContratos } from './admin/useAdminContratos';
import { useAdminUsuarios } from './admin/useAdminUsuarios';
import { sair } from '../services/authService';

/**
 * Compõe todo o estado e as ações do painel Super Dev (abas, dados e formulários).
 * A tela apenas consome o objeto retornado e renderiza.
 */
export function useAdminDev() {
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'empresas' | 'contratos' | 'lixeira'
  const { loading, feedback, executar, mostrarSucesso, mostrarErro, limparFeedback, isMounted } = useStatusOperacao();

  const dados = useAdminDados({ executar, isMounted });
  const { carregarDadosGlobais } = dados;

  useEffect(() => {
    carregarDadosGlobais();
  }, [carregarDadosGlobais]);

  const lixeira = useAdminLixeira({ executar, mostrarSucesso, recarregar: carregarDadosGlobais });

  const empresasCtl = useAdminEmpresas({
    executar,
    mostrarSucesso,
    mostrarErro,
    recarregar: carregarDadosGlobais,
    usuarios: dados.usuarios,
    contratosDaEmpresa: dados.contratosDaEmpresa,
    moverParaLixeira: lixeira.moverParaLixeira,
  });

  const contratosCtl = useAdminContratos({
    executar,
    mostrarSucesso,
    mostrarErro,
    recarregar: carregarDadosGlobais,
    contratos: dados.contratos,
  });

  const usuariosCtl = useAdminUsuarios({
    executar,
    mostrarSucesso,
    mostrarErro,
    recarregar: carregarDadosGlobais,
    usuarios: dados.usuarios,
    moverParaLixeira: lixeira.moverParaLixeira,
  });

  const handleLogout = useCallback(async () => {
    await sair();
    window.location.href = '/';
  }, []);

  return {
    activeTab,
    setActiveTab,
    loading,
    feedback,
    limparFeedback,
    handleLogout,
    ...dados,
    ...lixeira,
    ...empresasCtl,
    ...contratosCtl,
    ...usuariosCtl,
  };
}
