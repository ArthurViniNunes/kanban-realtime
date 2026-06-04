# Kanban Realtime

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-black?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

Sistema de gerenciamento de tarefas em estilo Kanban com atualização em tempo real.

Stack: React · TypeScript · Node.js · Express · Prisma · PostgreSQL · Supabase · WebSockets (em desenvolvimento)

---

## 🚀 Visão Geral

Este projeto implementa um sistema Kanban completo com foco em:

- Autenticação JWT
- Persistência em PostgreSQL (Supabase)
- Estrutura de domínio escalável (Boards, Columns, Cards)
- Backend modularizado com Service Layer
- Preparação para sincronização em tempo real via WebSockets

---

## 🧱 Arquitetura

Frontend -> API (Express) -> Service Layer -> Prisma -> PostgreSQL

Fluxo:

```txt
React UI
   v
REST API (Express)
   v
Services (business logic)
   v
Prisma ORM
   v
Supabase DB
```

### Backend

- Express + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- Layered Architecture (Controller -> Service -> Repository)

### Frontend

- React + Vite
- TypeScript
- Estrutura preparada para drag-and-drop e real-time sync

---

## 📐 Modelo de Domínio

```txt
User
    └── Board
        └── Column
            └── Card
```

---

## 🔐 Autenticação

- JWT Access Token
- Middleware de proteção de rotas
- Endpoint `/auth/me`

---

## ⚙️ Status do Projeto

- [x] Setup monorepo
- [x] Backend base
- [x] Auth (register/login)
- [x] Prisma + Supabase
- [x] Boards module
- [ ] Columns dinâmicas
- [ ] Cards CRUD
- [ ] WebSocket real-time sync
- [ ] Drag-and-drop UI

---

## 📦 Como rodar

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Variáveis de ambiente

```txt
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
```
