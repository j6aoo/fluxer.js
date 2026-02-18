import { Guild } from '../structures/Guild';
import { DataManager } from './DataManager';
import { Guild as GuildData } from '../types';
import { PaginatedManager, PaginatedFetchOptions } from '../structures/Managers/PaginatedManager';
import { Collection } from '../collections/Collection';

export class GuildManager extends PaginatedManager<string, Guild, string> {
    protected _holds = Guild;

    /** Fetch a guild by ID */
    async fetch(guildId: string, force = false): Promise<Guild> {
        if (!force) {
            const cached = this.cache.get(guildId);
            if (cached) return cached;
        }

        const data = await this.client.rest.get<GuildData>(`/guilds/${guildId}`);
        return this._add(data);
    }

    /** Fetch multiple guilds */
    async fetchMany(options: PaginatedFetchOptions = {}): Promise<Collection<string, Guild>> {
        const query: any = {};
        if (options.limit) query.limit = options.limit;
        if (options.before) query.before = options.before;
        if (options.after) query.after = options.after;

        const data = await this.client.rest.get<GuildData[]>('/users/@me/guilds', query);
        const guilds = new Collection<string, Guild>();
        for (const guildData of data) {
            const guild = this._add(guildData, options.cache);
            guilds.set(guild.id, guild);
        }
        return guilds;
    }

    /** Create a new guild */
    async create(data: { name: string; icon?: string }): Promise<Guild> {
        const guildData = await this.client.rest.post<GuildData>('/guilds', data);
        return this._add(guildData);
    }

    /** Leave a guild */
    async leave(guildId: string): Promise<void> {
        await this.client.rest.delete(`/users/@me/guilds/${guildId}`);
        this._remove(guildId);
    }

    /** Add or update a guild in cache */
    _add(data: GuildData, cache = true): Guild {
        return super._add(data, cache);
    }
}
