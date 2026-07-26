# Arquitetura do Sistema

## 1. Visão Geral

O Kanban Realtime é uma aplicação Full Stack desenvolvida para demonstrar conhecimentos em desenvolvimento moderno utilizando TypeScript, React, Node.js, PostgreSQL e arquitetura em camadas.

O sistema foi projetado desde o início para permitir evolução gradual, começando por um MVP funcional e evoluindo posteriormente para recursos de colaboração em tempo real, drag-and-drop avançado, cache inteligente e escalabilidade horizontal.

Fluxo atual da aplicação:

```txt
Frontend (React + Vite)
            │
            ▼
      HTTP REST API
            │
            ▼
 Backend (Express)
            │
            ▼
   Service Layer
            │
            ▼
 Prisma ORM
            │
            ▼
 PostgreSQL
```

A aplicação segue o modelo Client-Server desacoplado, permitindo que frontend e backend evoluam independentemente.

---

# 2. Arquitetura do Backend

O backend segue arquitetura modular baseada em responsabilidades bem definidas.

```txt
Request
   │
   ▼
Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

## Camadas

### Routes

Responsáveis pelo mapeamento dos endpoints HTTP.

Exemplos:

```txt
POST /auth/register
POST /auth/login

GET /boards
POST /boards
DELETE /boards/:id

GET /boards/:boardId/columns
POST /boards/:boardId/columns

GET /columns/:columnId/cards
POST /columns/:columnId/cards
```

---

### Controllers

Responsáveis por:

- receber requests
- validar entradas
- chamar services
- formatar responses

Não possuem regras de negócio.

---

### Services

Contêm toda a lógica de negócio da aplicação.

Exemplos:

- verificar ownership de recursos
- criar boards
- criar colunas
- criar cards
- autenticar usuários
- gerar JWT

---

### Prisma ORM

Camada de acesso ao banco de dados.

Responsável por:

- queries
- inserts
- updates
- deletes
- relacionamentos

---

### Middlewares

Responsáveis por funcionalidades transversais.

Atualmente:

- autenticação JWT
- tratamento de autorização

---

# 3. Arquitetura do Frontend

O frontend foi desenvolvido com React + Vite utilizando TypeScript.

Após o refactor da interface, a aplicação passou a utilizar:

- Tailwind CSS v4
- Shadcn/UI
- Radix UI
- Sonner
- Lucide Icons

---

## Estrutura

```txt
src/
│
├── api/
├── assets/
├── components/
│   ├── ui/
│   ├── ConfirmDialog
│   ├── EmptyState
│   ├── Layout
│   ├── PageHeader
│   └── Column
│
├── context/
├── hooks/
├── lib/
├── pages/
├── routes/
├── services/
├── store/
├── types/
└── utils/
```

---

## Responsabilidades

### api/

Responsável pela comunicação HTTP.

Exemplos:

```txt
boardsApi
columnsApi
cardsApi
authApi
```

---

### services/

Camada de abstração sobre regras de autenticação.

Exemplo:

```txt
authService
```

---

### context/

Gerenciamento global de autenticação.

Atualmente:

```txt
AuthContext
```

Responsável por:

- usuário autenticado
- login
- logout
- persistência de sessão

---

### pages/

Representam as páginas principais da aplicação.

Atualmente:

```txt
LoginPage
RegisterPage
BoardsPage
BoardPage
NotFoundPage
```

---

### components/

Componentes reutilizáveis da aplicação.

Exemplos:

```txt
Layout
Column
PageHeader
EmptyState
ConfirmDialog
```

---

### components/ui/

Componentes fornecidos pelo Shadcn/UI.

Exemplos:

```txt
Button
Card
Input
Label
Skeleton
Dialog
```

---

# 4. Modelo de Domínio

O domínio segue uma estrutura hierárquica.

```txt
User
 └── Board
      └── Column
            └── Card
```

---

## User

Representa um usuário autenticado.

Possui:

```txt
id
name
email
password (hash)
createdAt
updatedAt
deletedAt
```

---

## Board

Representa um quadro Kanban.

Possui:

```txt
id
title
order
boardId
createdAt
updatedAt
```

---

## Column

Representa uma coluna do board.

Possui:

```txt
id
title
order
boardId
```

---

## Card

Representa uma tarefa.

Possui:

```txt
id
title
description
order
columnId
createdAt
updatedAt
```

## BoardMember

```text
id
userId
boardId
role
```

---

## Regras atuais

- usuário possui vários boards
- board pertence a um único usuário
- board possui várias colunas
- coluna possui vários cards
- ordenação controlada pelo campo order

---

# 5. Autenticação

A autenticação utiliza JWT.

Fluxo:

```txt
Login
  │
  ▼
Backend valida credenciais
  │
  ▼
JWT gerado
  │
  ▼
Frontend armazena token
  │
  ▼
Requisições autenticadas
```

---

## Implementação Atual

- JWT Access Token
- armazenamento em localStorage
- AuthContext para gerenciamento de sessão
- rotas protegidas

---

## Tradeoffs

Vantagens:

- simples
- rápido para MVP
- fácil integração

Desvantagens:

- vulnerável a XSS
- não possui refresh token
- revogação limitada

---

## Evoluções Futuras

- refresh tokens
- cookies httpOnly
- token rotation
- revogação de sessão

---

# 6. Experiência do Usuário (Frontend)

A interface passou por uma refatoração completa.

---

## Componentização

Foram criados componentes reutilizáveis:

```txt
PageHeader
EmptyState
ConfirmDialog
Layout
```

---

## Feedback Visual

### Loading

Utilização de Skeletons.

Exemplos:

- carregamento de boards
- carregamento de colunas
- carregamento de cards

---

### Estados Vazios

Utilização de EmptyState.

Exemplos:

```txt
Nenhum board encontrado
Nenhuma coluna criada
Nenhum card criado
```

---

### Feedback de Ações

Utilização de Sonner.

Exemplos:

```txt
Board criado
Board removido
Conta criada
Erros de autenticação
```

---

### Confirmação de Exclusão

Utilização de ConfirmDialog.

Aplicado em:

```txt
Boards
Colunas
Cards
```

---

# 7. Decisões Técnicas

## React + TypeScript

Motivos:

- tipagem forte
- melhor manutenção
- melhor DX
- maior segurança em refactors

---

## Vite

Motivos:

- build extremamente rápido
- ótima experiência de desenvolvimento
- configuração simples

---

## Tailwind CSS v4

Motivos:

- produtividade
- consistência visual
- responsividade simplificada

---

## Shadcn/UI

Motivos:

- componentes acessíveis
- alta customização
- sem dependência de runtime próprio

---

## Prisma ORM

Motivos:

- tipagem automática
- migrations seguras
- integração excelente com TypeScript

---

## PostgreSQL

Motivos:

- consistência relacional
- integridade dos dados
- excelente suporte para sistemas colaborativos

---

# 8. Segurança

Atualmente:

- JWT
- rotas protegidas
- ownership validation
- validação de dados
- senhas armazenadas com hash

---

Limitações atuais:

- localStorage
- ausência de refresh token
- ausência de cookies httpOnly

---

# 9. Melhorias Planejadas

## Backend

### Carregamento de Board

O endpoint abaixo está implementado:

```http
GET /boards/:id
```

Ele retorna:

- dados do board;
- colunas ordenadas;
- cards ordenados dentro de cada coluna.

O frontend utiliza essa resposta como fonte principal do estado do board, evitando uma requisição adicional de cards para cada coluna.

### Evolução da Arquitetura

Adicionar:

```txt
boardsApi.get(id)
```

e substituir:

```txt
boardsApi.list()
→ find(...)
```

por:

```txt
boardsApi.get(id)
```

---

## Frontend

### React Query

Planejado para:

- cache automático
- sincronização
- retries
- invalidação de dados

---

### Pesquisa de Boards

Planejado:

```txt
campo de busca
+
botão dedicado de criação
```

Substituindo o modelo atual.

---

### Grid Melhorado

Planejado:

```txt
boards em grid mais semelhante ao Jira
```

---

### BoardPage

Planejado:

```txt
melhor gerenciamento horizontal de colunas
```

com experiência mais próxima do Jira/Trello.

---

# 10. Realtime

O backend possui a infraestrutura inicial com Socket.IO:

- autenticação por JWT;
- salas por board;
- validação de membership;
- presença de usuários;
- sincronização inicial do board;
- emissão de criação e exclusão de cards;
- emissão de movimentação após confirmação da transação.

Ainda falta no frontend:

- estabelecer a conexão Socket.IO;
- entrar e sair das salas;
- processar eventos;
- atualizar o estado local;
- tratar reconexão e ressincronização.

---

# 11. Estado Atual do Projeto

Implementado:

- autenticação completa
- registro de usuários
- login
- proteção de rotas
- CRUD de boards
- CRUD de colunas
- CRUD de cards
- responsividade
- UI moderna com Shadcn/UI
- feedback visual completo
- tratamento de erros
- estados de loading
- estados vazios
- confirmação de exclusões

O projeto encontra-se funcional como MVP e preparado para a próxima etapa de evolução arquitetural e funcionalidades em tempo real.

---

# 12. Objetivo do Projeto

Este projeto foi desenvolvido para demonstrar competências em:

- Engenharia de Software
- Arquitetura Full Stack
- React
- TypeScript
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- APIs REST
- Autenticação JWT
- Design de Interfaces Modernas
- Componentização
- Responsividade
- Boas práticas de manutenção e escalabilidade

Além do produto em si, o foco principal é evidenciar capacidade de evolução contínua, refatoração segura e construção incremental de software de qualidade.
