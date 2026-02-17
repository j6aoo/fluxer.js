// Core
export { Client } from './client';
export type { ClientOptions, ClientEvents } from './client';

// REST
export { RestClient } from './rest';
export type { RestOptions, RequestOptions, FileData } from './rest';

// Gateway
export { GatewayClient, GatewayOpCodes, ActivityType } from './gateway';
export type { GatewayClientOptions, PresenceData, ActivityData } from './gateway';

// Structures
export { User } from './structures/User';
export { Channel } from './structures/Channel';
export type { MessageFetchOptions, MessageCreateData } from './structures/Channel';
export { Message } from './structures/Message';
export { Guild } from './structures/Guild';
export { GuildMember } from './structures/GuildMember';

// Builders
export { EmbedBuilder, Colors } from './builders/EmbedBuilder';

// Managers
export { ChannelManager } from './managers/ChannelManager';
export { UserManager } from './managers/UserManager';
export { GuildManager } from './managers/GuildManager';
export { MessageManager } from './managers/MessageManager';
export { WebhookManager } from './managers/WebhookManager';
export type { WebhookData, WebhookExecuteOptions } from './managers/WebhookManager';

// Collections
export { Collection } from './collections/Collection';

// Types
export type {
    Snowflake,
    User as UserData,
    Guild as GuildData,
    Channel as ChannelData,
    Message as MessageData,
    Role,
    RoleTags,
    Emoji,
    GuildMember as GuildMemberData,
    PermissionOverwrite,
    ThreadMetadata,
    ThreadMember,
    Attachment,
    Embed,
    EmbedField,
    EmbedFooter,
    EmbedImage,
    EmbedThumbnail,
    EmbedVideo,
    EmbedProvider,
    EmbedAuthor,
    Reaction,
    MessageActivity,
    MessageApplication,
    MessageReference,
    MessageInteraction,
    MessageComponent,
    SelectOption,
    StickerItem,
    Sticker,
    ChannelMention,
    GatewayPayload,
} from './types';

// Constants
export { API_VERSION, BASE_URL, CDN_URL, STATIC_URL, GATEWAY_URL, ChannelType, MessageType, RelationshipType } from './consts';

// Utilities
export {
    FLUXER_EPOCH,
    snowflakeToTimestamp,
    timestampToSnowflake,
    getCreationDate,
    getDefaultAvatarUrl,
    getUserAvatarUrl,
    getGuildIconUrl,
    getGuildBannerUrl,
    getGuildSplashUrl,
    getEmojiUrl,
    getStickerUrl,
} from './util';
export type { ImageURLOptions } from './util';

// Errors
export { FluxerError, FluxerAPIError, FluxerRateLimitError, FluxerGatewayError } from './errors';
