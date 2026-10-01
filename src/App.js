import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './Admbases';
import LoginPage from './LoginPage';
import AuthenticatedLayout from './AuthenticatedLayout';

async function carregarPerfil(userId) {
  const { data: perfil, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!perfil) return null;

  let empresa = null;
  if (perfil.empresa_id) {
    const { data } = await supabase
      .from('empresas')
      .select('nome, plano, ativo')
      .eq('id', perfil.empresa_id)
      .maybeSingle();
    empresa = data || null;
  }
  return { ...perfil, empresas: empresa };
}

function TelaCarregando() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-purple-200/80">A carregar WillTech Solutions...</p>
      </div>
    </div>
  );
}

function TelaAcessoBloqueado({ mensagem }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-white font-black text-xl tracking-tighter">W</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Acesso indisponível</h1>
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">{mensagem}</div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3.5 px-4 rounded-2xl shadow-lg transition-all text-sm cursor-pointer"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [erroPerfil, setErroPerfil] = useState('');
  const [loading, setLoading] = useState(true);
  const usuarioCarregado = useRef(null);

  useEffect(() => {
    let ativo = true;

    const aplicarSessao = async (sess) => {
      if (!ativo) return;

      if (!sess) {
        usuarioCarregado.current = null;
        setSession(null);
        setUserProfile(null);
        setErroPerfil('');
        setLoading(false);
        return;
      }

      setSession(sess);

      if (usuarioCarregado.current === sess.user.id) return;

      setLoading(true);
      try {
        const perfil = await carregarPerfil(sess.user.id);
        if (!ativo) return;
        usuarioCarregado.current = sess.user.id;
        setUserProfile(perfil);
        setErroPerfil(perfil ? '' : 'O seu utilizador não possui um perfil registado.');
      } catch (err) {
        if (!ativo) return;
        setUserProfile(null);
        setErroPerfil('Não foi possível carregar o seu perfil: ' + err.message);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session: sess } }) => aplicarSessao(sess));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sess) => {
      if (evento === 'TOKEN_REFRESHED' || evento === 'USER_UPDATED') {
        if (sess) setSession(sess);
        return;
      }
      setTimeout(() => aplicarSessao(sess), 0);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <TelaCarregando />;

  // Rota principal apontando exclusivamente para o admin-dev
  const home = '/admin-dev';

  let conteudoAutenticado = null;
  if (session) {
    if (!userProfile) {
      conteudoAutenticado = <TelaAcessoBloqueado mensagem={erroPerfil || 'Perfil não encontrado.'} />;
    } else if (userProfile.ativo === false) {
      conteudoAutenticado = <TelaAcessoBloqueado mensagem="Este utilizador está desativado." />;
    } else {
      conteudoAutenticado = <AuthenticatedLayout userProfile={userProfile} home={home} />;
    }
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to={home} replace />} />
        <Route path="/*" element={session ? conteudoAutenticado : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}