import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// --- Supabase simulado -------------------------------------------------------
let mockSession = null;
let mockTables = {};

function mockQuery(tabela) {
  const resultado = () => ({ data: mockTables[tabela] ?? [], error: null, count: (mockTables[tabela] ?? []).length });
  const q = {
    select: () => q, eq: () => q, order: () => q, limit: () => q,
    insert: () => q, update: () => q, delete: () => q, upsert: () => q,
    maybeSingle: () => Promise.resolve({ data: (mockTables[tabela] ?? [])[0] ?? null, error: null }),
    single: () => Promise.resolve({ data: (mockTables[tabela] ?? [])[0] ?? null, error: null }),
    then: (ok, err) => Promise.resolve(resultado()).then(ok, err),
  };
  return q;
}

jest.mock('./Admbases', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockSession } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: (tabela) => mockQuery(tabela),
  },
  criarClienteIsolado: () => ({ auth: { signUp: jest.fn() } }),
}));

import App from './App';

const sessao = { user: { id: 'u1', email: 'a@b.com' } };

beforeEach(() => {
  mockSession = null;
  mockTables = {};
  window.history.pushState({}, '', '/');
});

test('sem sessão mostra a tela de login', async () => {
  render(<App />);
  expect(await screen.findByText('Bem-vindo de volta!')).toBeInTheDocument();
  expect(screen.getByText('Acessar Sistema')).toBeInTheDocument();
});

test('usuário de empresa vê o menu e o dashboard', async () => {
  mockSession = sessao;
  mockTables = {
    perfis: [{ id: 'u1', nome: 'Maria', role: 'admin_empresa', empresa_id: 'e1', ativo: true }],
    empresas: [{ nome: 'Acme', plano: 'PRO', ativo: true }],
  };
  render(<App />);
  expect(await screen.findByText('Painel Operacional')).toBeInTheDocument();
  expect(screen.getAllByText('Veículos').length).toBeGreaterThan(0);
  expect(screen.queryByText('Painel Admin Dev')).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/dashboard');
});

test('super_dev é levado ao painel admin', async () => {
  mockSession = sessao;
  mockTables = {
    perfis: [{ id: 'u1', nome: 'Dev', role: 'super_dev', empresa_id: null, ativo: true }],
    empresas: [],
  };
  render(<App />);
  expect(await screen.findByText('Gestão da Plataforma Multi-tenant')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/admin-dev');
});

test('usuário sem perfil não entra no sistema', async () => {
  mockSession = sessao;
  mockTables = { perfis: [] };
  render(<App />);
  expect(await screen.findByText('Acesso indisponível')).toBeInTheDocument();
});

test('usuário sem empresa vê aviso em vez de carregar para sempre', async () => {
  mockSession = sessao;
  mockTables = { perfis: [{ id: 'u1', nome: 'Zé', role: 'funcionario', empresa_id: null, ativo: true }] };
  render(<App />);
  await waitFor(() => expect(screen.getByText('Usuário sem empresa')).toBeInTheDocument());
});

test('usuário comum não acessa /admin-dev', async () => {
  mockSession = sessao;
  mockTables = {
    perfis: [{ id: 'u1', nome: 'Maria', role: 'admin_empresa', empresa_id: 'e1', ativo: true }],
    empresas: [{ nome: 'Acme', ativo: true }],
  };
  window.history.pushState({}, '', '/admin-dev');
  render(<App />);
  expect(await screen.findByText('Painel Operacional')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/dashboard');
});

test.each([
  ['/veiculos', 'Gestão de Veículos'],
  ['/motoristas', 'Gestão de Motoristas'],
  ['/abastecimentos', 'Controlo de Abastecimentos'],
  ['/manutencoes', 'Controlo de Manutenções'],
  ['/checklists', 'Checklist Operacional'],
  ['/despesas', 'Gestão de Despesas'],
])('página %s renderiza sem erro', async (rota, titulo) => {
  mockSession = sessao;
  mockTables = {
    perfis: [{ id: 'u1', nome: 'Maria', role: 'admin_empresa', empresa_id: 'e1', ativo: true }],
    empresas: [{ nome: 'Acme', ativo: true }],
  };
  window.history.pushState({}, '', rota);
  render(<App />);
  expect(await screen.findByText(titulo)).toBeInTheDocument();
});
