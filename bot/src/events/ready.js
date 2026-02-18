// Bot ready event handler
// Fixed: Proper guild counting to avoid inflated counts

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // Count only available guilds (not unavailable/unloaded ones)
        const availableGuilds = client.guilds.cache.filter(guild => guild.name !== 'Unknown Guild');
        const guildCount = availableGuilds.size;

        console.log(`Bot is ready! Logged in as ${client.user?.tag || 'Unknown'}`);
        console.log(`Serving ${guildCount} guilds`);

        // Set bot activity with accurate guild count
        client.setActivity(`in ${guildCount} servers`, 3); // 3 = Watching
    }
};
