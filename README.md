# Kanban Realtime

Aplicação Full Stack inspirada em plataformas de gerenciamento de tarefas como Jira, Trello e Linear.

O projeto foi desenvolvido para demonstrar competências em arquitetura Full Stack, autenticação, modelagem relacional, integração frontend/backend, experiência do usuário e evolução incremental de software.

---

## Principais Funcionalidades

### Autenticação

- Cadastro de usuários
- Login com JWT
- Rotas protegidas
- Persistência de sessão

### Gerenciamento de Boards

- Criação de boards
- Listagem de boards
- Exclusão de boards

### Gerenciamento de Colunas

- Criação de colunas
- Organização por posição
- Exclusão de colunas

### Gerenciamento de Cards

- Criação de cards
- Organização por coluna
- Exclusão de cards

### Interface

- Responsiva
- Componentizada
- Design System baseado em shadcn/ui
- Feedback visual através de Toasts

---

## Tecnologias Utilizadas

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Swagger/OpenAPI

### Frontend

- React
- TypeScript
- React Router
- Axios
- Tailwind CSS v4
- shadcn/ui
- Radix UI

---

## Conceitos Aplicados

### Arquitetura em Camadas

```text
Controller
↓
Service
↓
Repository
↓
Database
```

### Boas Práticas

- Separação de responsabilidades
- Componentização
- Context API
- Service Layer
- API Layer
- Rotas protegidas
- Tipagem completa com TypeScript

---

## Desafios Técnicos Resolvidos

- Integração completa entre frontend e backend
- Controle de autenticação JWT
- Proteção de rotas
- Gerenciamento de estado autenticado
- Estrutura escalável para evolução futura
- Migração gradual para Tailwind CSS e shadcn/ui

---

## Próximas Evoluções

## Próximas Evoluções

- Drag and Drop com `@dnd-kit`
- Reordenação visual de cards e colunas
- Integração completa do Socket.IO no frontend
- Sincronização de movimentações em tempo real
- Presença de usuários no board
- Convites e gerenciamento de membros
- Busca e filtros de boards
- Pipeline de integração contínua
- Deploy do frontend e backend

---

## Como Executar

### Backend

```bash
cd backend
npm install
```

Configure o arquivo `.env` de acordo com `.env.example`:

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

Inicie a API:

```bash
npm run dev
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure o arquivo `.env` de acordo com `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3333
```

---

### Acesso

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3333
```

Swagger:

```text
http://localhost:3333/docs
```

---

## Verificação de Qualidade

Na raiz do projeto:

```bash
npm run test -w backend
npm run typecheck -w backend
npm run lint -w frontend
npm run build -w frontend
```

A aplicação possui testes unitários para:

- autorização de acesso aos boards;
- validação de ownership;
- movimentação segura de cards;
- bloqueio de movimentações entre boards;
- reindexação de cards nas colunas.

---

## Objetivo do Projeto

Este projeto foi desenvolvido como estudo avançado de desenvolvimento Full Stack, simulando problemas reais encontrados em aplicações SaaS modernas e aplicando práticas utilizadas em ambientes profissionais.
