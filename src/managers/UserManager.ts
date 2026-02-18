import { User } from '../structures/User';
import { DataManager } from './DataManager';
import { User as UserData } from '../types';

export class UserManager extends DataManager<string, User, string> {
    protected _holds = User;

    /** Fetch a user by ID */
    async fetch(userId: string, force = false): Promise<User> {
        if (!force) {
            const cached = this.cache.get(userId);
            if (cached) return cached;
        }

        const data = await this.client.rest.get<UserData>(`/users/${userId}`);
        return this._add(data);
    }

    /** Add or update a user in cache */
    _add(data: UserData, cache = true): User {
        const existing = this.cache.get(data.id);
        if (existing) {
            // Update existing user properties
            existing.username = data.username;
            existing.discriminator = data.discriminator;
            existing.avatar = data.avatar || null;
            existing.bot = !!data.bot;
            existing.banner = data.banner || null;
            existing.flags = data.flags || 0;
            existing.globalName = (data as any).global_name || null;
            existing.system = !!data.system;
            existing.accentColor = (data as any).accent_color || null;
            return existing;
        }
        return super._add(data, cache);
    }
}
