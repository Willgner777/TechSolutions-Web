import os
from dotenv import load_dotenv
from supabase import create_client, Client, ClientOptions

load_dotenv()

supabase_url: str = os.getenv(
    'REACT_APP_SUPABASE_URL', 
    'https://fhemscracvkzrrkdtnxc.supabase.co'
)

supabase_anon_key: str = os.getenv(
    'REACT_APP_SUPABASE_ANON_KEY', 
    'sb_publishable_W9FeM-5fsIBF8GC3IiE0JQ_Qz2MCM6m'
)

# Cliente padrão
supabase: Client = create_client(supabase_url, supabase_anon_key)

# Cliente isolado (sem persistência de sessão)
def criar_cliente_isolado() -> Client:
    options = ClientOptions(
        auth={
            "persist_session": False,
            "auto_refresh_token": False,
            "detect_session_in_url": False
        }
    )
    return create_client(supabase_url, supabase_anon_key, options=options)