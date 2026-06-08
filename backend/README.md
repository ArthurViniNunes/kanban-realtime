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

## Evoluções Planejadas

### Performance

Implementação de:

```http
GET /boards/:id
```

para evitar carregamento desnecessário de todos os boards.

### Realtime

Preparação para integração futura com:

- WebSockets
- Socket.IO

### Kanban Avançado

Suporte para:

- Reordenação de colunas
- Reordenação de cards
- Movimentação entre colunas

---

## Executando o Projeto

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente:

```env
DATABASE_URL=
JWT_SECRET=
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
http://localhost:3000
```

---

## Competências Demonstradas

- Desenvolvimento de APIs REST
- Modelagem de banco relacional
- Autenticação JWT
- Prisma ORM
- TypeScript avançado
- Arquitetura em camadas
- Documentação OpenAPI
