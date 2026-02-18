const { ShardingManager } = require('../dist/sharding/ShardingManager');

const manager = new ShardingManager('./bot.js', {
    token: 'YOUR_TOKEN_HERE',
    totalShards: 'auto',
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();
