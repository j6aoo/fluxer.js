import { Base } from './Base';
import type { Client } from '../client';
import { User } from './User';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import { Activity } from './Activity';

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';

export interface ClientStatus {
    desktop?: PresenceStatus;
    mobile?: PresenceStatus;
    web?: PresenceStatus;
}

export class Presence extends Base {
    public userId: string;
    public guildId: string;
    public status: PresenceStatus;
    public activities: Activity[];
    public clientStatus: ClientStatus;

    constructor(client: Client, data: any) {
        super(client);
        this.userId = data.user.id;
        this.guildId = data.guild_id;
        this.status = data.status;
        this.activities = data.activities ? data.activities.map((a: any) => new Activity(client, a)) : [];
        this.clientStatus = data.client_status || {};
    }

    get user(): User | null {
        return this.client.users.cache.get(this.userId) || null;
    }

    get guild(): Guild | null {
        return this.client.guilds.cache.get(this.guildId) || null;
    }

    get member(): GuildMember | null {
        return this.guild?.members.cache.get(this.userId) || null;
    }

    /** @internal */
    _patch(data: any): void {
        if (data.status !== undefined) this.status = data.status;
        if (data.activities !== undefined) {
            this.activities = data.activities.map((a: any) => new Activity(this.client, a));
        }
        if (data.client_status !== undefined) this.clientStatus = data.client_status;
    }

    toString(): string {
        return this.status;
    }
}
