const { Client } = require('./dist/index');

const client = new Client({
    token: 'MTAwMDAwMDAwMDAwMDAwMDAw.G5xX7_.6-0c7_abc123',
    intents: 513
});

client.on('debug', (msg) => console.log('[DEBUG]', msg));
client.on('error', (err) => console.error('[ERROR]', err));
client.on('raw', (p) => console.log('[RAW]', JSON.stringify(p)));
client.on('ready', (user) => {
    console.log('Logged in as', user.username);
    process.exit(0);
});

client.login();

setTimeout(() => {
    console.log('Timeout reached, closing...');
    process.exit(1);
}, 10000);
