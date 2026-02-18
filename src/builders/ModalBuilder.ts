import { ActionRowBuilder } from './ActionRowBuilder';

export interface ModalData {
    custom_id: string;
    title: string;
    components: any[];
}

export class ModalBuilder {
    private data: Partial<ModalData> = {
        components: []
    };

    constructor(data?: Partial<ModalData>) {
        if (data) this.data = { ...this.data, ...data };
    }

    setCustomId(customId: string): this {
        this.data.custom_id = customId;
        return this;
    }

    setTitle(title: string): this {
        this.data.title = title;
        return this;
    }

    addComponents(...components: ActionRowBuilder[]): this {
        if ((this.data.components!.length + components.length) > 5) {
            throw new Error('Modal cannot have more than 5 ActionRows.');
        }
        this.data.components!.push(...components);
        return this;
    }

    setComponents(...components: ActionRowBuilder[]): this {
        if (components.length > 5) {
            throw new Error('Modal cannot have more than 5 ActionRows.');
        }
        this.data.components = components;
        return this;
    }

    toJSON(): ModalData {
        if (!this.data.custom_id) throw new Error('Modal must have a customId.');
        if (!this.data.title) throw new Error('Modal must have a title.');
        
        return {
            ...this.data,
            components: this.data.components!.map(c => c instanceof ActionRowBuilder ? c.toJSON() : c)
        } as ModalData;
    }
}
