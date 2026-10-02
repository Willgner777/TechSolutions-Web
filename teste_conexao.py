from supabase_client import supabase

try:
    # Testa uma consulta em uma tabela do seu banco (ex: perfis ou funcionarios)
    resposta = supabase.table('perfis').select('*').limit(1).execute()
    print(" Conexão efetuada com sucesso!")
    print("Dados retornados:", resposta.data)
except Exception as e:
    print(" Erro ao conectar ao Supabase:", e)