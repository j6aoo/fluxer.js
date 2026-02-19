# Wave.js

O SDK oficial e completo para construir bots poderosos no Fluxer. Se você já trabalhou com Discord.js, vai se sentir em casa. Simples, rápido e com todas as funcionalidades que você precisa.

[![npm version](https://img.shields.io/npm/fluxer.js-sdk)](https://www.npmjs.com/package/fluxer.js)
[![license](https://img.shields.io/npm/l/wave.js)](LICENSE)

---

## O que é o Wave.js?

Wave.js é o SDK JavaScript/TypeScript oficial para a API do Fluxer. Ele te dá acesso a todas as funcionalidades da plataforma através de uma interface simples e intuitiva, com suporte a WebSocket para eventos em tempo real, REST API para operações HTTP, e tudo mais que você precisa para criar bots incríveis.

### Por que Wave.js?

- **Familiar**: API similar ao Discord.js, fácil de aprender
- **Completo**: Suporte a todas as funcionalidades do Fluxer
- **Rápido**: Otimizado para performance com cache inteligente
- **TypeScript**: Tipagem completa incluída
- **Documentado**: Exemplos claros e documentação detalhada

---

## Instalação

```bash
npm install wave.js
```

Ou com yarn:

```bash
yarn add wave.js
```

---

## Primeiros Passos

### O Básico

Todo bot começa com um Client. É através dele que você se conecta ao Fluxer, recebe eventos e interage com a API.

```javascript
const { Client, GatewayDispatchEvents } = require('wave.js');

const client = new Client({
  token: 'SEU_BOT_TOKEN_AQUI'
});

// Quando o bot estiver pronto
client.on(GatewayDispatchEvents.Ready, ({ data }) => {
  console.log(`🚀 Bot online como ${data.user.username}!`);
  console.log(`📊 Conectado em ${data.guilds.length} servidores`);
});

// Conectar
client.connect();
```

### Usando com TypeScript

```typescript
import { Client, GatewayDispatchEvents, Message } from 'wave.js';

const client = new Client({
  token: process.env.BOT_TOKEN!
});

client.on(GatewayDispatchEvents.MessageCreate, (message: Message) => {
  if (message.content === '!ping') {
    message.reply('Pong! 🏓');
  }
});

client.connect();
```

---

## Recebendo Mensagens

Uma das coisas mais comuns que você vai fazer é responder a mensagens dos usuários. É super simples:

```javascript
const { GatewayDispatchEvents } = require('wave.js');

client.on(GatewayDispatchEvents.MessageCreate, async (message) => {
  // Ignora mensagens de bots
  if (message.author.bot) return;
  
  // Comando simples
  if (message.content === '!ola') {
    await message.channel.send(`Olá, ${message.author.username}! 👋`);
  }
  
  // Comando com argumentos
  if (message.content.startsWith('!dizer ')) {
    const texto = message.content.slice(7);
    await message.channel.send(texto);
  }
});
```

### Respondendo Mensagens

Tem várias formas de responder uma mensagem:

```javascript
// Responder na mesma mensagem (cria uma thread visual)
await message.reply('Esta é uma resposta!');

// Enviar no canal
await message.channel.send('Mensagem normal no canal');

// Responder mencionando o autor
await message.channel.send(`${message.author}, você foi mencionado!`);
```

---

## Trabalhando com Servidores (Guilds)

Servidores no Fluxer são chamados de "Guilds". Aqui está como interagir com eles:

```javascript
// Quando o bot entrar em um novo servidor
client.on(GatewayDispatchEvents.GuildCreate, (guild) => {
  console.log(`✅ Entrei no servidor: ${guild.name}`);
  console.log(`👥 Membros: ${guild.memberCount}`);
});

// Buscar um servidor específico
const guild = await client.guilds.fetch('ID_DO_SERVIDOR');
console.log(guild.name);

// Listar todos os canais do servidor
const channels = await guild.channels.fetch();
for (const [id, channel] of channels) {
  console.log(`${channel.name} (${channel.type})`);
}
```

### Informações do Servidor

```javascript
const guild = await client.guilds.fetch('ID_DO_SERVIDOR');

// Dados básicos
console.log(`Nome: ${guild.name}`);
console.log(`Dono: ${guild.ownerId}`);
console.log(`Criado em: ${guild.createdAt.toLocaleDateString()}`);

// URLs de imagens
console.log(`Ícone: ${guild.iconURL()}`);
console.log(`Banner: ${guild.bannerURL({ size: 1024 })}`);
```

---

## Canais

Canais são onde as conversas acontecem. O Wave.js suporta todos os tipos de canais do Fluxer:

### Tipos de Canais

```javascript
const { ChannelType } = require('wave.js');

// Texto
ChannelType.GUILD_TEXT        // Canal de texto normal
ChannelType.GUILD_ANNOUNCEMENT // Canal de anúncios

// Voz
ChannelType.GUILD_VOICE       // Canal de voz
ChannelType.GUILD_STAGE_VOICE // Palco

// Threads
ChannelType.PUBLIC_THREAD     // Thread pública
ChannelType.PRIVATE_THREAD    // Thread privada
ChannelType.ANNOUNCEMENT_THREAD // Thread de anúncio

// Outros
ChannelType.GUILD_CATEGORY    // Categoria
ChannelType.GUILD_FORUM       // Fórum
ChannelType.GUILD_MEDIA       // Mídia
```

### Enviando Mensagens em Canais

```javascript
// Buscar um canal
const channel = await client.channels.fetch('ID_DO_CANAL');

// Enviar mensagem simples
await channel.send('Olá, canal!');

// Enviar com opções
await channel.send({
  content: 'Mensagem com embed',
  embeds: [embed],
  components: [row]
});

// Indicar que está digitando
await channel.sendTyping();
```

### Criando Canais

```javascript
const guild = await client.guilds.fetch('ID_DO_SERVIDOR');

// Criar canal de texto
const textChannel = await guild.channels.create({
  name: 'novo-canal',
  type: ChannelType.GUILD_TEXT,
  topic: 'Descrição do canal',
  parent: 'ID_DA_CATEGORIA' // Opcional: colocar em uma categoria
});

// Criar canal de voz
const voiceChannel = await guild.channels.create({
  name: 'Sala de Voz',
  type: ChannelType.GUILD_VOICE,
  userLimit: 10
});
```

---

## Membros e Usuários

### Informações de Usuários

```javascript
// Buscar um usuário
const user = await client.users.fetch('ID_DO_USUARIO');

console.log(`Nome: ${user.username}`);
console.log(`Display: ${user.displayName}`);
console.log(`Avatar: ${user.avatarURL({ size: 256 })}`);
console.log(`Banner: ${user.bannerURL()}`);
console.log(`Conta criada: ${user.createdAt}`);
```

### Membros em Servidores

```javascript
const guild = await client.guilds.fetch('ID_DO_SERVIDOR');
const member = await guild.members.fetch('ID_DO_USUARIO');

// Dados do membro
console.log(`Apelido: ${member.nickname || 'Nenhum'}`);
console.log(`Entrou em: ${member.joinedAt}`);
console.log(`É administrador? ${member.permissions.has('Administrator')}`);

// Cargos
console.log('Cargos:', member.roles.cache.map(r => r.name));
```

### Enviando DM (Mensagem Direta)

```javascript
const user = await client.users.fetch('ID_DO_USUARIO');

// Criar DM
const dmChannel = await user.createDM();
await dmChannel.send('Oi! Esta é uma mensagem direta 😉');

// Ou direto
await user.send('Mensagem rápida!');
```

---

## Embeds - Mensagens Ricas

Embeds são aquelas mensagens bonitas com título, descrição, campos, imagens, etc.

```javascript
const { EmbedBuilder, Colors } = require('wave.js');

const embed = new EmbedBuilder()
  .setTitle('🎉 Bem-vindo!')
  .setDescription('Esta é uma mensagem embed bem legal')
  .setColor(Colors.Blue)
  .addFields(
    { name: '📝 Campo 1', value: 'Valor do campo 1', inline: true },
    { name: '📊 Campo 2', value: 'Valor do campo 2', inline: true },
    { name: '🎯 Campo 3', value: 'Valor do campo 3 (não inline)' }
  )
  .setImage('https://exemplo.com/imagem.png')
  .setThumbnail('https://exemplo.com/icone.png')
  .setFooter({ 
    text: 'Rodapé da mensagem', 
    iconURL: 'https://exemplo.com/footer.png' 
  })
  .setTimestamp();

await channel.send({ embeds: [embed] });
```

### Cores Disponíveis

```javascript
const { Colors } = require('wave.js');

Colors.Default    // Cinza
Colors.Aqua       // Aqua
Colors.Green      // Verde
Colors.Blue       // Azul
Colors.Purple     // Roxo
Colors.Gold       // Dourado
Colors.Orange     // Laranja
Colors.Red        // Vermelho
Colors.Grey       // Cinza
Colors.DarkerGrey // Cinza escuro
Colors.Navy       // Azul marinho
Colors.DarkAqua   // Aqua escuro
Colors.DarkGreen  // Verde escuro
Colors.DarkBlue   // Azul escuro
Colors.DarkPurple // Roxo escuro
Colors.DarkGold   // Dourado escuro
Colors.DarkOrange // Laranja escuro
Colors.DarkRed    // Vermelho escuro
Colors.DarkGrey   // Cinza escuro
```

---

## Botões e Componentes

Adicione interatividade às suas mensagens com botões e menus:

### Botões

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('wave.js');

// Criar botões
const button1 = new ButtonBuilder()
  .setCustomId('btn_1')
  .setLabel('Clique aqui!')
  .setStyle(ButtonStyle.Primary)
  .setEmoji('👆');

const button2 = new ButtonBuilder()
  .setCustomId('btn_2')
  .setLabel('Link externo')
  .setStyle(ButtonStyle.Link)
  .setURL('https://fluxer.app');

// Organizar em uma linha
const row = new ActionRowBuilder().addComponents(button1, button2);

// Enviar
await channel.send({
  content: 'Escolha uma opção:',
  components: [row]
});
```

### Menus de Seleção

```javascript
const { ActionRowBuilder, SelectMenuBuilder } = require('wave.js');

const menu = new SelectMenuBuilder()
  .setCustomId('select_color')
  .setPlaceholder('Escolha uma cor')
  .addOptions(
    {
      label: 'Vermelho',
      description: 'A cor do fogo',
      value: 'red',
      emoji: '🔴'
    },
    {
      label: 'Azul',
      description: 'A cor do oceano',
      value: 'blue',
      emoji: '🔵'
    },
    {
      label: 'Verde',
      description: 'A cor da natureza',
      value: 'green',
      emoji: '🟢'
    }
  );

const row = new ActionRowBuilder().addComponents(menu);

await channel.send({
  content: 'Qual sua cor favorita?',
  components: [row]
});
```

### Recebendo Interações

```javascript
const { GatewayDispatchEvents, InteractionType } = require('wave.js');

client.on(GatewayDispatchEvents.InteractionCreate, async (interaction) => {
  // Botões e menus
  if (interaction.type === InteractionType.MessageComponent) {
    const customId = interaction.data.custom_id;
    
    if (customId === 'btn_1') {
      await interaction.reply({
        content: 'Você clicou no botão! 🎉',
        ephemeral: true // Só o usuário vê
      });
    }
    
    if (customId === 'select_color') {
      const selected = interaction.data.values[0];
      await interaction.reply(`Você escolheu: ${selected}`);
    }
  }
});
```

---

## Reações

Adicione reações às mensagens para interação rápida:

```javascript
// Reagir com emoji padrão
await message.react('👍');
await message.react('❤️');

// Reagir com emoji customizado
await message.react('emoji_id_aqui');

// Remover reação do bot
await message.removeReaction('👍');

// Remover reação de um usuário específico
await message.removeReaction('👍', 'ID_DO_USUARIO');

// Limpar todas as reações
await message.clearReactions();
```

### Eventos de Reação

```javascript
client.on(GatewayDispatchEvents.MessageReactionAdd, (reaction, user) => {
  console.log(`${user.username} reagiu com ${reaction.emoji.name}`);
});

client.on(GatewayDispatchEvents.MessageReactionRemove, (reaction, user) => {
  console.log(`${user.username} removeu a reação ${reaction.emoji.name}`);
});
```

---

## Webhooks

Webhooks permitem enviar mensagens em canais sem usar um bot:

```javascript
// Criar um webhook
const webhook = await channel.createWebhook({
  name: 'Meu Webhook',
  avatar: 'https://exemplo.com/avatar.png'
});

// Enviar mensagem pelo webhook
await webhook.send('Mensagem via webhook!');

// Com embed
await webhook.send({
  content: 'Mensagem rica',
  embeds: [embed],
  username: 'Nome Customizado',
  avatarURL: 'https://exemplo.com/outro-avatar.png'
});

// Executar webhook (sem precisar do objeto)
await client.webhooks.execute(webhook.id, webhook.token, {
  content: 'Executando webhook diretamente!'
});
```

### Webhooks do GitHub e Slack

```javascript
// Formato GitHub
await client.webhooks.executeGithub(webhook.id, webhook.token, {
  repository: { full_name: 'usuario/repo' },
  commits: [...]
});

// Formato Slack
await client.webhooks.executeSlack(webhook.id, webhook.token, {
  text: 'Mensagem no formato Slack'
});
```

---

## Convites (Invites)

Gerencie convites para servidores:

```javascript
// Criar convite
const invite = await channel.createInvite({
  maxAge: 86400,     // Duração em segundos (0 = infinito)
  maxUses: 10,       // Máximo de usos (0 = ilimitado)
  temporary: false,  // Membros temporários?
  unique: true       // Criar único?
});

console.log(`Convite criado: https://fluxer.app/invite/${invite.code}`);

// Aceitar convite
await client.invites.accept('CODIGO_DO_CONVITE');

// Buscar informações do convite
const inviteInfo = await client.invites.fetch('CODIGO_DO_CONVITE');
console.log(`Servidor: ${inviteInfo.guild.name}`);
console.log(`Criado por: ${inviteInfo.inviter?.username}`);

// Listar convites do servidor
const invites = await guild.fetchInvites();

// Deletar convite
await invite.delete();
```

---

## Amizades (Relationships)

Gerencie relacionamentos entre usuários:

```javascript
// Enviar pedido de amizade
await client.relationships.add('ID_DO_USUARIO');

// Ou por username#discriminator
await client.relationships.addByTag('usuario', '1234');

// Aceitar pedido
await client.relationships.accept('ID_DO_USUARIO');

// Bloquear usuário
await client.relationships.block('ID_DO_USUARIO');

// Desbloquear
await client.relationships.unblock('ID_DO_USUARIO');

// Remover amigo
await client.relationships.remove('ID_DO_USUARIO');

// Definir apelido
await client.relationships.updateNickname('ID_DO_USUARIO', 'Meu Amigo');

// Listar todos os relacionamentos
const relationships = await client.relationships.fetch();
for (const rel of relationships) {
  console.log(`${rel.user.username}: ${rel.type}`);
}
```

### Tipos de Relacionamento

```javascript
const { RelationshipType } = require('wave.js');

RelationshipType.None            // 0 - Sem relacionamento
RelationshipType.Friend          // 1 - Amigo
RelationshipType.Blocked         // 2 - Bloqueado
RelationshipType.PendingIncoming // 3 - Pedido recebido
RelationshipType.PendingOutgoing // 4 - Pedido enviado
```

---

## Presença e Status

Configure o status do seu bot:

```javascript
// Definir presença ao conectar
const client = new Client({
  token: 'SEU_TOKEN',
  presence: {
    status: 'online', // online, idle, dnd, invisible
    activities: [{
      name: 'com os usuários',
      type: 0 // 0: Game, 1: Streaming, 2: Listening, 3: Watching, 4: Custom, 5: Competing
    }]
  }
});

// Ou mudar depois de conectado
await client.user.setPresence({
  status: 'dnd',
  activities: [{
    name: 'comandos',
    type: 2 // Listening
  }]
});
```

### Tipos de Atividade

```javascript
0 // Game - "Jogando {name}"
1 // Streaming - "Transmitindo {name}"
2 // Listening - "Ouvindo {name}"
3 // Watching - "Assistindo {name}"
4 // Custom - "{name}"
5 // Competing - "Competindo em {name}"
```

---

## Utilitários

### Snowflakes

IDs no Fluxer são Snowflakes que codificam timestamp:

```javascript
const { SnowflakeUtil } = require('wave.js');

const id = '123456789012345678';

// Extrair timestamp
const timestamp = SnowflakeUtil.timestampFrom(id);
console.log(`Timestamp: ${timestamp}`);

// Converter para data
const date = SnowflakeUtil.dateFrom(id);
console.log(`Criado em: ${date.toISOString()}`);

// Criar snowflake de um timestamp
const snowflake = SnowflakeUtil.fromTimestamp(Date.now());
```

### CDN - URLs de Imagens

```javascript
const { 
  avatarURL, 
  guildIconURL, 
  guildBannerURL,
  emojiURL 
} = require('wave.js');

// Avatar de usuário
const avatar = avatarURL(userId, avatarHash, { 
  size: 256, 
  format: 'png',
  animated: true 
});

// Ícone de servidor
const icon = guildIconURL(guildId, iconHash, { size: 512 });

// Banner de servidor
const banner = guildBannerURL(guildId, bannerHash, { size: 1024 });

// Emoji
const emoji = emojiURL(emojiId, { size: 64 });
```

### Tamanhos de Imagem Válidos

```
16, 20, 22, 24, 28, 32, 40, 44, 48, 56, 60, 64, 
80, 96, 100, 128, 160, 240, 256, 300, 320, 480, 
512, 600, 640, 1024, 1280, 1536, 2048, 3072, 4096
```

### Permissões

```javascript
const { Permissions } = require('wave.js');

// Verificar permissões
const member = await guild.members.fetch('ID_DO_USUARIO');

if (member.permissions.has('Administrator')) {
  console.log('É admin!');
}

if (member.permissions.has(['SendMessages', 'EmbedLinks'])) {
  console.log('Pode enviar mensagens e embeds');
}

// Calcular permissões em um canal
const permissions = channel.permissionsFor(member);
console.log(permissions.toArray());
```

---

## Tratamento de Erros

O Wave.js tem tipos específicos de erros para facilitar o tratamento:

```javascript
const { 
  FluxerAPIError, 
  FluxerRateLimitError, 
  FluxerGatewayError 
} = require('wave.js');

try {
  await channel.send('Mensagem');
} catch (error) {
  if (error instanceof FluxerRateLimitError) {
    console.log(`Rate limit! Tente novamente em ${error.retryAfter}ms`);
    
    // Aguardar e tentar novamente
    await new Promise(resolve => setTimeout(resolve, error.retryAfter));
    await channel.send('Mensagem');
  }
  
  if (error instanceof FluxerAPIError) {
    console.log(`Erro da API: ${error.code} - ${error.message}`);
  }
  
  if (error instanceof FluxerGatewayError) {
    console.log(`Erro do Gateway: ${error.code}`);
  }
}
```

---

## Sharding

Para bots grandes que precisam de múltiplas conexões:

```javascript
const { ShardingManager } = require('wave.js');

const manager = new ShardingManager('./bot.js', {
  token: 'SEU_TOKEN',
  totalShards: 'auto', // ou número específico
  shardList: 'auto'
});

manager.on('shardCreate', shard => {
  console.log(`Shard ${shard.id} criado`);
});

manager.spawn();
```

### No arquivo do bot (bot.js):

```javascript
const { Client, ShardClientUtil } = require('wave.js');

const client = new Client({ token: process.env.BOT_TOKEN });
const shardClient = ShardClientUtil.singleton(client);

client.on('ready', () => {
  console.log(`Shard ${shardClient.ids.join(', ')} pronto!`);
  console.log(`Total de shards: ${shardClient.count}`);
});

client.connect();
```

---

## Exemplos Completos

### Bot de Moderação Simples

```javascript
const { Client, GatewayDispatchEvents, Permissions } = require('wave.js');

const client = new Client({ token: 'SEU_TOKEN' });

client.on(GatewayDispatchEvents.MessageCreate, async (message) => {
  if (message.author.bot) return;
  
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();
  
  // !kick @usuario
  if (command === '!kick') {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply('❌ Você não tem permissão!');
    }
    
    const target = message.mentions.members.first();
    if (!target) return message.reply('Mencione um usuário!');
    
    await target.kick('Motivo: Comando !kick');
    await message.channel.send(`👢 ${target.user.username} foi expulso!`);
  }
  
  // !ban @usuario [dias]
  if (command === '!ban') {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ Você não tem permissão!');
    }
    
    const target = message.mentions.members.first();
    const days = parseInt(args[2]) || 0;
    
    await target.ban({ deleteMessageDays: days });
    await message.channel.send(`🔨 ${target.user.username} foi banido!`);
  }
  
  // !clear [quantidade]
  if (command === '!clear') {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply('❌ Sem permissão!');
    }
    
    const amount = parseInt(args[1]) || 10;
    const messages = await message.channel.messages.fetch({ limit: amount });
    await message.channel.bulkDelete(messages);
    
    const msg = await message.channel.send(`🗑️ ${messages.size} mensagens apagadas!`);
    setTimeout(() => msg.delete(), 5000);
  }
});

client.connect();
```

### Sistema de Tickets

```javascript
const { 
  Client, 
  GatewayDispatchEvents, 
  ActionRowBuilder, 
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require('wave.js');

const client = new Client({ token: 'SEU_TOKEN' });

// Enviar painel de tickets
client.on(GatewayDispatchEvents.MessageCreate, async (message) => {
  if (message.content === '!ticket-panel') {
    const embed = new EmbedBuilder()
      .setTitle('🎫 Sistema de Tickets')
      .setDescription('Clique no botão abaixo para abrir um ticket!')
      .setColor(Colors.Blue);
    
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫')
    );
    
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// Criar canal de ticket
client.on(GatewayDispatchEvents.InteractionCreate, async (interaction) => {
  if (interaction.data?.custom_id === 'open_ticket') {
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Criar canal
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GUILD_TEXT,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });
    
    await ticketChannel.send(`🎫 Ticket criado por ${user}!`);
    
    await interaction.reply({
      content: `Ticket criado em ${ticketChannel}!`,
      ephemeral: true
    });
  }
});

client.connect();
```

---

## Configurações Avançadas

### Opções do Client

```javascript
const client = new Client({
  token: 'SEU_TOKEN',
  
  // Gateway
  intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
  
  // Cache
  messageCacheMaxSize: 1000,
  messageCacheLifetime: 300000, // 5 minutos
  messageSweepInterval: 60000,  // Verificar a cada 1 minuto
  
  // REST
  restRequestTimeout: 15000,
  restGlobalRateLimit: 50,
  
  // Sharding
  shards: [0, 1, 2], // Shards específicos
  shardCount: 3,
  
  // Presença inicial
  presence: {
    status: 'online',
    activities: [{ name: 'seus comandos', type: 2 }]
  },
  
  // Falhas
  failIfNotExists: false,
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  }
});
```

---

## Eventos Disponíveis

Aqui está a lista completa de eventos que você pode escutar:

### Eventos de Conexão
- `ready` - Bot conectado e pronto
- `shardReady` - Shard específico pronto
- `shardDisconnect` - Shard desconectado
- `shardReconnecting` - Shard reconectando

### Eventos de Mensagens
- `messageCreate` - Nova mensagem
- `messageUpdate` - Mensagem editada
- `messageDelete` - Mensagem deletada
- `messageDeleteBulk` - Múltiplas mensagens deletadas
- `messageReactionAdd` - Reação adicionada
- `messageReactionRemove` - Reação removida

### Eventos de Servidores
- `guildCreate` - Entrou em um servidor
- `guildUpdate` - Servidor atualizado
- `guildDelete` - Saiu de um servidor
- `guildMemberAdd` - Novo membro
- `guildMemberUpdate` - Membro atualizado
- `guildMemberRemove` - Membro saiu
- `guildBanAdd` - Usuário banido
- `guildBanRemove` - Usuário desbanido

### Eventos de Canais
- `channelCreate` - Canal criado
- `channelUpdate` - Canal atualizado
- `channelDelete` - Canal deletado

### Eventos de Voz
- `voiceStateUpdate` - Estado de voz atualizado
- `voiceServerUpdate` - Servidor de voz atualizado

### Eventos de Presença
- `presenceUpdate` - Presença de usuário mudou
- `typingStart` - Usuário começou a digitar

---

## Dúvidas Frequentes

**Q: Preciso de intents?**
R: No momento o Fluxer não usa o sistema de intents do Discord, mas você pode deixar como `0` ou não passar nada.

**Q: Como obter um token de bot?**
R: Acesse o Portal de Desenvolvedores do Fluxer, crie uma aplicação e gere um token de bot.

**Q: Posso usar com ESM?**
R: Sim! O Wave.js suporta tanto CommonJS quanto ESM:
```javascript
import { Client } from 'wave.js';
```

**Q: O SDK funciona em browsers?**
R: Algumas funcionalidades podem ter limitações devido ao CORS. É recomendado usar em Node.js.

---

## Suporte

- **Documentação da API**: https://docs.fluxer.app
- **Servidor de Suporte**: https://discord.gg/fluxer
- **Issues**: https://github.com/fluxerapp/wave.js/issues

---

## Licença

MIT © Fluxer

---

Feito com 💙 para a comunidade Fluxer.
