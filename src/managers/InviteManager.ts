import { BaseManager } from './BaseManager';
import { Invite } from '../structures/Invite';
import type { Client } from '../client';
import type { InviteData } from '../types';

export interface InviteCreateOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
    targetType?: number;
    targetUserId?: string;
    targetApplicationId?: string;
}

export class InviteManager extends BaseManager {
    constructor(client: Client) {
        super(client);
    }

    async fetch(code: string): Promise<Invite> {
        const data = await this.client.rest.get<InviteData>(`/invites/${code}`, {
            with_counts: true,
            with_expiration: true,
        });
        return new Invite(this.client, data);
    }

    async accept(code: string): Promise<Invite> {
        const data = await this.client.rest.post<InviteData>(`/invites/${code}`);
        return new Invite(this.client, data);
    }

    async delete(code: string): Promise<void> {
        await this.client.rest.delete(`/invites/${code}`);
    }

    async create(channelId: string, options: InviteCreateOptions = {}): Promise<Invite> {
        const body = {
            max_age: options.maxAge,
            max_uses: options.maxUses,
            temporary: options.temporary,
            unique: options.unique,
            target_type: options.targetType,
            target_user_id: options.targetUserId,
            target_application_id: options.targetApplicationId,
        };

        const data = await this.client.rest.post<InviteData>(`/channels/${channelId}/invites`, body);
        return new Invite(this.client, data);
    }

    async listGuildInvites(guildId: string): Promise<Invite[]> {
        const data = await this.client.rest.get<InviteData[]>(`/guilds/${guildId}/invites`);
        return data.map(invite => new Invite(this.client, invite));
    }

    async listChannelInvites(channelId: string): Promise<Invite[]> {
        const data = await this.client.rest.get<InviteData[]>(`/channels/${channelId}/invites`);
        return data.map(invite => new Invite(this.client, invite));
    }
}
