import { Base } from './Base';
import type { Client } from '../client';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import type { VoiceChannel } from './channels/VoiceChannel';
import type { Snowflake } from '../types';

export class VoiceState extends Base {
    public guildId: string;
    public userId: string;
    public channelId: Snowflake | null;
    public sessionId: string | null;
    public deaf: boolean;
    public mute: boolean;
    public selfDeaf: boolean;
    public selfMute: boolean;
    public selfVideo: boolean;
    public suppress: boolean;
    public requestToSpeakTimestamp: number | null;

    constructor(client: Client, data: any) {
        super(client);
        this.guildId = data.guild_id;
        this.userId = data.user_id;
        this.channelId = data.channel_id || null;
        this.sessionId = data.session_id || null;
        this.deaf = data.deaf;
        this.mute = data.mute;
        this.selfDeaf = data.self_deaf;
        this.selfMute = data.self_mute;
        this.selfVideo = data.self_video;
        this.suppress = data.suppress;
        this.requestToSpeakTimestamp = data.request_to_speak_timestamp ? new Date(data.request_to_speak_timestamp).getTime() : null;
    }

    get guild(): Guild | null {
        return this.client.guilds.cache.get(this.guildId) || null;
    }

    get member(): GuildMember | null {
        return this.guild?.members.cache.get(this.userId) || null;
    }

    get channel(): VoiceChannel | null {
        if (!this.channelId) return null;
        return this.client.channels.cache.get(this.channelId) as VoiceChannel || null;
    }

    get speaking(): boolean {
        // This usually comes from VoiceSpeaking event, but for structure we can expose it
        // In some SDKs it's tracked in the voice state
        return false; 
    }

    async setDeaf(deaf: boolean, reason?: string): Promise<GuildMember> {
        return this.member!.edit({ deaf }, reason);
    }

    async setMute(mute: boolean, reason?: string): Promise<GuildMember> {
        return this.member!.edit({ mute }, reason);
    }

    async disconnect(reason?: string): Promise<GuildMember> {
        return this.setChannel(null, reason);
    }

    async setChannel(channel: VoiceChannel | Snowflake | null, reason?: string): Promise<GuildMember> {
        const channelId = channel === null ? null : (typeof channel === 'string' ? channel : channel.id);
        return this.member!.edit({ channelId }, reason);
    }

    /** @internal */
    _patch(data: any): void {
        if (data.channel_id !== undefined) this.channelId = data.channel_id || null;
        if (data.session_id !== undefined) this.sessionId = data.session_id || null;
        if (data.deaf !== undefined) this.deaf = data.deaf;
        if (data.mute !== undefined) this.mute = data.mute;
        if (data.self_deaf !== undefined) this.selfDeaf = data.self_deaf;
        if (data.self_mute !== undefined) this.selfMute = data.self_mute;
        if (data.self_video !== undefined) this.selfVideo = data.self_video;
        if (data.suppress !== undefined) this.suppress = data.suppress;
        if (data.request_to_speak_timestamp !== undefined) {
            this.requestToSpeakTimestamp = data.request_to_speak_timestamp ? new Date(data.request_to_speak_timestamp).getTime() : null;
        }
    }

    toString(): string {
        return `<@${this.userId}>`;
    }
}
