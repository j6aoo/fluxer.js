# fluxer.js

The official TypeScript/JavaScript SDK for the [Fluxer](https://fluxer.app) API. Build powerful bots and automations for the Fluxer platform.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Full REST API coverage (users, guilds, channels, messages, webhooks, invites)
- Real-time Gateway (WebSocket) with auto-reconnect, resume, and heartbeat
- Built-in rate limit handling with retry logic
- Rich structures with helper methods (Message.reply(), Channel.send(), Guild.ban(), etc.)
- EmbedBuilder for rich message embeds
- Collection class with utility methods (filter, find, map, etc.)
- Full TypeScript support with typed events
- CDN helpers for avatars, icons, banners, emojis
- Snowflake utilities

## Installation

```bash
npm install fluxer.js
```

## Quick Start

```typescript
import { Client } from 'fluxer.js';

const client = new Client({
    token: 'YOUR_BOT_TOKEN',
});

client.on('ready', (user) => {
    console.log(`Logged in as ${user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.reply('Pong!');
    }
});

client.login();
```

## Examples

### Send Embeds

```typescript
import { Client, EmbedBuilder, Colors } from 'fluxer.js';

const client = new Client({ token: 'YOUR_BOT_TOKEN' });

client.on('messageCreate', async (message) => {
    if (message.content === '!info') {
        const embed = new EmbedBuilder()
            .setTitle('Server Info')
            .setDescription('Welcome to the server!')
            .setColor(Colors.Blue)
            .addField('Members', '100', true)
            .addField('Channels', '20', true)
            .setFooter({ text: 'Powered by fluxer.js' })
            .setTimestamp();

        await message.reply({ embeds: [embed.toJSON()] });
    }
});

client.login();
```

### Guild Management

```typescript
client.on('guildCreate', async (guild) => {
    console.log(`Joined guild: ${guild.name} (${guild.memberCount} members)`);

    // Fetch channels
    const channels = await guild.fetchChannels();
    console.log(`Channels: ${channels.map(c => c.name).join(', ')}`);

    // Create a channel
    const newChannel = await guild.createChannel({
        name: 'bot-commands',
        topic: 'Use bot commands here',
    });

    await newChannel.send('Hello! Bot is ready.');
});
```

### Moderation

```typescript
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!ban ') && message.mentions.length > 0) {
        const target = message.mentions[0];

        try {
            const guild = await client.guilds.fetch(message.guildId!);
            await guild.banMember(target.id, {
                reason: `Banned by ${message.author.tag}`,
                delete_message_seconds: 86400,
            });
            await message.reply(`Banned ${target.tag}`);
        } catch (err) {
            await message.reply('Failed to ban user.');
        }
    }
});
```

### Webhooks

```typescript
const webhook = await client.webhooks.create('CHANNEL_ID', {
    name: 'My Webhook',
});

await client.webhooks.execute(webhook.id, webhook.token!, {
    content: 'Hello from a webhook!',
    username: 'Webhook Bot',
});
```

### REST-Only Usage

```typescript
import { RestClient } from 'fluxer.js';

const rest = new RestClient({ token: 'YOUR_BOT_TOKEN' });

// Get current user
const me = await rest.get('/users/@me');
console.log(`I am ${me.username}#${me.discriminator}`);

// Send a message
await rest.post('/channels/CHANNEL_ID/messages', {
    content: 'Hello via REST!',
});

// Get guild members
const members = await rest.get('/guilds/GUILD_ID/members', { limit: 100 });
```

### Gateway-Only Usage

```typescript
import { GatewayClient } from 'fluxer.js';

const gateway = new GatewayClient({ token: 'YOUR_BOT_TOKEN' });

gateway.on('READY', (data) => {
    console.log(`Connected as ${data.user.username}`);
});

gateway.on('MESSAGE_CREATE', (data) => {
    console.log(`[${data.channel_id}] ${data.author.username}: ${data.content}`);
});

gateway.connect();
```

### Utilities

```typescript
import {
    snowflakeToTimestamp,
    getCreationDate,
    getUserAvatarUrl,
    getDefaultAvatarUrl,
    getGuildIconUrl,
} from 'fluxer.js';

// Snowflake to timestamp
const created = getCreationDate('123456789012345678');
console.log(`Created at: ${created.toISOString()}`);

// CDN URLs
const avatar = getUserAvatarUrl('USER_ID', 'HASH', { size: 256, format: 'webp' });
const defaultAvatar = getDefaultAvatarUrl('USER_ID');
const guildIcon = getGuildIconUrl('GUILD_ID', 'HASH', { size: 512 });
```

## API Reference

### Client

The main entry point. Handles both REST and Gateway.

| Event | Description |
|-------|-------------|
| `ready` | Bot connected and ready |
| `messageCreate` | New message received |
| `messageUpdate` | Message was edited |
| `messageDelete` | Message was deleted |
| `guildCreate` | Bot joined a guild |
| `guildDelete` | Bot left/removed from a guild |
| `guildMemberAdd` | Member joined a guild |
| `guildMemberRemove` | Member left a guild |
| `channelCreate` | Channel was created |
| `channelUpdate` | Channel was updated |
| `channelDelete` | Channel was deleted |
| `typingStart` | User started typing |
| `presenceUpdate` | User presence changed |
| `voiceStateUpdate` | Voice state changed |

### Structures

| Class | Key Methods |
|-------|------------|
| `Message` | `reply()`, `edit()`, `delete()`, `pin()`, `react()` |
| `Channel` | `send()`, `fetchMessages()`, `delete()`, `edit()`, `bulkDelete()`, `sendTyping()` |
| `Guild` | `fetch()`, `edit()`, `leave()`, `createChannel()`, `createRole()`, `banMember()`, `kickMember()` |
| `GuildMember` | `kick()`, `ban()`, `edit()`, `addRole()`, `removeRole()` |
| `User` | `send()` (DM), `avatarURL()`, `fetchProfile()` |

### Managers

| Manager | Description |
|---------|-------------|
| `ChannelManager` | Fetch, edit, delete channels with caching |
| `UserManager` | Fetch users with caching |
| `GuildManager` | Fetch, create, leave guilds with caching |
| `MessageManager` | Fetch, delete, bulk-delete messages |
| `WebhookManager` | Create, execute, edit, delete webhooks |

### Builders

| Builder | Description |
|---------|-------------|
| `EmbedBuilder` | Fluent API for building rich embeds |

### Error Classes

| Error | Description |
|-------|-------------|
| `FluxerError` | General SDK error |
| `FluxerAPIError` | API returned an error (includes status, code, endpoint) |
| `FluxerRateLimitError` | Rate limited (includes retryAfter) |
| `FluxerGatewayError` | Gateway connection error |

## Requirements

- Node.js 18.0.0 or higher
- A Fluxer bot token

## License

MIT
