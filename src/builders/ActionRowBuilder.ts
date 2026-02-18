import { ComponentType, MessageComponent } from '../types';
import { ButtonBuilder } from './ButtonBuilder';
import { SelectMenuBuilder } from './SelectMenuBuilder';

export type ActionRowComponent = ButtonBuilder | SelectMenuBuilder;

export class ActionRowBuilder {
    private components: ActionRowComponent[] = [];

    addComponents(...components: ActionRowComponent[]): this {
        if ((this.components.length + components.length) > 5) {
            throw new Error('ActionRow cannot have more than 5 components.');
        }
        this.components.push(...components);
        return this;
    }

    setComponents(...components: ActionRowComponent[]): this {
        if (components.length > 5) {
            throw new Error('ActionRow cannot have more than 5 components.');
        }
        this.components = components;
        return this;
    }

    toJSON(): MessageComponent {
        return {
            type: ComponentType.ActionRow,
            components: this.components.map(c => c.toJSON())
        };
    }
}
