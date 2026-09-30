import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import EmpresasPage from '../pages/cadastros/EmpresasPage';
import PessoalPage from '../pages/cadastros/PessoalPage';
import FormEmpresaPage from '../pages/cadastros/FormEmpresaPage';
import FormPessoalPage from '../pages/cadastros/FormPessoalPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Rotas de Cadastros Gerais (Telas Cheias) */}
      <Route path="/cadastros/empresas" element={<ProtectedRoute allowedRoles={['super-dev']}><EmpresasPage /></ProtectedRoute>} />
      <Route path="/cadastros/empresas/novo" element={<ProtectedRoute allowedRoles={['super-dev']}><FormEmpresaPage /></ProtectedRoute>} />
      <Route path="/cadastros/empresas/editar/:id" element={<ProtectedRoute allowedRoles={['super-dev']}><FormEmpresaPage /></ProtectedRoute>} />
      
      <Route path="/cadastros/pessoal" element={<ProtectedRoute allowedRoles={['super-dev', 'Gestor Geral']}><PessoalPage /></ProtectedRoute>} />
      <Route path="/cadastros/pessoal/novo" element={<ProtectedRoute allowedRoles={['super-dev', 'Gestor Geral']}><FormPessoalPage /></ProtectedRoute>} />
      <Route path="/cadastros/pessoal/editar/:id" element={<ProtectedRoute allowedRoles={['super-dev', 'Gestor Geral']}><FormPessoalPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}