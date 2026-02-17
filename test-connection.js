const { Client, EmbedBuilder, Colors } = require('./dist/index');

const TOKEN = process.env.FLUXER_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

const client = new Client({
    token: TOKEN,
    presence: {
        status: 'online',
        activities: [{ name: 'with fluxer.js', type: 0 }],
    },
});

// Debug and error logging
client.on('debug', (msg) => console.log('[DEBUG]', msg));
client.on('error', (err) => console.error('[ERROR]', err.message));

// Ready event
client.on('ready', (user) => {
    console.log(`Logged in as ${user.tag} (${user.id})`);
    console.log(`Serving ${client.guilds.cache.size} guild(s)`);
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // !ping command
    if (message.content === '!ping') {
        await message.reply('Pong!');
    }

    // !embed command
    if (message.content === '!embed') {
        const embed = new EmbedBuilder()
            .setTitle('Hello from fluxer.js!')
            .setDescription('This is a rich embed built with the EmbedBuilder.')
            .setColor(Colors.Blue)
            .addField('SDK', 'fluxer.js', true)
            .addField('Version', '1.0.0', true)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        await message.reply({ embeds: [embed.toJSON()] });
    }

    // !userinfo command
    if (message.content === '!userinfo') {
        const user = message.author;
        const embed = new EmbedBuilder()
            .setTitle(`User: ${user.displayName}`)
            .setThumbnail(user.avatarURL({ size: 128 }))
            .addField('Tag', user.tag, true)
            .addField('ID', user.id, true)
            .addField('Bot', user.bot ? 'Yes' : 'No', true)
            .addField('Created', user.createdAt.toISOString())
            .setColor(Colors.Green);

        await message.reply({ embeds: [embed.toJSON()] });
    }

    // !serverinfo command
    if (message.content === '!serverinfo' && message.guildId) {
        try {
            const guild = await client.guilds.fetch(message.guildId);
            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .addField('Owner ID', guild.ownerId, true)
                .addField('Members', `${guild.memberCount}`, true)
                .addField('Channels', `${guild.channels.size}`, true)
                .addField('Roles', `${guild.roles.size}`, true)
                .setColor(Colors.Purple);

            if (guild.icon) {
                embed.setThumbnail(guild.iconURL({ size: 256 }));
            }

            await message.reply({ embeds: [embed.toJSON()] });
        } catch (err) {
            await message.reply('Could not fetch server info.');
        }
    }
});

// Guild events
client.on('guildCreate', (guild) => {
    console.log(`Joined guild: ${guild.name} (${guild.id})`);
});

client.on('guildDelete', (data) => {
    console.log(`Left guild: ${data.id}`);
});

// Start the bot
client.login();

console.log('Bot starting...');
