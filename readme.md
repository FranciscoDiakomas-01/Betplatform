# ⚽ WTT – Plataforma de Apostas Esportivas

Plataforma web de apostas esportivas com **gestão de usuários**, **painel administrativo**, **histórico de apostas** e **integração com API de estatísticas esportivas em tempo real**.

O sistema permite que usuários realizem apostas, depósitos e saques, enquanto administradores fazem o controle, validações e análise de comportamento.

---

## 🚀 Funcionalidades

### 🔐 Autenticação e Gestão de Acesso

- Login de usuários e administradores
- Cadastro de novos usuários
- Recuperação de senha / e-mail
- Controle de níveis de acesso (Usuário / Administrador)

---

### 👤 Usuário

- 💰 **Depósitos**: adicionar saldo à conta
- 💸 **Saques**: solicitar retirada de valores
- 🧾 **Histórico de apostas**:
  - Apostas passadas
  - Apostas em andamento
- 💬 **Chat com administradores** para suporte
- 📊 Visualização de jogos e estatísticas

---

### 🛠️ Administrador

- ✅ Autorizar saques
- 👀 Verificar apostas em andamento
- 💳 Conferir depósitos
- 💬 Chat com usuários
- 🧠 Análise de comportamento e detecção de irregularidades
- 🗑️ Gerenciamento de contas (remoção e bloqueio)

---

## 📡 Integração com API de Estatísticas

O sistema utiliza a **The Odds API** para obter dados esportivos em tempo real.

### 🔑 API Base URL

https://api.the-odds-api.com/v4

GET /sports?apikey=YOUR_API_KEY

GET /sports/soccer_epl/odds?regions=eu&markets=h2h&apiKey=YOUR_API_KEY

📚 Documentação oficial:  
https://the-odds-api.com/liveapi/guides/v4/#overview

## 🧱 Tecnologias Utilizadas

### Backend

- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- JWT para autenticação

### Frontend

- React / Next.js
- Tailwind CSS
- TypeScript

### Outros

- API externa (The Odds API)
- WebSockets (chat em tempo real)
- Git & GitHub

---
