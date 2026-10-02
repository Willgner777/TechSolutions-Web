import { useCallback, useEffect, useRef, useState } from 'react';
import { carregarPerfil, obterSessaoAtual, observarSessao, sair } from '../services/authService';
import { mensagemDoErro } from '../services/errors';
import { logger } from '../utils/logger';

/**
 * Gerencia a sessão do Supabase e o perfil do usuário logado.
 *
 * - Carrega o perfil uma única vez por usuário.
 * - Cancela a assinatura de autenticação e os timers ao desmontar.
 * - Garante que `loading` sempre termine, mesmo se a leitura da sessão falhar.
 *
 * @returns {{
 *   session: object | null,
 *   userProfile: object | null,
 *   erroPerfil: string,
 *   loading: boolean,
 *   logout: () => Promise<void>,
 * }}
 */
export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [erroPerfil, setErroPerfil] = useState('');
  const [loading, setLoading] = useState(true);
  const usuarioCarregadoRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    const temporizadores = new Set();

    const aplicarSessao = async (sess) => {
      if (!ativo) return;

      if (!sess) {
        usuarioCarregadoRef.current = null;
        setSession(null);
        setUserProfile(null);
        setErroPerfil('');
        setLoading(false);
        return;
      }

      setSession(sess);

      if (usuarioCarregadoRef.current === sess.user.id) return;

      setLoading(true);
      try {
        const perfil = await carregarPerfil(sess.user.id);
        if (!ativo) return;
        usuarioCarregadoRef.current = sess.user.id;
        setUserProfile(perfil);
        setErroPerfil(perfil ? '' : 'O seu utilizador não possui um perfil registado.');
      } catch (erro) {
        logger.error('useAuthSession', 'Falha ao carregar o perfil do usuário.', erro);
        if (!ativo) return;
        setUserProfile(null);
        setErroPerfil('Não foi possível carregar o seu perfil: ' + mensagemDoErro(erro));
      } finally {
        if (ativo) setLoading(false);
      }
    };

    obterSessaoAtual()
      .then(aplicarSessao)
      .catch((erro) => {
        logger.error('useAuthSession', 'Falha ao ler a sessão atual.', erro);
        if (ativo) setLoading(false);
      });

    const cancelarAssinatura = observarSessao((evento, sess) => {
      if (evento === 'TOKEN_REFRESHED' || evento === 'USER_UPDATED') {
        if (sess) setSession(sess);
        return;
      }
      // Adiado para fora do callback: o Supabase não deve ser chamado de dentro dele.
      const id = setTimeout(() => {
        temporizadores.delete(id);
        aplicarSessao(sess);
      }, 0);
      temporizadores.add(id);
    });

    return () => {
      ativo = false;
      temporizadores.forEach(clearTimeout);
      cancelarAssinatura();
    };
  }, []);

  const logout = useCallback(() => sair(), []);

  return { session, userProfile, erroPerfil, loading, logout };
}
