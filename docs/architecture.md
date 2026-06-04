# Arquitetura do Sistema

## 1. Visão Geral

O sistema é um Kanban realtime fullstack baseado em arquitetura client-server desacoplada.

Fluxo geral:

Frontend (React)
↓ HTTP / WebSocket (futuro)
Backend (Express API)
↓
Service Layer (business logic)
↓
Prisma ORM
↓
PostgreSQL (Supabase)

---

## 2. Estrutura de Backend

O backend segue uma arquitetura em camadas:

- **Routes** → definição de endpoints HTTP
- **Controllers** → orquestração de request/response
- **Services** → regras de negócio
- **Prisma Client** → persistência de dados
- **Middleware** → autenticação e validação

### Exemplo de fluxo:

Request → Route → Controller → Service → Prisma → DB

---

## 3. Modelo de Domínio

O domínio do sistema segue estrutura hierárquica:

```txt
User
    └── Board
        └── Column
            └── Card
```

Regras principais:

- Um usuário possui múltiplos boards
- Um board possui múltiplas colunas
- Uma coluna possui múltiplos cards
- Ordenação é controlada via campo `order`

---

## 4. Decisões Técnicas

### 4.1 TypeScript + Node.js

Escolhido para garantir:

- tipagem estática
- escalabilidade do backend
- melhor DX em refactors

---

### 4.2 Prisma ORM

Motivos:

- tipagem automática do schema
- migrations seguras
- integração direta com PostgreSQL

Tradeoff:

- abstração acima do SQL pode limitar queries altamente otimizadas
- menor controle fino de performance comparado a SQL puro

---

### 4.3 PostgreSQL (Supabase)

Motivos:

- banco relacional robusto
- suporte a constraints e relations fortes
- infraestrutura gerenciada gratuita

Tradeoff:

- latência levemente maior em comparação a DB local
- dependência de provider externo

---

### 4.4 Autenticação JWT

Implementação atual:

- Access token JWT
- armazenado no frontend via localStorage

Motivo:

- simplicidade para MVP
- facilidade de integração com frontend React

Tradeoff:

- vulnerável a XSS
- não revogável facilmente
- não é ideal para produção crítica

---

## 5. Segurança

### Atual (MVP)

- JWT no localStorage
- Middleware protegendo rotas
- validação de input via Zod

### Limitações

- risco de XSS comprometendo tokens
- ausência de refresh token seguro
- ausência de httpOnly cookies

### Evolução futura

- migração para httpOnly cookies
- refresh token rotation
- blacklist de tokens (opcional)

---

## 6. Estrutura de Pastas

```txt
backend/
├── src/
│ ├── modules/
│ │ ├── auth/
│ │ ├── boards/
│ │ ├── columns/ (futuro)
│ │ └── cards/ (futuro)
│ ├── middlewares/
│ ├── lib/
│ ├── env.ts
│ ├── server.ts
│ └── app.ts
├── prisma/
├── prisma.config.ts
```

```txt
frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── services/
│ ├── hooks/
│ └── store/ (futuro)
```

---

## 7. WebSockets (Visão Futura)

O sistema será evoluído para tempo real utilizando WebSockets.

### Casos de uso

- movimentação de cards em tempo real
- atualização de colunas sincronizada
- presença de usuários no board
- colaboração simultânea

### Arquitetura prevista

Frontend ↔ WebSocket Server ↔ Backend State Layer ↔ DB

---

## 8. Evolução do Sistema

### Fase 1 (atual)

- Auth
- Boards
- Estrutura base Kanban

### Fase 2

- Columns customizáveis
- Cards CRUD completo

### Fase 3

- WebSocket realtime sync

### Fase 4

- Drag-and-drop completo
- otimizações de performance

---

## 9. Objetivo do Projeto

Este projeto tem como objetivo demonstrar:

- domínio de arquitetura fullstack
- backend escalável em Node.js
- modelagem de dados relacional
- autenticação segura (em evolução)
- preparação para sistemas realtime

---
