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
        case ChannelTypes.GuildText:
        case ChannelTypes.GuildAnnouncement:
            return new TextChannel(client, data);
        case ChannelTypes.GuildVoice:
        case ChannelTypes.GuildStageVoice:
            return new VoiceChannel(client, data);
        case ChannelTypes.DM:
            return new DMChannel(client, data);
        case ChannelTypes.GuildCategory:
            return new CategoryChannel(client, data);
        case ChannelTypes.PublicThread:
        case ChannelTypes.PrivateThread:
        case ChannelTypes.AnnouncementThread:
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

