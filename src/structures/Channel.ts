import type { Client } from '../client';
import { Channel as ChannelData } from '../types';
import { ChannelType as ChannelTypes } from '../consts';
import {
    BaseChannel,
    TextChannel,
    VoiceChannel,
    DMChannel,
    CategoryChannel,
    ThreadChannel,
} from './channels';

export function createChannel(client: Client, data: ChannelData): BaseChannel {
    switch (data.type) {
        case ChannelTypes.GUILD_TEXT:
        case ChannelTypes.GUILD_ANNOUNCEMENT:
            return new TextChannel(client, data);
        case ChannelTypes.GUILD_VOICE:
        case ChannelTypes.GUILD_STAGE_VOICE:
            return new VoiceChannel(client, data);
        case ChannelTypes.DM:
            return new DMChannel(client, data);
        case ChannelTypes.GUILD_CATEGORY:
            return new CategoryChannel(client, data);
        case ChannelTypes.PUBLIC_THREAD:
        case ChannelTypes.PRIVATE_THREAD:
        case ChannelTypes.ANNOUNCEMENT_THREAD:
            return new ThreadChannel(client, data);
        default:
            return new TextChannel(client, data); 
    }
}

export {
    BaseChannel,
    TextChannel,
    VoiceChannel,
    DMChannel,
    CategoryChannel,
    ThreadChannel,
};

/** @deprecated Use subclasses or createChannel */
export class Channel extends BaseChannel {}
