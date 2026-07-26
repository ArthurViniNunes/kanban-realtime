# Kanban Realtime — Backend

API REST responsável pela autenticação de usuários e gerenciamento de boards, colunas e cards.

---

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

---

## Responsabilidades do Backend

### Autenticação

- Registro de usuários
- Login
- Geração de JWT
- Validação de identidade
- Proteção de recursos

### Gestão de Dados

- Boards
- Columns
- Cards

### Documentação

- Swagger/OpenAPI
- Schemas tipados
- Exemplos de requests e responses

---

## Arquitetura

Estrutura baseada em responsabilidades bem definidas:

```text
Controller
↓
Service
↓
Repository
↓
Database
```

### Benefícios

- Baixo acoplamento
- Alta manutenibilidade
- Escalabilidade
- Facilidade para testes

---

## Modelagem Relacional

```text
User
 └── Boards
      └── Columns
           └── Cards
```

---

## Principais Desafios Resolvidos

### Segurança

- Autenticação baseada em JWT
- Rotas protegidas
- Isolamento de recursos por usuário

### Estruturação

- Separação clara entre regras de negócio e persistência
- Organização modular por domínio

### Integração

- API consumida integralmente pelo frontend React
- Contratos documentados via Swagger

---

## Estado Atual e Próximas Evoluções

### Implementado

- Autenticação JWT
- Controle de acesso por membership
- Papéis de usuário tipados
- Integridade única de membership
- Exclusões em cascade
- Endpoint otimizado `GET /boards/:id`
- Movimentação transacional de cards
- Reindexação das colunas de origem e destino
- Emissão de eventos Socket.IO após confirmação da transação
- Testes unitários de autorização e movimentação

### Próximas Evoluções

- Reordenação de colunas
- Cliente Socket.IO no frontend
- Eventos realtime tipados
- Convites e gerenciamento de membros
- Testes de integração HTTP
- Pipeline de CI/CD

## Executando o Projeto

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente no arquivo `.env` de acordo com `.env.example` no backend e frontend.:

```env
DATABASE_URL=
DIRECT_URL=
POOLER_URL=

PORT=3333
API_PUBLIC_URL=http://localhost:3333
CORS_ORIGINS=http://localhost:5173

JWT_SECRET=""
JWT_EXPIRES_IN="7d"
```

Execute as migrations:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```

Servidor disponível em:

```text
http://localhost:3333
```

Documentação Swagger:

```text
http://localhost:3333/docs

---

## Competências Demonstradas

- Desenvolvimento de APIs REST
- Modelagem de banco relacional
- Autenticação JWT
- Prisma ORM
- TypeScript avançado
- Arquitetura em camadas
- Documentação OpenAPI
```
