import type { Client } from '../client';
import { Guild } from '../structures/Guild';
import { Collection } from '../collections/Collection';
import { Guild as GuildData } from '../types';

export class GuildManager {
    public readonly client: Client;
    public readonly cache: Collection<string, Guild>;

    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection();
    }

    /** Fetch a guild by ID */
    async fetch(guildId: string, force = false): Promise<Guild> {
        if (!force) {
            const cached = this.cache.get(guildId);
            if (cached) return cached;
        }

        const data = await this.client.rest.get<GuildData>(`/guilds/${guildId}`);
        const guild = new Guild(this.client, data);
        this.cache.set(guild.id, guild);
        return guild;
    }

    /** Create a new guild */
    async create(data: { name: string; icon?: string }): Promise<Guild> {
        const guildData = await this.client.rest.post<GuildData>('/guilds', data);
        const guild = new Guild(this.client, guildData);
        this.cache.set(guild.id, guild);
        return guild;
    }

    /** Leave a guild */
    async leave(guildId: string): Promise<void> {
        await this.client.rest.delete(`/users/@me/guilds/${guildId}`);
        this.cache.delete(guildId);
    }

    /** Add or update a guild in cache */
    _add(data: GuildData): Guild {
        const guild = new Guild(this.client, data);
        this.cache.set(guild.id, guild);
        return guild;
    }

    /** Remove a guild from cache */
    _remove(guildId: string): void {
        this.cache.delete(guildId);
    }
}
