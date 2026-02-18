const { Client, ApplicationCommandType } = require('fluxer.js-sdk');

const client = new Client({ token: 'YOUR_BOT_TOKEN' });

client.on('ready', async () => {
    console.log('Bot pronto para registrar Slash Commands!');

    // Exemplo de registro de comando global
    await client.application.commands.create({
        name: 'ping',
        description: 'Responde com pong!',
        type: ApplicationCommandType.CHAT_INPUT
    });
    
    console.log('Slash Command /ping registrado!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
    }
});

client.login();
