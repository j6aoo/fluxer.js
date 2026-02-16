# fluxer.js

A TypeScript/JavaScript SDK for the Fluxer API.

## Installation

```bash
npm install fluxer.js
```

## Usage

### Client (Recommended)

The `Client` class handles both REST API and Gateway connection.

```typescript
import { Client } from 'fluxer.js';

const client = new Client({
    token: 'YOUR_BOT_TOKEN',
    intents: 0 // Fluxer intents (if any)
});

client.on('ready', (user) => {
    console.log(`Logged in as ${user.username}`);
});

client.on('messageCreate', (message) => {
    if (message.content === '!ping') {
        client.rest.post(`/channels/${message.channel_id}/messages`, {
            content: 'pong'
        });
    }
});

client.login();
```

### REST API Only

If you only need to make HTTP requests:

```typescript
import { RestClient } from 'fluxer.js';

const rest = new RestClient({
    token: 'YOUR_BOT_TOKEN'
});

async function run() {
    const user = await rest.get('/users/@me');
    console.log(user);
}

run();
```

### Gateway Only

If you only need to connect to the Gateway:

```typescript
import { GatewayClient } from 'fluxer.js';

const gateway = new GatewayClient({
    token: 'YOUR_BOT_TOKEN'
});

gateway.on('ready', (data) => {
    console.log('Gateway Ready', data);
});

gateway.on('MESSAGE_CREATE', (message) => {
    console.log('New Message', message);
});

gateway.connect();
```

## Utilities

Helper functions for Snowflakes and CDNs are available:

```typescript
import { snowflakeToTimestamp, getUserAvatarUrl } from 'fluxer.js';

const timestamp = snowflakeToTimestamp('123456789012345678');
console.log(new Date(timestamp));

const avatarUrl = getUserAvatarUrl('USER_ID', 'AVATAR_HASH');
```

## License

ISC
