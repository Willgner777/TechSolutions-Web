import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { entrarComEmailESenha } from '../services/authService';
import { buscarRoleDoPerfil } from '../services/perfisService';
import { traduzirErroLogin } from '../utils/mensagensAuth';
import { logger } from '../utils/logger';

/**
 * Tela de login por e-mail e senha.
 * Após autenticar, redireciona o Super Dev para o console e os demais usuários para o painel.
 */
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
    if (loading) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const { data: authData, error: authError } = await entrarComEmailESenha(email, password);

      if (authError) {
        setErrorMessage(traduzirErroLogin(authError));
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setErrorMessage('Não foi possível concluir o login. Tente novamente.');
        setLoading(false);
        return;
      }

      // A permissão (role) define para onde o usuário é levado após o login.
      const perfil = await buscarRoleDoPerfil(authData.user.id);
      window.location.href = perfil?.role === 'super_dev' ? '/admin-dev' : '/dashboard';
    } catch (err) {
      logger.error('LoginPage', 'Falha inesperada no login.', err);
      setErrorMessage(traduzirErroLogin(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex font-sans overflow-hidden">
      <div className="w-full min-h-screen flex flex-col md:flex-row">
        
        {/* LADO ESQUERDO */}
        <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 p-8 lg:p-12 flex-col justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-black text-xl tracking-tighter">W</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">WILLTECH</span>
          </div>

          <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
            <h3 className="text-white font-semibold text-xl">Plataforma Operacional</h3>
            <p className="text-purple-200/70 text-xs sm:text-sm mt-2 max-w-sm">
              Gestão ERP & Controle de Acessos.
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
                    placeholder="seu@email.com"
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
