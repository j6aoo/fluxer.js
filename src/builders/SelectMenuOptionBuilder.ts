import { Emoji, SelectOption } from '../types';

export class SelectMenuOptionBuilder {
    private data: SelectOption;

    constructor(data?: SelectOption) {
        this.data = data ? { ...data } : { label: '', value: '' };
    }

    setLabel(label: string): this {
        if (label.length > 100) throw new Error('SelectMenuOption label must be at most 100 characters.');
        this.data.label = label;
        return this;
    }

    setValue(value: string): this {
        if (value.length > 100) throw new Error('SelectMenuOption value must be at most 100 characters.');
        this.data.value = value;
        return this;
    }

    setDescription(description: string): this {
        if (description.length > 100) throw new Error('SelectMenuOption description must be at most 100 characters.');
        this.data.description = description;
        return this;
    }

    setEmoji(emoji: Emoji): this {
        this.data.emoji = emoji;
        return this;
    }

    setDefault(isDefault: boolean = true): this {
        this.data.default = isDefault;
        return this;
    }

    toJSON(): SelectOption {
        return { ...this.data };
    }
}
