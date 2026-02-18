import { Base } from './Base';
import type { Client } from '../client';
import type { WebhookData, InviteGuildData, WebhookChannelData } from '../types';
import { User } from './User';

export class Webhook extends Base {
    public readonly id: string;
    public type: number;
    public guildId: string | null = null;
    public channelId: string;
    public user: User | null = null;
    public name: string | null = null;
    public avatar: string | null = null;
    public token: string | null = null;
    public applicationId: string | null = null;
    public sourceGuild: InviteGuildData | null = null;
    public sourceChannel: WebhookChannelData | null = null;
    public url: string | null = null;

    constructor(client: Client, data: WebhookData) {
        super(client);
        this.id = data.id;
        this.type = data.type;
        this.channelId = data.channel_id;
        this._patch(data);
    }

    _patch(data: WebhookData): void {
        if (data.type !== undefined) this.type = data.type;
        if (data.guild_id !== undefined) this.guildId = data.guild_id ?? null;
        if (data.channel_id !== undefined) this.channelId = data.channel_id;
        if (data.user !== undefined) this.user = data.user ? new User(this.client, data.user) : null;
        if (data.name !== undefined) this.name = data.name ?? null;
        if (data.avatar !== undefined) this.avatar = data.avatar ?? null;
        if (data.token !== undefined) this.token = data.token ?? null;
        if (data.application_id !== undefined) this.applicationId = data.application_id ?? null;
        if (data.source_guild !== undefined) this.sourceGuild = data.source_guild ?? null;
        if (data.source_channel !== undefined) this.sourceChannel = data.source_channel ?? null;
        if (data.url !== undefined) this.url = data.url ?? null;
    }
}
