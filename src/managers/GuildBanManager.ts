import { DataManager } from './DataManager';
import { GuildBan } from '../structures/GuildBan';
import type { Guild } from '../structures/Guild';
import type { Client } from '../client';
import { Collection } from '../collections/Collection';
import type { Snowflake, GuildBan as GuildBanData } from '../types';

/**
 * Manages bans in a guild
 */
export class GuildBanManager extends DataManager<Snowflake, GuildBan, Snowflake> {
    public readonly guild: Guild;
    protected _holds = GuildBan as unknown as new (client: Client, data: any) => GuildBan;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    /**
     * Fetch ban(s) from the API
     * @param userId The user ID to fetch the ban for
     * @param force Whether to force fetch from API even if in cache
     */
    async fetch(userId?: Snowflake, force = false): Promise<GuildBan | Collection<Snowflake, GuildBan>> {
        if (userId) {
            if (!force) {
                const existing = this.cache.get(userId);
                if (existing) return existing;
            }
            const data = await this.client.rest.get<GuildBanData>(`/guilds/${this.guild.id}/bans/${userId}`);
            return this._add(data, true);
        }

        const data = await this.client.rest.get<GuildBanData[]>(`/guilds/${this.guild.id}/bans`);
        const bans = new Collection<Snowflake, GuildBan>();
        for (const banData of data) {
            const ban = this._add(banData, true);
            bans.set(ban.user.id, ban);
        }
        return bans;
    }

    /**
     * Remove a ban from the guild (unban)
     * @param user The user to unban
     * @param reason The reason for unbanning
     */
    async remove(user: Snowflake | { id: Snowflake }, reason?: string): Promise<void> {
        const id = typeof user === 'string' ? user : user.id;
        await this.client.rest.delete(`/guilds/${this.guild.id}/bans/${id}`, { reason });
        this.cache.delete(id);
    }

    /**
     * Internal method to add/update a ban
     */
    _add(data: any, cache = true): GuildBan {
        const userId = data.user.id;
        const existing = this.cache.get(userId);
        if (existing) {
            if (cache) existing._patch(data);
            return existing;
        }

        const entry = new GuildBan(this.client, data, this.guild);
        if (cache) this.cache.set(userId, entry);
        return entry;
    }
}
