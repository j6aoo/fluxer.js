import { ComponentType, MessageComponent, TextInputStyle } from '../types';

export class TextInputBuilder {
    private data: Partial<MessageComponent> = { type: ComponentType.TextInput };

    constructor(data?: Partial<MessageComponent>) {
        if (data) this.data = { ...this.data, ...data };
    }

    setCustomId(customId: string): this {
        this.data.custom_id = customId;
        return this;
    }

    setLabel(label: string): this {
        this.data.label = label;
        return this;
    }

    setStyle(style: TextInputStyle): this {
        this.data.style = style;
        return this;
    }

    setPlaceholder(placeholder: string): this {
        this.data.placeholder = placeholder;
        return this;
    }

    setValue(value: string): this {
        this.data.value = value;
        return this;
    }

    setMinLength(min: number): this {
        this.data.min_length = min;
        return this;
    }

    setMaxLength(max: number): this {
        this.data.max_length = max;
        return this;
    }

    setRequired(required: boolean = true): this {
        this.data.required = required;
        return this;
    }

    toJSON(): MessageComponent {
        if (!this.data.custom_id) throw new Error('TextInput must have a customId.');
        if (!this.data.label) throw new Error('TextInput must have a label.');
        return { ...this.data } as MessageComponent;
    }
}
