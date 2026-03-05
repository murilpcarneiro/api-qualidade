# Mini Fintech API - Hexagonal Architecture

Backend em Node.js + Express + TypeScript para processamento de transacoes financeiras, com foco em Clean Code, SOLID e Arquitetura Hexagonal (Ports and Adapters).

## Stack

- Node.js 20 LTS
- Express
- TypeScript (strict)
- Vitest
- ESLint
- Persistencia em JSON (simulando banco)

## Arquitetura

A estrutura foi separada por responsabilidade:

- `src/domain`: entidades e value objects com regras de negocio, sem dependencias de framework.
- `src/application`: casos de uso e ports (interfaces), orquestrando a regra de negocio.
- `src/adapters/inbound`: HTTP (Express), controllers, rotas e tratamento de erros.
- `src/adapters/outbound`: repositorios JSON, hash de senha e gerador de ID.
- `src/infrastructure`: detalhe tecnico de acesso ao arquivo JSON.
- `src/shared`: constantes e erros compartilhados.

## Funcionalidades

- Cadastro de usuarios
- Cadastro de cartoes
- Processamento de transacoes com controle de limite
- Cancelamento de transacoes
- Simulacao de chargeback
- Geracao de fatura mensal (mes-calendario)

## Regras importantes

- Valores monetarios em centavos (inteiro)
- Senhas com hash (`bcrypt`)
- Nenhuma regra de negocio nos controllers
- Persistencia JSON isolada nos adapters outbound

## Scripts

- `npm run dev`: roda em modo desenvolvimento
- `npm run build`: build TypeScript
- `npm run start`: executa build
- `npm run typecheck`: validacao de tipos
- `npm run lint`: lint
- `npm run test`: testes unitarios
- `npm run test:coverage`: cobertura de testes

## Cobertura

Configurada para o nucleo de negocio (`domain` e `application/use-cases`) com thresholds:

- Lines: 80%
- Statements: 80%
- Functions: 80%
- Branches: 75%

Execucao atual:

- Lines: 84.12%
- Statements: 84.29%
- Functions: 88.67%
- Branches: 78.18%

## Endpoints

Base URL: `/api`

- `POST /users`
  - body: `{ "name": "Alice", "email": "alice@mail.com", "password": "12345678" }`
- `POST /cards`
  - body: `{ "userId": "<id>", "cardNumber": "1234123412341234", "limitCents": 500000 }`
- `POST /transactions`
  - body: `{ "userId": "<id>", "cardId": "<id>", "amountCents": 10000, "description": "Compra" }`
- `POST /transactions/:transactionId/cancel`
- `POST /transactions/:transactionId/chargeback`
- `GET /cards/:cardId/invoice?referenceMonth=2026-03`

## Documentacao Swagger

- UI interativa: `GET /api/docs`
- OpenAPI JSON: `GET /api/docs.json`

## SonarQube

Arquivo `sonar-project.properties` incluido para facilitar analise no SonarQube Cloud com cobertura LCOV.
