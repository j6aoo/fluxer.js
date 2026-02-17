import type { Client } from '../client';
import { User } from '../structures/User';
import { Collection } from '../collections/Collection';
import { User as UserData } from '../types';

export class UserManager {
    public readonly client: Client;
    public readonly cache: Collection<string, User>;

    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection();
    }

    /** Fetch a user by ID */
    async fetch(userId: string, force = false): Promise<User> {
        if (!force) {
            const cached = this.cache.get(userId);
            if (cached) return cached;
        }

        const data = await this.client.rest.get<UserData>(`/users/${userId}`);
        const user = new User(this.client, data);
        this.cache.set(user.id, user);
        return user;
    }

    /** Add or update a user in cache */
    _add(data: UserData): User {
        const existing = this.cache.get(data.id);
        if (existing) {
            // Update existing user properties
            existing.username = data.username;
            existing.discriminator = data.discriminator;
            existing.avatar = data.avatar || null;
            existing.bot = !!data.bot;
            return existing;
        }
        const user = new User(this.client, data);
        this.cache.set(user.id, user);
        return user;
    }

    /** Remove a user from cache */
    _remove(userId: string): void {
        this.cache.delete(userId);
    }
}
