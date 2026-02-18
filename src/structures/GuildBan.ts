import { Base } from './Base';
import type { Client } from '../client';
import type { Guild } from './Guild';
import type { User as UserData, GuildBan as GuildBanData } from '../types';
import { User } from './User';

export class GuildBan extends Base {
    public readonly guild: Guild;
    public user: User;
    public reason: string | null;

    constructor(client: Client, data: GuildBanData, guild: Guild) {
        super(client);
        this.guild = guild;
        this.user = new User(client, data.user);
        this.reason = data.reason;
    }

    /**
     * Whether this ban is partial (has complete user data or just ID)
     * In this implementation, User structure is always instantiated with data.user
     */
    get partial(): boolean {
        return !this.user.username;
    }

    _patch(data: GuildBanData): void {
        if (data.user) this.user = new User(this.client, data.user);
        if (data.reason !== undefined) this.reason = data.reason;
    }

    toString(): string {
        return `${this.user.username}#${this.user.discriminator} (ID: ${this.user.id})`;
    }
}
