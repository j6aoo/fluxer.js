# Guia de Migração: Fluxer.js v1.x para v2.0

Esta versão traz mudanças significativas para melhorar a performance e a experiência de desenvolvimento.

## Principais Mudanças

### 1. Inicialização do Client
Na v1.x, as intents eram opcionais. Na v2.0, as **Intents Privilegiadas** são obrigatórias para receber certos eventos.

**v1.x:**
```javascript
const client = new Client('TOKEN');
```

**v2.0:**
```javascript
const client = new Client({
    token: 'TOKEN',
    intents: [Intents.GUILDS, Intents.GUILD_MESSAGES]
});
```

### 2. Mudança de Nomes de Eventos
Padronizamos os nomes dos eventos para seguir o padrão camelCase.

- `message` -> `messageCreate`
- `ready_bot` -> `ready`
- `guild_join` -> `guildCreate`

### 3. Sistema de Sharding
O Sharding não é mais automático no `Client`. Use o `ShardingManager` para processos separados ou a opção `shards` no Client para sharding interno.

### 4. Componentes de Mensagem
A v2.0 introduz suporte nativo a Botões e Select Menus. Interações agora são tratadas no evento `interactionCreate`.

### 5. TypeScript
Se você usa TypeScript, note que muitas interfaces foram renomeadas para melhor clareza (ex: `IUser` agora é `User`).

## Como Atualizar

1. Atualize a versão no `package.json`: `"fluxer.js-sdk": "^2.0.0"`.
2. Rode `npm install`.
3. Verifique seus eventos e adicione as Intents necessárias.
4. Consulte os [exemplos](./examples) para implementar as novas funcionalidades.
