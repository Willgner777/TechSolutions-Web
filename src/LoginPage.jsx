import React, { useState } from 'react';
import { supabase } from './Admbases';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Traduz os erros mais comuns do Supabase Auth para mensagens claras
const traduzirErroLogin = (error) => {
  const msg = error?.message || '';

  if (msg === 'Invalid login credentials') return 'E-mail ou senha incorretos.';
  if (msg === 'Email not confirmed') return 'E-mail ainda não confirmado. Verifique a caixa de entrada.';
  if (error?.status === 429 || error?.code === 'over_request_rate_limit') {
    return 'Muitas tentativas de acesso. Aguarde um instante e tente novamente.';
  }
  if (msg === 'Failed to fetch' || error?.name === 'AuthRetryableFetchError') {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }

  return msg || 'Erro ao realizar login.';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const limparErro = () => {
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // evita duplo envio (duplo clique / Enter repetido)

    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Autenticação básica via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setErrorMessage(traduzirErroLogin(authError));
        setLoading(false);
        return;
      }

      const user = authData?.user;

      if (user) {
        // 2. Busca o perfil e a empresa vinculada ao usuário logado
        const { data: perfil, error: perfilError } = await supabase
          .from('usuarios') // Ajuste o nome da tabela se for 'profiles' ou 'funcionarios'
          .select('role, empresa_id')
          .eq('email', user.email)
          .single();

        if (perfilError) {
          console.error('Erro ao buscar dados do usuário:', perfilError);
          // Caso a busca por e-mail falhe, tenta buscar pelo ID de autenticação
          const { data: perfilById } = await supabase
            .from('usuarios')
            .select('role, empresa_id')
            .eq('id', user.id)
            .single();

          if (perfilById) {
            redirecionarUsuario(perfilById);
            return;
          }
        }

        if (perfil) {
          redirecionarUsuario(perfil);
        } else {
          // Se não houver cadastro adicional, redireciona para a rota genérica
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setErrorMessage(traduzirErroLogin(err));
      setLoading(false);
    }
  };

  // Função para direcionar a rota conforme a Role e Empresa
  const redirecionarUsuario = (perfil) => {
    const roleNormalized = perfil?.role?.toLowerCase() || '';

    // Se for superdev / super_dev -> Tela de Dev
    if (roleNormalized === 'superdev' || roleNormalized === 'super_dev' || roleNormalized === 'admin_global') {
      window.location.href = '/admin-dev';
    } 
    // Se for colaborador/admin de uma empresa específica -> Tela da Empresa
    else if (perfil?.empresa_id) {
      window.location.href = `/empresa/${perfil.empresa_id}`; // Ou `/dashboard?empresa=${perfil.empresa_id}`
    } 
    // Fallback padrão
    else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex font-sans overflow-hidden">
      <div className="w-full min-h-screen flex flex-col md:flex-row">
        
        {/* LADO ESQUERDO */}
        <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 p-8 lg:p-12 flex-col justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-black text-xl tracking-tighter">K</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">LOGÍSTICA</span>
          </div>

          <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
            <h3 className="text-white font-semibold text-xl">Plataforma Operacional</h3>
            <p className="text-purple-200/70 text-xs sm:text-sm mt-2 max-w-sm">
              Console Dev & Gestão Multi-tenant de Frotas.
            </p>
          </div>
          <div className="relative z-10 text-xs text-purple-300/50">© 2026 Todos os direitos reservados.</div>
        </div>

        {/* LADO DIREITO */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-center min-h-screen md:min-h-0">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Bem-vindo de volta!</h2>
              <p className="text-slate-500 text-sm mt-1.5">Insira as suas credenciais para aceder ao painel.</p>
            </div>

            {errorMessage && (
              <div role="alert" className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold text-slate-600">E-mail</label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="username"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); limparErro(); }}
                    placeholder="matias@willtech7.com.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-600">Senha</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); limparErro(); }}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-11 text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3.5 px-4 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'A verificar acesso...' : <><span>Acessar Sistema</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}