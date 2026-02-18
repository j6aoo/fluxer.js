import { ComponentType, MessageComponent, SelectOption } from '../types';
import { SelectMenuOptionBuilder } from './SelectMenuOptionBuilder';

export class SelectMenuBuilder {
    private data: Partial<MessageComponent> = { 
        type: ComponentType.StringSelect,
        options: []
    };

    constructor(data?: Partial<MessageComponent>) {
        if (data) this.data = { ...this.data, ...data };
    }

    setCustomId(customId: string): this {
        if (customId.length > 100) throw new Error('SelectMenu customId must be at most 100 characters.');
        this.data.custom_id = customId;
        return this;
    }

    setPlaceholder(placeholder: string): this {
        this.data.placeholder = placeholder;
        return this;
    }

    setMinValues(min: number): this {
        this.data.min_values = min;
        return this;
    }

    setMaxValues(max: number): this {
        this.data.max_values = max;
        return this;
    }

    setDisabled(disabled: boolean = true): this {
        this.data.disabled = disabled;
        return this;
    }

    addOptions(...options: (SelectOption | SelectMenuOptionBuilder)[]): this {
        const resolved = options.map(o => o instanceof SelectMenuOptionBuilder ? o.toJSON() : o);
        if ((this.data.options!.length + resolved.length) > 25) {
            throw new Error('SelectMenu cannot have more than 25 options.');
        }
        this.data.options!.push(...resolved);
        return this;
    }

    setOptions(...options: (SelectOption | SelectMenuOptionBuilder)[]): this {
        const resolved = options.map(o => o instanceof SelectMenuOptionBuilder ? o.toJSON() : o);
        if (resolved.length > 25) {
            throw new Error('SelectMenu cannot have more than 25 options.');
        }
        this.data.options = resolved;
        return this;
    }

    spliceOptions(index: number, deleteCount: number, ...options: (SelectOption | SelectMenuOptionBuilder)[]): this {
        const resolved = options.map(o => o instanceof SelectMenuOptionBuilder ? o.toJSON() : o);
        this.data.options!.splice(index, deleteCount, ...resolved);
        if (this.data.options!.length > 25) {
            throw new Error('SelectMenu cannot have more than 25 options.');
        }
        return this;
    }

    toJSON(): MessageComponent {
        if (!this.data.custom_id) throw new Error('SelectMenu must have a customId.');
        return { ...this.data } as MessageComponent;
    }
}
