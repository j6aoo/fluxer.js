const { Client, ActionRow, Button, ButtonStyle, SelectMenu } = require('fluxer.js-sdk');

const client = new Client({ token: 'YOUR_BOT_TOKEN' });

client.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        const row = new ActionRow()
            .addComponents(
                new Button()
                    .setCustomId('primary_btn')
                    .setLabel('Clique Aqui')
                    .setStyle(ButtonStyle.PRIMARY),
                new Button()
                    .setLabel('Fluxer Website')
                    .setURL('https://fluxer.app')
                    .setStyle(ButtonStyle.LINK)
            );

        const menuRow = new ActionRow()
            .addComponents(
                new SelectMenu()
                    .setCustomId('select_option')
                    .setPlaceholder('Escolha uma cor')
                    .addOptions([
                        { label: 'Vermelho', value: 'red' },
                        { label: 'Azul', value: 'blue' }
                    ])
            );

        await message.reply({
            content: 'Aqui estão alguns componentes:',
            components: [row, menuRow]
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'primary_btn') {
        await interaction.reply('Você clicou no botão!');
    }
    
    if (interaction.isSelectMenu() && interaction.customId === 'select_option') {
        await interaction.update({ content: `Você selecionou: ${interaction.values[0]}`, components: [] });
    }
});

client.login();
