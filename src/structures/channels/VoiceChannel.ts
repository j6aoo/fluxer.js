import type { Client } from '../../client';
import { BaseChannel } from './BaseChannel';
import { Channel as ChannelData } from '../../types';

export class VoiceChannel extends BaseChannel {
    public name: string | null = null;
    public bitrate: number | null = null;
    public userLimit: number | null = null;
    public rtcRegion: string | null = null;

    constructor(client: Client, data: ChannelData) {
        super(client, data);
        this._patch(data);
    }

    _patch(data: ChannelData): void {
        super._patch(data);
        if (data.name !== undefined) this.name = data.name || null;
        if (data.bitrate !== undefined) this.bitrate = data.bitrate || null;
        if (data.user_limit !== undefined) this.userLimit = data.user_limit || null;
        if (data.rtc_region !== undefined) this.rtcRegion = data.rtc_region || null;
    }

    /** Join this voice channel (placeholder) */
    async join(): Promise<void> {
        // Implementation for voice connection would go here
        throw new Error('Method not implemented.');
    }

    /** Leave this voice channel (placeholder) */
    async leave(): Promise<void> {
        // Implementation for voice connection would go here
        throw new Error('Method not implemented.');
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            name: this.name,
            bitrate: this.bitrate,
            user_limit: this.userLimit,
            rtc_region: this.rtcRegion,
        };
    }
}
