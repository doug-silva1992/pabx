# PABX

Painel web de um PABX: API em **Laravel 13** (com documentação Swagger) e frontend em
**React 19 + TypeScript + Vite**, tudo rodando com Docker.

## Funcionalidades

| Módulo               | Situação                                                                 |
|----------------------|--------------------------------------------------------------------------|
| Login e cadastro     | ✅ Funcional (Laravel Sanctum, token Bearer, usuários no MySQL)          |
| Painel do PABX       | ✅ Área logada com menu lateral (responsivo, vira gaveta no celular)     |
| Webphone             | 🟡 Interface pronta, **chamadas simuladas** (sem servidor SIP conectado)  |
| Speech Analytics     | 🟡 Interface pronta, **dados de exemplo** fixos no código                |
| Ramais, Chamadas, Filas, URA, Gravações, Configurações | ⬜ Páginas "em desenvolvimento" |

## Stack

- **Backend:** PHP 8.4, Laravel 13, Laravel Sanctum, L5-Swagger (swagger-php)
- **Frontend:** React 19, TypeScript, Vite, React Router
- **Banco:** MySQL 8.4
- **Infra:** Docker Compose

## Estrutura

```
backend/                     Laravel
  app/Http/Controllers/Api/  Controllers da API (com atributos OpenAPI)
  routes/api.php             Rotas da API
  docker/entrypoint.sh       Instala dependências, roda migrations e gera o Swagger
frontend/                    React + Vite
  src/auth/                  Contexto de autenticação e proteção de rotas
  src/layouts/               Layout do PABX e itens do menu (menu.ts)
  src/pages/auth/            Login e cadastro
  src/pages/pabx/            Páginas do PABX (Painel, Webphone, Speech Analytics...)
  src/webphone/              Lógica do webphone (useSoftphone.ts)
  src/lib/api.ts             Cliente HTTP (envia o token automaticamente)
docker-compose.yml           MySQL + backend + frontend
```

## Como rodar

Pré-requisito: Docker com Docker Compose.

```bash
docker compose up -d --build
```

Na primeira vez o backend instala as dependências e roda as migrations, então pode levar
alguns minutos. O frontend só sobe depois que a API estiver pronta.

| Serviço    | URL                                     |
|------------|-----------------------------------------|
| Frontend   | http://localhost:5174                   |
| API        | http://localhost:8000/api               |
| Swagger UI | http://localhost:8000/api/documentation |
| MySQL      | `localhost:3306` · usuário `pabx` · senha `secret` · banco `pabx` |

Acesse o frontend, clique em **Criar usuário** e você será levado ao painel do PABX.

### Portas

As portas do host podem ser alteradas com `FRONTEND_PORT`, `BACKEND_PORT` e `DB_PORT`,
por exemplo num arquivo `.env` na raiz do projeto:

```env
FRONTEND_PORT=5173
```

O padrão do frontend é **5174** (e não 5173, o padrão do Vite) para não conflitar com
outros projetos Vite rodando na máquina.

## API

Todos os endpoints estão documentados no Swagger. Para testar rotas protegidas lá, faça
login, copie o `token` e use o botão **Authorize**.

| Método | Rota                 | Auth | Descrição                     |
|--------|----------------------|------|-------------------------------|
| GET    | `/api/health`        | —    | Status da API e do banco      |
| POST   | `/api/auth/register` | —    | Cria usuário e retorna token  |
| POST   | `/api/auth/login`    | —    | Autentica e retorna token     |
| GET    | `/api/auth/me`       | ✔    | Usuário autenticado           |
| POST   | `/api/auth/logout`   | ✔    | Revoga o token atual          |

Rotas protegidas exigem o header `Authorization: Bearer <token>`. Login e cadastro são
limitados a 10 tentativas por minuto.

## Como frontend e backend se conectam

O servidor de desenvolvimento do Vite repassa `/api` e `/docs` para o Laravel
([frontend/vite.config.ts](frontend/vite.config.ts)). No React basta chamar
`api('/rota')` (de `src/lib/api.ts`) ou `fetch('/api/...')`: não há CORS para configurar.

O token de login fica salvo no `localStorage` do navegador, então recarregar a página
mantém a sessão.

## Webphone

A tela ([WebphonePage.tsx](frontend/src/pages/pabx/WebphonePage.tsx)) tem teclado de
discagem, status do ramal, mudo, espera, envio de dígitos durante a chamada e histórico
da sessão.

Hoje as chamadas são **simuladas**: o destino "atende" sozinho após alguns segundos.
Toda a lógica fica em [useSoftphone.ts](frontend/src/webphone/useSoftphone.ts). Para
fazer chamadas reais, troque o conteúdo desse hook por uma biblioteca SIP sobre WebRTC
(ex.: SIP.js ou JsSIP), mantendo a mesma interface; a tela não precisa mudar. Para isso
ainda faltam:

- um servidor SIP com WebRTC (ex.: Asterisk ou FreeSWITCH) no `docker-compose.yml`;
- as credenciais SIP de cada usuário vindo do backend (hoje o ramal é fixo em `1001`).

## Speech Analytics

A tela ([SpeechAnalyticsPage.tsx](frontend/src/pages/pabx/SpeechAnalyticsPage.tsx)) mostra
indicadores, distribuição de sentimento, palavras-chave de alerta e a lista de chamadas
analisadas com resumo. Os dados são **de exemplo** e estão no próprio arquivo, até existir
um backend de transcrição e análise.

## Desenvolvimento

### Adicionar uma página ao menu do PABX

1. Crie o componente em `frontend/src/pages/pabx/`.
2. Adicione o item em [frontend/src/layouts/menu.ts](frontend/src/layouts/menu.ts).
3. Registre a rota dentro de `/pabx` em [frontend/src/App.tsx](frontend/src/App.tsx).

### Documentar endpoints no Swagger

Use os atributos do `swagger-php` nos controllers (veja
[AuthController.php](backend/app/Http/Controllers/Api/AuthController.php)). Schemas
compartilhados e o esquema de segurança ficam em
[Controller.php](backend/app/Http/Controllers/Controller.php). No Docker a documentação é
regerada a cada acesso ao Swagger; para gerar manualmente:

```bash
docker compose exec backend php artisan l5-swagger:generate
```

### Testes (PHPUnit)

Os testes do backend ficam em `backend/tests/` e rodam em **SQLite em memória**,
isolados do MySQL de desenvolvimento:

```bash
docker compose exec backend php artisan test                    # todos os testes
docker compose exec backend php artisan test --filter=AuthTest  # só uma classe
```

O `phpunit.xml` força as variáveis de banco com `force="true"` (em `<env>` e `<server>`).
Não remova isso: sem forçar, os testes herdariam o `DB_CONNECTION=mysql` do container, e
testes com `RefreshDatabase` apagariam o banco de desenvolvimento.

### Comandos úteis

```bash
docker compose exec backend php artisan migrate        # rodar migrations
docker compose exec backend composer require <pacote>  # dependência PHP
docker compose exec frontend npm install <pacote>      # dependência JS
docker compose exec frontend npm run lint              # lint do frontend
docker compose logs -f backend                         # logs da API
docker compose down                                    # parar tudo
docker compose down -v                                 # parar e apagar o banco
```

## Problemas comuns

- **Porta já em uso** (`port is already allocated`): outra aplicação está usando a porta.
  Troque com `FRONTEND_PORT`, `BACKEND_PORT` ou `DB_PORT` (veja [Portas](#portas)).
- **Pacote npm não encontrado no container:** o container do frontend tem seu próprio
  `node_modules`. Instale pelo container (`docker compose exec frontend npm install`) ou
  recrie-o com `docker compose up -d --build -V frontend`.
- **Erro 502 no frontend logo após subir:** a API ainda está iniciando; aguarde alguns
  segundos. Acompanhe com `docker compose logs -f backend`.
- **Backend usando SQLite em vez do MySQL:** o container não usa `php artisan serve`, que
  descarta as variáveis de ambiente do Docker. Se mudar o comando do backend, mantenha o
  servidor do PHP chamado direto, como no [Dockerfile](backend/Dockerfile).
