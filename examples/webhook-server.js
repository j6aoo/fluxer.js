const { WebhookClient } = require('fluxer.js-sdk');
const express = require('express');

const app = express();
app.use(express.json());

const webhook = new WebhookClient({
    publicKey: 'YOUR_APPLICATION_PUBLIC_KEY',
    token: 'YOUR_BOT_TOKEN'
});

app.post('/interactions', async (req, res) => {
    try {
        // Valida e processa a interação vinda do Fluxer
        const interaction = await webhook.handleInteraction(req.body, req.headers['x-signature-ed25519'], req.headers['x-signature-timestamp']);
        
        if (interaction.isCommand() && interaction.commandName === 'hello') {
            return res.json({
                type: 4, // InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
                data: { content: 'Olá via Webhook!' }
            });
        }
    } catch (err) {
        console.error('Erro na assinatura do webhook:', err);
        return res.status(401).send('Invalid signature');
    }
});

app.listen(3000, () => {
    console.log('Webhook server rodando na porta 3000');
});
