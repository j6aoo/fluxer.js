import { ButtonStyle, ComponentType, Emoji, MessageComponent } from '../types';

export class ButtonBuilder {
    private data: Partial<MessageComponent> = { type: ComponentType.Button };

    constructor(data?: Partial<MessageComponent>) {
        if (data) this.data = { ...this.data, ...data };
    }

    setCustomId(customId: string): this {
        if (customId.length > 100) throw new Error('Button customId must be at most 100 characters.');
        this.data.custom_id = customId;
        return this;
    }

    setLabel(label: string): this {
        if (label.length > 80) throw new Error('Button label must be at most 80 characters.');
        this.data.label = label;
        return this;
    }

    setStyle(style: ButtonStyle): this {
        this.data.style = style;
        return this;
    }

    setEmoji(emoji: Emoji): this {
        this.data.emoji = emoji;
        return this;
    }

    setURL(url: string): this {
        this.data.url = url;
        return this;
    }

    setDisabled(disabled: boolean = true): this {
        this.data.disabled = disabled;
        return this;
    }

    toJSON(): MessageComponent {
        if (this.data.style !== ButtonStyle.Link && !this.data.custom_id) {
            throw new Error('Non-link buttons must have a customId.');
        }
        if (this.data.style === ButtonStyle.Link && !this.data.url) {
            throw new Error('Link buttons must have a URL.');
        }
        return { ...this.data } as MessageComponent;
    }

    static from(data: MessageComponent): ButtonBuilder {
        return new ButtonBuilder(data);
    }
}
