const { ShardingManager } = require('fluxer.js-sdk');
const path = require('path');

// Caminho para o seu arquivo de bot principal (ex: basic-bot.js)
const botPath = path.join(__dirname, 'basic-bot.js');

const manager = new ShardingManager(botPath, {
    token: 'YOUR_BOT_TOKEN',
    totalShards: 'auto', // O SDK decide o número ideal de shards
    respawn: true
});

manager.on('shardCreate', shard => {
    console.log(`[Manager] Shard ${shard.id} lançado.`);
});

manager.spawn().catch(err => {
    console.error('[Manager] Erro ao spawnar shards:', err);
});
