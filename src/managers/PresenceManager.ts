import { DataManager } from './DataManager';
import { Presence } from '../structures/Presence';
import type { Guild } from '../structures/Guild';

export class PresenceManager extends DataManager<string, Presence, typeof Presence> {
    public readonly guild: Guild;
    protected _holds = Presence;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    /**
     * @internal
     */
    _add(data: any, cache = true): Presence {
        return super._add(data, cache, { id: data.user.id });
    }

    /**
     * Fetches a presence for a user
     * @param userId The ID of the user to fetch the presence for
     */
    async fetch(userId?: string): Promise<Presence | any> {
        if (userId) {
            const existing = this.cache.get(userId);
            if (existing) return existing;
            throw new Error('Presence not found in cache.');
        }
        return this.cache;
    }
}
