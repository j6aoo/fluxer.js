// Core
export { Client } from './client';
export type { ClientOptions, ClientEvents } from './client';

// Sharding
export { ShardingManager } from './sharding/ShardingManager';
export type { ShardingManagerOptions } from './sharding/ShardingManager';
export { Shard } from './sharding/Shard';
export { ShardClientUtil } from './sharding/ShardClientUtil';

// REST
export { RestClient } from './rest';
export { AsyncQueue } from './rest/AsyncQueue';
export { SequentialHandler } from './rest/SequentialHandler';
export { RateLimitManager } from './rest/RateLimitManager';
export type { RestOptions, RequestOptions, FileData } from './rest';

// Gateway
export { GatewayClient, GatewayOpCodes, ActivityType } from './gateway';
export type { GatewayClientOptions, PresenceData, ActivityData } from './gateway';
export { GatewayShard, ShardStatus } from './gateway/GatewayShard';
export { GatewayManager, GatewayManagerOptions } from './gateway/GatewayManager';
export { GatewayDispatchEvents, GatewayCloseCodes } from './gateway/GatewayEvents';
export { IntentsBitField } from './util/Intents';

// Structures
export { Base } from './structures/Base';
export { User } from './structures/User';
export { Channel } from './structures/Channel';

// Channel Subclasses
export { BaseChannel } from './structures/channels/BaseChannel';
export { TextChannel } from './structures/channels/TextChannel';
export { VoiceChannel } from './structures/channels/VoiceChannel';
export { DMChannel } from './structures/channels/DMChannel';
export { CategoryChannel } from './structures/channels/CategoryChannel';
export { ThreadChannel } from './structures/channels/ThreadChannel';

export { Message, MessageFetchOptions, MessageCreateData, MessagePayload } from './structures/Message';
export { MessageReaction } from './structures/MessageReaction';
export { ReactionEmoji } from './structures/ReactionEmoji';
export { Guild } from './structures/Guild';
export { GuildBan } from './structures/GuildBan';
export { GuildMember } from './structures/GuildMember';
export { GuildMemberRoleManager } from './structures/GuildMemberRoleManager';
export { Role } from './structures/Role';
export { Invite } from './structures/Invite';
export { InviteGuild } from './structures/InviteGuild';
export { GuildEmoji } from './structures/GuildEmoji';
export { GuildEmojiRoleManager } from './structures/GuildEmojiRoleManager';
export { Presence } from './structures/Presence';
export { Activity } from './structures/Activity';
export { VoiceState } from './structures/VoiceState';
export { Relationship } from './structures/Relationship';
export { Webhook } from './structures/Webhook';
export { AuditLogEntry } from './structures/AuditLogEntry';

// Builders
export { EmbedBuilder, Colors } from './builders/EmbedBuilder';
export { ActionRowBuilder } from './builders/ActionRowBuilder';
export { ButtonBuilder } from './builders/ButtonBuilder';
export { SelectMenuBuilder } from './builders/SelectMenuBuilder';
export { SelectMenuOptionBuilder } from './builders/SelectMenuOptionBuilder';
export { ModalBuilder } from './builders/ModalBuilder';
export { TextInputBuilder } from './builders/TextInputBuilder';

// Managers
export { BaseManager } from './managers/BaseManager';
export { DataManager } from './managers/DataManager';
export { CachedManager } from './managers/CachedManager';
export { ChannelManager } from './managers/ChannelManager';
export { UserManager } from './managers/UserManager';
export { GuildManager } from './managers/GuildManager';
export { MessageManager } from './managers/MessageManager';
export { ReactionManager } from './managers/ReactionManager';
export { WebhookManager } from './managers/WebhookManager';
export { RoleManager } from './managers/RoleManager';
export { GuildBanManager } from './managers/GuildBanManager';
export { GuildMemberManager } from './managers/GuildMemberManager';
export { InviteManager } from './managers/InviteManager';
export { RelationshipManager } from './managers/RelationshipManager';
export { GuildEmojiManager } from './managers/GuildEmojiManager';
export { PresenceManager } from './managers/PresenceManager';
export { VoiceStateManager } from './managers/VoiceStateManager';
export { AuditLogManager } from './managers/AuditLogManager';
export type { WebhookCreateOptions, WebhookEditOptions, WebhookExecuteOptions } from './managers/WebhookManager';
export type { FetchAuditLogOptions } from './managers/AuditLogManager';

// Collections
export { Collection } from './collections/Collection';
export { LimitedCollection } from './collections/LimitedCollection';

// Types
export type {
    Snowflake,
    User as UserData,
    Guild as GuildData,
    Channel as ChannelData,
    Message as MessageData,
    Role as RoleData,
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
    RelationshipData,
    WebhookData,
    GatewayPayload,
    GuildBan as GuildBanData,
    ImageURLOptions,
    AuditLog as AuditLogData,
    AuditLogEntry as AuditLogEntryData,
    AuditLogChange,
    AuditLogOptions,
} from './types';

// Constants
export { API_VERSION, BASE_URL, CDN_URL, STATIC_URL, GATEWAY_URL, ChannelType, MessageType, RelationshipType } from './consts';
export { AuditLogEvent } from './types';

// Utilities
export { BitField } from './util/BitField';
export { Permissions, PermissionString } from './util/Permissions';
export { UserFlags } from './util/UserFlags';
export { MessageFlags } from './util/MessageFlags';
export { SnowflakeUtil, FLUXER_EPOCH } from './util/SnowflakeUtil';
export { Pagination } from './util/Pagination';
export { PaginatedManager, PaginatedFetchOptions } from './structures/Managers/PaginatedManager';
export {
    CDN,
    CDN_BASE,
    STATIC_CDN_BASE,
    avatarURL,
    defaultAvatarURL,
    guildIconURL,
    guildBannerURL,
    emojiURL,
    stickerURL,
    attachmentURL,
} from './util/CDN';
export {
    snowflakeToTimestamp,
    timestampToSnowflake,
    getCreationDate,
    getDefaultAvatarUrl,
    getUserAvatarUrl,
    getUserBannerUrl,
    getGuildIconUrl,
    getGuildBannerUrl,
    getGuildSplashUrl,
    getEmojiUrl,
    getStickerUrl,
    resolveEmoji,
} from './util';

// Errors
export { FluxerError, FluxerAPIError, FluxerRateLimitError, FluxerGatewayError } from './errors';
export type { ValidationError } from './errors';
