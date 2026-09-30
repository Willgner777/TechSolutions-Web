import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || 'https://fhemscracvkzrrkdtnxc.supabase.co';

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_W9FeM-5fsIBF8GC3IiE0JQ_Qz2MCM6m';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente isolado, sem guardar sessão. Usado pelo Painel Admin Dev para criar
// usuários (signUp) sem trocar a sessão do administrador que está logado.
export const criarClienteIsolado = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
