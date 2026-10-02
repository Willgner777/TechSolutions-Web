# Gestão de Frota (WillTech)

Aplicação React (Create React App) com Supabase para gestão de funcionários,
contratos, empresas e usuários da plataforma.

## Requisitos

- Node.js 18+ e npm
- Um projeto Supabase com as tabelas `perfis`, `empresas` e `contratos`

## Rodando localmente

```bash
npm install
npm install prop-types      # necessário para a validação de props
cp .env.example .env        # no Windows: copy .env.example .env
# preencha o .env (veja abaixo) e então:
npm start
```

A aplicação abre em http://localhost:3000.

## Variáveis de ambiente (`.env`)

| Variável | Descrição |
| --- | --- |
| `REACT_APP_SUPABASE_URL` | URL do projeto Supabase |
| `REACT_APP_SUPABASE_ANON_KEY` | Chave pública (anon/publishable) do Supabase |

Se alguma estiver ausente, a aplicação mostra uma tela "Configuração incompleta"
dizendo exatamente quais variáveis faltam. O `.env` está no `.gitignore`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm start` | Servidor de desenvolvimento |
| `npm run build` | Build de produção na pasta `build/` |

## Estrutura de `src/`

```
src/
├── components/   componentes reutilizáveis e de layout
│   └── admin/    abas do Console Super Dev
├── pages/        telas (Login, Funcionários, Contratos, AdminDev)
├── hooks/        regras de negócio e estado (useFuncionarios, useContratos, useAdminDev...)
│   └── admin/    hooks específicos de cada aba do Console Super Dev
├── services/     acesso ao Supabase (única camada que fala com o banco)
├── utils/        funções puras (formatadores, logger, constantes)
├── styles/       index.css (Tailwind)
├── App.js        rotas (com code splitting)
└── index.js      ponto de entrada
```

Regra de dependência: `pages/components` → `hooks` → `services` → `supabaseClient`.
Páginas não chamam o Supabase diretamente.

## Convenções

- Componentes em PascalCase `.jsx`; hooks `useXxx.js`.
- Erros de operações assíncronas passam por `useStatusOperacao` (loading, feedback e log).
- Logs via `utils/logger.js` (sem `console.log` solto).
- Funções utilitárias e regras complexas documentadas em JSDoc.
