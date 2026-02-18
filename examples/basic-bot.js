const { Client, Intents } = require('fluxer.js-sdk');

const client = new Client({
    token: 'YOUR_BOT_TOKEN',
    intents: [Intents.GUILD_MESSAGES, Intents.MESSAGE_CONTENT]
});

const prefix = '!';

client.on('ready', () => {
    console.log(`Bot basic logado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        await message.reply('Pong! 🏓');
    }
    
    if (command === 'echo') {
        await message.channel.send(args.join(' ') || 'Nada para repetir.');
    }
});

client.login();
