# fluxer.js

Uma SDK que não te abandona no meio do caminho. Diferente daquele relacionamento tóxico que você teve.

## O que é isso aqui

O Fluxer é basicamente um Discord que decidiu seguir sua própria jornada. É open source, independente, e tem uma API praticamente idêntica à do Discord. Sabe aquela história de "se funciona no Discord, funciona aqui"? Pois é, mais ou menos isso. Muda a URL base e pronto, você tá no rolê.

Essa SDK aqui é pra você que quer construir bots pro Fluxer sem perder a sanidade mental. A gente já fez o trabalho sujo de lidar com WebSocket, rate limits, caches, e todas aquelas coisas chatas que ninguém quer implementar do zero.

## Por que usar isso

**Sharding que realmente funciona**: Sabe aquele bot que você tem que dividir em shards porque cresceu demais? A gente resolveu isso de um jeito que não dá vontade de chorar. Multi-process, IPC, auto-respawn quando o shard morre (e ele vai morrer). Tá tudo aqui.

**Rate limiting que não te deixa na mão**: A API do Fluxer tem limites. A gente respeita esses limites automaticamente. Filas, buckets, retries com backoff exponencial. Você não precisa ficar calculando delay na mão como se fosse 2015.

**Builders que fazem sentido**: Quer mandar uma mensagem com botões, selects, modais? Tem builder pra tudo. E eles validam suas merdas antes de você descobrir no runtime que botão não pode ter mais de 80 caracteres.

**TypeScript que não te odeia**: Tipagem forte, autocomplete que funciona, e zero dessas gambiarras de `any` escondido. Se tá tipado, tá tipado direito.

## O que você pode fazer

**Bots pequenos**: Aquele bot de moderação básica pro seu servidor de amigos. Funciona de boa.

**Bots médios**: Servidor com alguns milhares de membros, várias guilds. O cache inteligente e o rate limiting automático carregam isso nas costas.

**Bots gigantes**: Sharding automático, broadcast entre processos, gerenciamento de presença em escala. A SDK não trava quando seu bot entra em 10 mil servidores.

**Webhooks**: Recebe interações via HTTP sem precisar manter WebSocket aberto 24/7. Útil pra quem gosta de serverless e não quer pagar por container ocioso.

**Automação**: Scripts que rodam uma vez e saem. CRUD de mensagens, gestão de membros, backup de servidores. Você decide se quer modo REST-only ou com gateway.

## Arquitetura que a gente segue

A SDK é estruturada de um jeito que você consegue achar as coisas sem ter que abrir 15 arquivos diferentes.

**Structures** são os objetos que representam coisas da API. Usuários, mensagens, canais, guilds. Eles têm métodos pra fazer operações e getters pra informações derivadas. Quer banir alguém? `member.ban()`. Quer saber a cor do cargo mais alto? `member.displayHexColor`. Simples assim.

**Managers** cuidam dos caches e das operações em grupo. O GuildManager busca guilds. O MessageManager busca mensagens. Eles lidam com a paginação chata, atualização de caches, e invalidação quando necessário. Você não precisa ficar gerenciando Map na mão.

**Builders** são pra quando você precisa construir objetos complexos. Embeds, botões, selects, modais. É o padrão fluent que encadeia métodos e valida tudo no final. Nada de passar objeto JSON de 50 linhas.

**Sharding** é separado porque sharding é complicado demais pra ser só mais uma opção no Client. GatewayShard gerencia uma conexão. GatewayManager gerencia várias. ShardingManager sobe processos separados. Cada um no seu quadrado.

## Cache que não explode sua memória

Por padrão a gente usa LimitedCollection com sweepers automáticos. Mensagens antigas somem sozinhas. Membros inativos são removidos. Presenças podem ser desabilitadas completamente se você não precisa. Você define limites por manager e a SDK respeita.

Se você quer cache infinito, pode configurar. Mas a gente não recomenda. Já viu bot de Discord morrer por memory leak? A gente também viu. Por isso os defaults são conservadores.

## Rate limiting sério

A SDK implementa filas sequenciais por bucket. Requests pro mesmo endpoint esperam uma da outra. Quando bate 429, a gente espera o retry-after e tenta de novo. Se for rate limit global, todo mundo para e espera.

Isso significa que você pode fazer 100 chamadas simultâneas que a SDK vai serializar o que precisa e paralelizar o que pode. Sem você ter que pensar nisso.

## Eventos que você realmente usa

A gente não emite evento genérico demais. Cada evento do gateway vira uma instância de structure apropriada. MESSAGE_CREATE vira Message. GUILD_MEMBER_UPDATE vira GuildMember. E você recebe old e new quando faz sentido.

Os eventos seguem o padrão do Discord, então se você já usou discord.js, sabe exatamente o que esperar. ready, messageCreate, guildCreate, interactionCreate. Os mesmos nomes, os mesmos payloads.

## E se eu quiser usar sem gateway

Tem modo REST-only. Você cria o RestClient direto, sem passar pelo Client. Faz requests pra API sem manter WebSocket aberto. Útil pra scripts, cron jobs, ou quando você só precisa mandar mensagem ocasionalmente.

O RestClient tem os mesmos métodos que o client.rest, então migrar de um pro outro é trocar uma linha.

## Testes que não são piada

A gente usa Vitest. Tem cobertura de código, thresholds definidos, e mocks pra tudo. Quando você quebrar algo, vai saber antes de subir pra produção.

Os testes estão em `__tests__/` e são separados em unitários (lógica pura) e integração (que precisam de API real). Você roda tudo com `npm test` ou vê coverage com `npm run test:coverage`.

## Documentação que dá pra usar

Geração automática com TypeDoc. Toda a API pública documentada. Types, interfaces, enums, tudo explicado. Se seu editor mostra JSDoc, você já tem a documentação no autocomplete.

Tem também exemplos práticos em `examples/`. Bot básico, sharding, componentes, webhooks. Código que funciona copiado e colado.

## Migração v1 pra v2

Se você usou a v1, a v2 quebrou algumas coisas. A gente não se desculpa por isso. A v1 tinha gambiarras que a gente não queria manter.

O Client agora usa GatewayManager internamente. Se você criava GatewayClient separado, agora passa as opções direto pro Client. O RestClient mudou de lugar. Alguns managers ganharam métodos novos e perderam outros.

O guia completo de migração tá em MIGRATION.md. Leia antes de atualizar seu bot em produção.

## Instalação

npm install fluxer.js-sdk

Precisa de Node 18+. A gente usa fetch nativo, WebSocket nativo (com polyfill pros casos raros), e outras APIs modernas. Se você tá no Node 16 ainda, a hora de atualizar é agora.

## Licença

MIT. Faz o que quiser. Só não vem cobrar suporte depois.

---

Fluxer não é Discord. Discord é marca registrada de outra empresa. A gente só implementa uma API parecida porque ela é boa e faz sentido. Se o Discord processar, a gente diz que foi sem querer.
