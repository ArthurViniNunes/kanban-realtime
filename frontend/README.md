# Kanban Realtime — Frontend

Interface web responsável pela experiência do usuário da plataforma Kanban Realtime.

Desenvolvida utilizando React, TypeScript e um Design System moderno baseado em Tailwind CSS e shadcn/ui.

---

## Tecnologias

### Core

- React
- TypeScript
- Vite

### Comunicação

- Axios

### Navegação

- React Router

### UI

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide Icons

---

## Funcionalidades

### Autenticação

- Login
- Cadastro
- Logout
- Persistência de sessão

### Boards

- Listagem
- Criação
- Exclusão

### Colunas

- Listagem
- Criação
- Exclusão

### Cards

- Listagem
- Criação
- Exclusão

---

## Arquitetura Frontend

### API Layer

Responsável pela comunicação com a API.

```text
api/
├── auth.api.ts
├── boards.api.ts
├── columns.api.ts
└── cards.api.ts
```

### Service Layer

Centraliza regras relacionadas à autenticação.

```text
services/
└── auth.service.ts
```

### Context API

Gerenciamento global do usuário autenticado.

```text
AuthContext
```

---

## Principais Decisões Técnicas

### Separação de Responsabilidades

O frontend foi estruturado para evitar acoplamento entre:

- Interface
- Regras de autenticação
- Comunicação HTTP

### Evolução Gradual

A aplicação iniciou com CSS inline e posteriormente foi migrada para:

```text
Tailwind CSS
+
shadcn/ui
```

sem interrupção das funcionalidades existentes.

### Proteção de Rotas

Implementação de:

```text
ProtectedRoute
GuestRoute
```

garantindo controle de acesso baseado na autenticação.

---

## Experiência do Usuário

- Toasts para feedback de operações
- Página 404 personalizada
- Layout responsivo
- Componentes reutilizáveis
- Navegação protegida

---

## Próximas Evoluções

### UX

- Estados vazios
- Skeleton Loading
- Melhor feedback visual

### Kanban

- Drag and Drop
- Reordenação de cards
- Reordenação de colunas

### Realtime

- Colaboração em tempo real
- Atualizações automáticas via WebSocket

---

## Executando o Projeto

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

Aplicação disponível em:

```text
http://localhost:5173
```

Certifique-se de que o backend esteja em execução antes de acessar a aplicação.

---

## Competências Demonstradas

- React
- TypeScript
- Componentização
- Context API
- Consumo de APIs REST
- React Router
- Tailwind CSS
- Design Systems
- Integração Frontend/Backend
- Arquitetura Frontend escalável
