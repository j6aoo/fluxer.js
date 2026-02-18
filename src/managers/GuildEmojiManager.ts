import { DataManager } from './DataManager';
import { GuildEmoji } from '../structures/GuildEmoji';
import type { Guild } from '../structures/Guild';
import type { Emoji as EmojiData, Snowflake, GuildEmojiCreateOptions } from '../types';

export class GuildEmojiManager extends DataManager<Snowflake, GuildEmoji, Snowflake | GuildEmoji> {
    public readonly guild: Guild;
    protected _holds = GuildEmoji as any;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    public _add(data: EmojiData, cache = true): GuildEmoji {
        const existing = this.cache.get(data.id!);
        if (existing) {
            existing._patch(data);
            return existing;
        }

        const entry = new (this._holds as any)(this.client, data, this.guild);
        if (cache) this.cache.set(entry.id, entry);
        return entry;
    }

    async fetch(id?: Snowflake, { cache = true, force = false } = {}): Promise<GuildEmoji | GuildEmoji[]> {
        if (id) {
            if (!force) {
                const existing = this.cache.get(id);
                if (existing) return existing;
            }
            const data = await this.client.rest.get<EmojiData>(`/guilds/${this.guild.id}/emojis/${id}`);
            return this._add(data, cache);
        }

        const data = await this.client.rest.get<EmojiData[]>(`/guilds/${this.guild.id}/emojis`);
        const emojis: GuildEmoji[] = [];
        for (const emojiData of data) {
            emojis.push(this._add(emojiData, cache));
        }
        return emojis;
    }

    async create(options: GuildEmojiCreateOptions): Promise<GuildEmoji> {
        const { reason, ...data } = options;
        const emojiData = await this.client.rest.post<EmojiData>(`/guilds/${this.guild.id}/emojis`, data, { reason });
        return this._add(emojiData);
    }

    async delete(emoji: Snowflake | GuildEmoji, reason?: string): Promise<void> {
        const id = emoji instanceof GuildEmoji ? emoji.id : emoji;
        await this.client.rest.delete(`/guilds/${this.guild.id}/emojis/${id}`, { reason });
        this.cache.delete(id);
    }
}
