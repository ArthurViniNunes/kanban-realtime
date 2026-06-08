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

- Drag and Drop com @dnd-kit
- Reordenação de cards e colunas
- Busca de boards
- WebSockets para colaboração em tempo real
- Endpoint otimizado GET /boards/:id
- Skeleton Loading States

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
JWT_SECRET=
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

---

### Acesso

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api-docs
```

---

## Objetivo do Projeto

Este projeto foi desenvolvido como estudo avançado de desenvolvimento Full Stack, simulando problemas reais encontrados em aplicações SaaS modernas e aplicando práticas utilizadas em ambientes profissionais.
