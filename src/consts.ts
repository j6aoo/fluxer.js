export const API_VERSION = 'v1';
export const BASE_URL = `https://api.fluxer.app/${API_VERSION}`;
export const CDN_URL = 'https://fluxerusercontent.com';
export const STATIC_URL = 'https://fluxerstatic.com';
export const GATEWAY_URL = `wss://gateway.fluxer.app/?v=${API_VERSION}&encoding=json`;

/** Channel types */
export enum ChannelType {
    GuildText = 0,
    DM = 1,
    GuildVoice = 2,
    GroupDM = 3,
    GuildCategory = 4,
    GuildAnnouncement = 5,
    AnnouncementThread = 10,
    PublicThread = 11,
    PrivateThread = 12,
    GuildStageVoice = 13,
    GuildForum = 15,
}

/** Message types */
export enum MessageType {
    Default = 0,
    RecipientAdd = 1,
    RecipientRemove = 2,
    Call = 3,
    ChannelNameChange = 4,
    ChannelIconChange = 5,
    ChannelPinnedMessage = 6,
    UserJoin = 7,
    Reply = 19,
}

/** Relationship types */
export enum RelationshipType {
    Friend = 1,
    Blocked = 2,
    IncomingRequest = 3,
    OutgoingRequest = 4,
}
