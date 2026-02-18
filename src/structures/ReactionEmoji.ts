import { Emoji } from '../types';

export class ReactionEmoji {
    public id: string | null;
    public name: string | null;
    public animated: boolean;

    constructor(data: Emoji) {
        this.id = data.id ?? null;
        this.name = data.name ?? null;
        this.animated = data.animated ?? false;
    }

    /**
     * The identifier for the API
     */
    get identifier(): string {
        if (this.id) return `${this.animated ? 'a:' : ''}${this.name}:${this.id}`;
        return encodeURIComponent(this.name!);
    }

    /**
     * The reaction emoji for display
     */
    get reactionEmoji(): string {
        if (this.id) return `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>`;
        return this.name!;
    }

    public toString(): string {
        return this.reactionEmoji;
    }
}
