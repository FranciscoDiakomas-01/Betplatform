# 🎲 Sistema de Apostas, Chat e Notificações

Este sistema integra apostas esportivas acumuladas, chat entre usuários e administradores, notificações e transações financeiras. Ele foi projetado para ser escalável, seguro e pronto para uso em uma plataforma real.

---

## 1. Visão Geral

O sistema possui cinco módulos principais:

1. **Usuário (User)** – clientes ou administradores.
2. **Apostas (BetSlip & BetPick)** – apostas simples ou acumuladas (máx. 2 jogos).
3. **Partidas e Odds (Match & Odd)** – cadastro de jogos e probabilidades de resultado.
4. **Chat (Chat & Message)** – comunicação entre usuário e admin.
5. **Transações & Notificações (Transaction & Notification)** – gerenciamento financeiro e alertas.

---

## 2. Módulo de Usuário

- Cada usuário possui **saldo**, **histórico de apostas**, **mensagens** e **notificações**.
- Usuário pode ser **CLIENT** ou **ADMIN**.
- Usuários clientes só podem conversar com administradores.
- Administradores podem conversar com múltiplos usuários.

**Implementação:**

- Criar endpoints para CRUD de usuários.
- Implementar autenticação e autorização (JWT ou sessão).
- Garantir que **CLIENT só converse com admin** e admin possa falar com vários users.

---

## 3. Módulo de Partidas e Odds

- Cada partida (`Match`) tem **time da casa**, **time visitante**, **horário de início** e **status** (`OPEN`, `CLOSED`, `FINISHED`, `CANCELED`).
- Cada partida possui **odds** (`HOME_WIN`, `DRAW`, `AWAY_WIN`).
- Odds são **salvas no momento da aposta** (snapshot) para garantir integridade financeira.

**Implementação:**

- Admin cria partidas e odds antes do início.
- Sistema fecha apostas automaticamente ou manualmente quando o jogo começa.
- Registrar resultado final para que o sistema possa resolver as apostas.

---

## 4. Módulo de Apostas (BetSlip & BetPick)

### 4.1 Fluxo da Ficha

1. Usuário seleciona **1 ou 2 jogos** e escolhe seu **palpite** para cada.
2. Sistema calcula:
   - `totalOdd = odd1 * odd2`
   - `possibleWin = stake * totalOdd`
3. Valor apostado é **debitado do saldo do usuário**.
4. Ficha (`BetSlip`) e palpites (`BetPick`) são salvos.
5. Status inicial: `PENDING`.

### 4.2 Resolução da Ficha

- Após o término das partidas:
  - Se **todos os palpites estiverem corretos** → ficha `WON`.
  - Se **1 ou mais palpites estiverem errados** → ficha `LOST`.
- Se ganha:
  - Saldo do usuário é **creditado** com `possibleWin`.
  - Criar `Transaction` de crédito.

**Implementação:**

- Validar regras antes de criar ficha:
  - Máximo 2 jogos por ficha.
  - Saldo suficiente do usuário.
  - Partida ainda `OPEN`.
- Resolver ficha dentro de **transação atômica** para evitar inconsistências financeiras.

---

## 5. Módulo de Chat (Chat & Message)

- Cada usuário tem **um chat com o admin**.
- Admin pode ter chats com **vários usuários**.
- Mensagens possuem `isRead` para controle de leitura.

**Implementação:**

- Criar endpoints para:
  - Enviar mensagem.
  - Listar mensagens de um chat.
  - Marcar como lida.
- Opcional: usar **WebSocket** para mensagens em tempo real.

---

## 6. Módulo de Notificações

- Tipos de notificações:
  - `SYSTEM` – alertas gerais do sistema.
  - `BET` – resultado de apostas.
  - `PAYMENT` – depósitos ou saques.
  - `MESSAGE` – novas mensagens do chat.
- Notificações possuem `isRead` para controle de visualização.

**Implementação:**

- Criar endpoint para listar notificações por usuário.
- Criar mecanismo para gerar notificações automaticamente:
  - Ao finalizar uma aposta.
  - Ao processar um depósito ou saque.
  - Ao receber mensagem.

---

## 7. Módulo de Transações

- Cada ação financeira gera uma `Transaction`:
  - **DEPÓSITO** – adiciona saldo.
  - **SAQUE** – retira saldo (aprovado ou pendente).
  - **APOSTA** – débito ao criar ficha.
  - **PAGAMENTO** – crédito ao ganhar aposta.
- Transações garantem **rastreamento completo**.

**Implementação:**

- Criar endpoints para criar, aprovar e listar transações.
- Sempre associar transações a `userId` e opcionalmente a `relatedSlipId` (aposta).

---

## 8. Boas práticas de implementação

1. **Snapshot das odds**: nunca recalcule odds após a aposta.
2. **Transações atômicas**: resolver apostas e movimentar saldo em transações para evitar inconsistência.
3. **Limite de apostas**: máximo 2 jogos por ficha.
4. **Controle de status**: usar enums para status (`OPEN`, `CLOSED`, `PENDING`, `WON`, etc.)
5. **Auditoria**: manter logs de transações, fichas e mensagens para segurança.
6. **Escalabilidade**: separar resolução de apostas em fila (ex: BullMQ ou RabbitMQ) se o volume crescer.
7. **Segurança**: verificar permissões (CLIENT vs ADMIN) para chat, apostas e transações.

---

## 9. Fluxo resumido do sistema

1. Admin cria partidas e odds (`Match` e `Odd`).
2. User cria aposta (`BetSlip` + `BetPick`), valor é debitado.
3. Sistema fecha apostas (`CLOSED`) quando partidas iniciam.
4. Admin ou sistema insere resultado final (`FINISHED`).
5. Sistema resolve fichas:
   - Se todos os palpites corretos → `WON` → crédito.
   - Se 1 errado → `LOST`.
6. Sistema envia notificações (`Notification`).
7. Usuário/Admin conversam via chat.
8. Transações financeiras registradas para todas as operações.

---

## 🔑 Conclusão

Este modelo garante:

- Consistência financeira.
- Fluxo justo de apostas acumuladas.
- Comunicação eficiente entre usuários e administradores.
- Escalabilidade e segurança pronta para produção.
