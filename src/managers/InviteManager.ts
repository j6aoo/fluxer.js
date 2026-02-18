import { BaseManager } from './BaseManager';
import { Invite } from '../structures/Invite';
import { Collection } from '../collections/Collection';
import type { Client } from '../client';
import type { Guild } from '../structures/Guild';
import type { Channel } from '../structures/Channel';

export interface InviteCreateOptions {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
    targetType?: number;
    targetUserId?: string;
    targetApplicationId?: string;
}

export interface FetchInvitesOptions {
    channelId?: string;
    guildId?: string;
}

export class InviteManager extends BaseManager {
    public readonly target: Guild | Channel;

    constructor(client: Client, target: Guild | Channel) {
        super(client);
        this.target = target;
    }

    async fetch(options?: FetchInvitesOptions): Promise<Collection<string, Invite>> {
        let endpoint = '';
        if ('roles' in this.target) { // Guild
            endpoint = `/guilds/${this.target.id}/invites`;
        } else { // Channel
            endpoint = `/channels/${this.target.id}/invites`;
        }

        const data = await this.client.rest.get<any[]>(endpoint);
        const invites = new Collection<string, Invite>();
        for (const inviteData of data) {
            const invite = new Invite(this.client, inviteData);
            invites.set(invite.code, invite);
        }
        return invites;
    }

    async create(options: InviteCreateOptions = {}, reason?: string): Promise<Invite> {
        let channelId = '';
        if ('roles' in this.target) {
            // Se for guild, precisamos de um channelId. 
            // Como o manager pode ser de guild, o create deve ser feito num canal.
            // No entanto, a spec diz: "Se tiver guild: fetch da guild. Se tiver channel: fetch do channel"
            // Para CREATE em GuildManager, geralmente pega o primeiro canal ou exige channelId em options.
            // Na spec do InviteManager, não diz como lidar com create em Guild.
            // Geralmente, Guild.invites.create() não existe no discord.js, apenas Channel.invites.create().
            // Mas vamos assumir que se for Guild, ele tenta usar um channelId das options.
            if (!options.targetUserId && !options.targetApplicationId) {
                 // Fallback para o primeiro canal de texto se for guild? 
                 // Vamos lançar erro se não houver canal contexto.
                 throw new Error('Cannot create an invite on a guild without a channel context.');
            }
        } else {
            channelId = this.target.id;
        }

        const body = {
            max_age: options.maxAge,
            max_uses: options.maxUses,
            temporary: options.temporary,
            unique: options.unique,
            target_type: options.targetType,
            target_user_id: options.targetUserId,
            target_application_id: options.targetApplicationId
        };

        const data = await this.client.rest.post(`/channels/${channelId}/invites`, body, { reason });
        return new Invite(this.client, data);
    }

    async delete(code: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/invites/${code}`, { reason });
    }
}
