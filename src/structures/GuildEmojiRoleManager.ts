import { Collection } from '../collections/Collection';
import type { Snowflake } from '../types';
import type { GuildEmoji } from './GuildEmoji';

export class GuildEmojiRoleManager {
    public readonly emoji: GuildEmoji;
    public readonly cache: Collection<Snowflake, Snowflake>;

    constructor(emoji: GuildEmoji) {
        this.emoji = emoji;
        this.cache = new Collection();
    }

    async add(role: Snowflake, reason?: string): Promise<GuildEmoji> {
        const roles = Array.from(this.cache.values());
        if (!roles.includes(role)) {
            roles.push(role);
            await this.set(roles, reason);
            (this.emoji as any)._addRole(role);
        }
        return this.emoji;
    }

    async remove(role: Snowflake, reason?: string): Promise<GuildEmoji> {
        const roles = Array.from(this.cache.values()).filter(r => r !== role);
        if (roles.length !== this.cache.size) {
            await this.set(roles, reason);
            (this.emoji as any)._removeRole(role);
        }
        return this.emoji;
    }

    async set(roles: Snowflake[], reason?: string): Promise<GuildEmoji> {
        return this.emoji.edit({ roles, reason });
    }
}
