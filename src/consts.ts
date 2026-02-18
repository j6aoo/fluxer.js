export const API_VERSION = 'v1';
export const BASE_URL = 'https://api.fluxer.app';
export const CDN_URL = 'https://fluxerusercontent.com';
export const STATIC_URL = 'https://fluxerstatic.com';
export const GATEWAY_URL = `wss://gateway.fluxer.app/?v=${API_VERSION}&encoding=json`;

/** Channel types */
export const ChannelType = Object.freeze({
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_ANNOUNCEMENT: 5,
    ANNOUNCEMENT_THREAD: 10,
    PUBLIC_THREAD: 11,
    PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13,
    GUILD_DIRECTORY: 14,
    GUILD_FORUM: 15,
    GUILD_MEDIA: 16,
});

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
