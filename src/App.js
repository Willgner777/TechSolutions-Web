import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, Truck, Users, Fuel, Wrench, 
  CheckSquare, DollarSign, ShieldAlert, LogOut, Menu, X, Settings 
} from 'lucide-react';

// Importação das Telas (Modularizadas)
import DashboardPage from './pages/DashboardPage';
import VeiculosPage from './pages/VeiculosPage';
import MotoristasPage from './pages/MotoristasPage';
import AbastecimentosPage from './pages/AbastecimentosPage';
import ManutencoesPage from './pages/ManutencoesPage';
import ChecklistPage from './pages/ChecklistPage';
import DespesasPage from './pages/DespesasPage';

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*, empresas(nome, plano, ativo)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil do utilizador:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">A carregar WillTech Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        
        {/* Rotas Protegidas com Layout Operacional Unificado */}
        <Route path="/*" element={session ? <AuthenticatedLayout userProfile={userProfile} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}