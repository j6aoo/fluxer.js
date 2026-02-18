# fluxer.js

An SDK that doesn’t abandon you halfway through. Unlike that toxic relationship you had.

## What is this

Fluxer is basically a Discord that decided to follow its own journey. It’s open source, independent, and has an API practically identical to Discord’s. You know that story of “if it works on Discord, it works here”? Yeah, more or less that. Change the base URL and boom, you’re in.

This SDK here is for you who want to build bots for Fluxer without losing your sanity. We already did the dirty work of dealing with WebSocket, rate limits, caches, and all those boring things nobody wants to implement from scratch.

## Why use this

**Sharding that actually works**: You know that bot you have to split into shards because it grew too much? We solved that in a way that doesn’t make you want to cry. Multi-process, IPC, auto-respawn when a shard dies (and it will die). It’s all here.

**Rate limiting that doesn’t leave you hanging**: The Fluxer API has limits. We automatically respect those limits. Queues, buckets, retries with exponential backoff. You don’t need to manually calculate delays like it’s 2015.

**Builders that make sense**: Want to send a message with buttons, selects, modals? There’s a builder for everything. And they validate your crap before you find out at runtime that a button can’t have more than 80 characters.

**TypeScript that doesn’t hate you**: Strong typing, autocomplete that works, and none of those hidden `any` hacks. If it’s typed, it’s typed properly.

## What you can do

**Small bots**: That basic moderation bot for your friends’ server. Works just fine.

**Medium bots**: Server with a few thousand members, multiple guilds. Smart caching and automatic rate limiting carry that on their backs.

**Huge bots**: Automatic sharding, cross-process broadcast, presence management at scale. The SDK doesn’t freeze when your bot joins 10 thousand servers.

**Webhooks**: Receive interactions via HTTP without keeping a WebSocket open 24/7. Useful if you like serverless and don’t want to pay for idle containers.

**Automation**: Scripts that run once and exit. Message CRUD, member management, server backups. You decide if you want REST-only mode or gateway.

## Architecture we follow

The SDK is structured in a way that lets you find things without opening 15 different files.

**Structures** are the objects that represent API things. Users, messages, channels, guilds. They have methods to perform operations and getters for derived information. Want to ban someone? `member.ban()`. Want to know the color of the highest role? `member.displayHexColor`. Simple like that.

**Managers** handle caches and group operations. GuildManager fetches guilds. MessageManager fetches messages. They deal with annoying pagination, cache updates, and invalidation when needed. You don’t need to manually manage a Map.

**Builders** are for when you need to construct complex objects. Embeds, buttons, selects, modals. It’s the fluent pattern chaining methods and validating everything at the end. No passing around 50-line JSON objects.

**Sharding** is separate because sharding is too complicated to be just another option in Client. GatewayShard manages one connection. GatewayManager manages multiple. ShardingManager spawns separate processes. Each in its own lane.

## Cache that doesn’t blow up your memory

By default we use LimitedCollection with automatic sweepers. Old messages disappear on their own. Inactive members are removed. Presences can be completely disabled if you don’t need them. You define limits per manager and the SDK respects them.

If you want infinite cache, you can configure it. But we don’t recommend it. Ever seen a Discord bot die from a memory leak? We have. That’s why the defaults are conservative.

## Serious rate limiting

The SDK implements sequential queues per bucket. Requests to the same endpoint wait for each other. When a 429 happens, we wait for the retry-after and try again. If it’s a global rate limit, everyone stops and waits.

That means you can fire 100 simultaneous calls and the SDK will serialize what needs to be serialized and parallelize what can be parallelized. Without you having to think about it.

## Events you actually use

We don’t emit overly generic events. Each gateway event becomes an instance of the appropriate structure. MESSAGE_CREATE becomes Message. GUILD_MEMBER_UPDATE becomes GuildMember. And you receive old and new when it makes sense.

The events follow the Discord pattern, so if you’ve used discord.js before, you know exactly what to expect. ready, messageCreate, guildCreate, interactionCreate. Same names, same payloads.

## What if I want to use it without gateway

There’s a REST-only mode. You create the RestClient directly, without going through Client. Make API requests without keeping a WebSocket open. Useful for scripts, cron jobs, or when you only need to send messages occasionally.

RestClient has the same methods as client.rest, so migrating from one to the other is changing one line.

## Tests that aren’t a joke

We use Vitest. There’s code coverage, defined thresholds, and mocks for everything. When you break something, you’ll know before pushing to production.

Tests live in `__tests__/` and are separated into unit (pure logic) and integration (which require a real API). You run everything with `npm test` or check coverage with `npm run test:coverage`.

## Documentation you can actually use

Automatic generation with TypeDoc. All public API documented. Types, interfaces, enums, everything explained. If your editor shows JSDoc, you already have documentation in autocomplete.

There are also practical examples in `examples/`. Basic bot, sharding, components, webhooks. Copy-paste code that works.

## Migration v1 to v2

If you used v1, v2 broke some things. We’re not apologizing for it. v1 had hacks we didn’t want to keep.

Client now uses GatewayManager internally. If you used to create GatewayClient separately, now you pass the options directly to Client. RestClient moved. Some managers gained new methods and lost others.

The full migration guide is in MIGRATION.md. Read it before updating your production bot.

## Installation

npm install fluxer.js-sdk

Requires Node 18+. We use native fetch, native WebSocket (with polyfill for rare cases), and other modern APIs. If you’re still on Node 16, now is the time to upgrade.

## License

MIT. Do whatever you want. Just don’t come asking for support later.

---

Fluxer is not Discord. Discord is a registered trademark of another company. We just implement a similar API because it’s good and makes sense. If Discord sues, we’ll say it was accidental.
