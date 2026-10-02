import { useCallback, useEffect, useRef } from 'react';

/**
 * Informa se o componente ainda está montado. Evita atualizar estado depois
 * que a tela foi desmontada (respostas assíncronas tardias).
 * Compatível com o StrictMode do React (monta, desmonta e monta de novo).
 *
 * @returns {() => boolean} Função que devolve `true` enquanto o componente estiver montado.
 */
export function useIsMounted() {
  const montadoRef = useRef(false);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  return useCallback(() => montadoRef.current, []);
}
