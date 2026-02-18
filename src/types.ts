export type Snowflake = string;

export interface ImageURLOptions {
    size?: 16 | 20 | 22 | 24 | 28 | 32 | 40 | 44 | 48 | 56 | 60 | 64 | 80 | 96 | 100 | 128 | 160 | 240 | 256 | 300 | 320 | 480 | 512 | 600 | 640 | 1024 | 1280 | 1536 | 2048 | 3072 | 4096;
    format?: 'webp' | 'png' | 'jpg' | 'jpeg' | 'gif';
    quality?: 'high' | 'low' | 'lossless';
    animated?: boolean;
}

export interface User {
    id: Snowflake;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
    system: boolean;
    mfa_enabled: boolean;
    banner: string | null;
    accent_color: number | null;
    locale: string;
    verified: boolean;
    email: string | null;
    flags: number;
    premium_type: number | null;
    public_flags: number;
}

export interface Guild {
    id: Snowflake;
    name: string;
    icon?: string;
    splash?: string;
    discovery_splash?: string;
    owner_id: Snowflake;
    afk_channel_id?: Snowflake;
    afk_timeout: number;
    widget_enabled?: boolean;
    widget_channel_id?: Snowflake;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: Role[];
    emojis: Emoji[];
    features: string[];
    mfa_level: number;
    application_id?: Snowflake;
    system_channel_id?: Snowflake;
    system_channel_flags: number;
    rules_channel_id?: Snowflake;
    max_presences?: number;
    max_members?: number;
    vanity_url_code?: string;
    description?: string;
    banner?: string;
    premium_tier: number;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id?: Snowflake;
    max_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    nsfw_level: number;
}

export interface Role {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string;
    unicode_emoji?: string;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: RoleTags;
}

export interface RoleTags {
    bot_id?: Snowflake;
    integration_id?: Snowflake;
    premium_subscriber?: null;
}

export interface Emoji {
    id: Snowflake | null;
    name: string | null;
    roles?: Snowflake[];
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
}

export interface GuildEmojiCreateOptions {
    name: string;
    image: string;
    roles?: Snowflake[];
    reason?: string;
}

export interface GuildEmojiEditOptions {
    name?: string;
    roles?: Snowflake[];
    reason?: string;
}

export interface Channel {
    id: Snowflake;
    type: number;
    guild_id?: Snowflake;
    position?: number;
    permission_overwrites?: PermissionOverwrite[];
    name?: string;
    topic?: string;
    nsfw?: boolean;
    last_message_id?: Snowflake;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: User[];
    icon?: string;
    owner_id?: Snowflake;
    application_id?: Snowflake;
    parent_id?: Snowflake;
    last_pin_timestamp?: string;
    rtc_region?: string;
    video_quality_mode?: number;
    message_count?: number;
    member_count?: number;
    thread_metadata?: ThreadMetadata;
    member?: ThreadMember;
    default_auto_archive_duration?: number;
    permissions?: string;
    flags?: number;
    total_message_sent?: number;
}

export interface PermissionOverwrite {
    id: Snowflake;
    type: 'role' | 'member';
    allow: string;
    deny: string;
}

export interface ThreadMetadata {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: string;
    locked: boolean;
    invitable?: boolean;
    create_timestamp?: string;
}

export interface ThreadMember {
    id?: Snowflake;
    user_id?: Snowflake;
    join_timestamp: string;
    flags: number;
}

export interface Message {
    id: Snowflake;
    channel_id: Snowflake;
    author: User;
    content: string;
    timestamp: string;
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: User[];
    mention_roles: Snowflake[];
    mention_channels?: ChannelMention[];
    attachments: Attachment[];
    embeds: Embed[];
    reactions?: Reaction[];
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: Snowflake;
    type: number;
    activity?: MessageActivity;
    application?: MessageApplication;
    application_id?: Snowflake;
    message_reference?: MessageReference;
    flags?: number;
    referenced_message?: Message | null;
    interaction?: MessageInteraction;
    thread?: Channel;
    components?: MessageComponent[];
    sticker_items?: StickerItem[];
    stickers?: Sticker[];
    position?: number;
}

export interface ChannelMention {
    id: Snowflake;
    guild_id: Snowflake;
    type: number;
    name: string;
}

export interface Attachment {
    id: Snowflake;
    filename: string;
    description?: string;
    content_type?: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number;
    width?: number;
    ephemeral?: boolean;
}

export interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: EmbedFooter;
    image?: EmbedImage;
    thumbnail?: EmbedThumbnail;
    video?: EmbedVideo;
    provider?: EmbedProvider;
    author?: EmbedAuthor;
    fields?: EmbedField[];
}

export interface EmbedFooter {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedImage {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedThumbnail {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedVideo {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedProvider {
    name?: string;
    url?: string;
}

export interface EmbedAuthor {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

export interface Reaction {
    count: number;
    me: boolean;
    emoji: Emoji;
}

export interface MessageActivity {
    type: number;
    party_id?: string;
}

export interface MessageApplication {
    id: Snowflake;
    cover_image?: string;
    description: string;
    icon: string | null;
    name: string;
}

export interface MessageReference {
    message_id?: Snowflake;
    channel_id?: Snowflake;
    guild_id?: Snowflake;
    fail_if_not_exists?: boolean;
}

export interface MessageInteraction {
    id: Snowflake;
    type: number;
    name: string;
    user: User;
    member?: GuildMember;
}

export interface GuildMember {
    user?: User;
    nick?: string;
    avatar?: string;
    roles: Snowflake[];
    joined_at: string;
    premium_since?: string | null;
    deaf: boolean;
    mute: boolean;
    flags: number;
    pending?: boolean;
    permissions?: string;
    communication_disabled_until?: string | null;
}

export interface MessageComponent {
    type: number;
    custom_id?: string;
    disabled?: boolean;
    style?: number;
    label?: string;
    emoji?: Emoji;
    url?: string;
    options?: SelectOption[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    components?: MessageComponent[];
    value?: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
}

export interface SelectOption {
    label: string;
    value: string;
    description?: string;
    emoji?: Emoji;
    default?: boolean;
}

export enum ComponentType {
    ActionRow = 1,
    Button = 2,
    StringSelect = 3,
    TextInput = 4,
    UserSelect = 5,
    RoleSelect = 6,
    MentionableSelect = 7,
    ChannelSelect = 8,
}

export enum ButtonStyle {
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
}

export enum TextInputStyle {
    Short = 1,
    Paragraph = 2,
}

export interface StickerItem {
    id: Snowflake;
    name: string;
    format_type: number;
}

export interface Sticker {
    id: Snowflake;
    pack_id?: Snowflake;
    name: string;
    description: string | null;
    tags: string;
    asset?: string;
    type: number;
    format_type: number;
    available?: boolean;
    guild_id?: Snowflake;
    user?: User;
    sort_value?: number;
}

export interface GatewayPayload {
    op: number;
    d?: unknown;
    s?: number;
    t?: string;
}

export interface IdentifyPayload {
    token: string;
    intents: number;
    properties: {
        os: string;
        browser: string;
        device: string;
    };
    compress?: boolean;
    large_threshold?: number;
    shard?: [number, number];
    presence?: PresenceUpdatePayload;
}

export interface PresenceUpdatePayload {
    since: number | null;
    activities: ActivityData[];
    status: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';
    afk: boolean;
}

export interface VoiceStateUpdatePayload {
    guild_id: Snowflake;
    channel_id: Snowflake | null;
    self_mute: boolean;
    self_deaf: boolean;
}

export interface APIErrorResponse {
    message: string;
    code: string | number;
    errors?: APIValidationError[];
}

export interface APIValidationError {
    path: string;
    message: string;
}

export enum RelationshipType {
    None = 0,
    Friend = 1,
    Blocked = 2,
    PendingIncoming = 3,
    PendingOutgoing = 4,
}

export interface RelationshipData {
    id: Snowflake;
    type: RelationshipType;
    user: User;
    created_at: string;
}

export interface WebhookData {
    id: Snowflake;
    type: number;
    guild_id: Snowflake | null;
    channel_id: Snowflake;
    user?: User;
    name: string | null;
    avatar: string | null;
    token?: string;
    application_id: Snowflake | null;
    source_guild?: InviteGuildData;
    source_channel?: WebhookChannelData;
    url?: string;
}

export interface WebhookChannelData {
    id: Snowflake;
    name: string;
}

export interface InviteGuildData {
    id: Snowflake;
    name: string;
    icon: string | null;
    splash: string | null;
    banner: string | null;
    description: string | null;
    features: string[];
    verification_level: number;
    vanity_url_code: string | null;
    nsfw_level: number;
    premium_subscription_count?: number;
}

export interface InviteData {
    code: string;
    guild?: InviteGuildData;
    channel: InviteChannelData | null;
    inviter?: User;
    target_user?: User;
    target_type?: number;
    target_application?: ApplicationData;
    approximate_presence_count?: number;
    approximate_member_count?: number;
    expires_at?: string | null;
    uses?: number;
    max_uses?: number;
    max_age?: number;
    temporary?: boolean;
    created_at: string;
}

export interface InviteChannelData {
    id: Snowflake;
    name: string;
    type: number;
}

export interface ApplicationData {
    id: Snowflake;
    name: string;
    icon: string | null;
    description: string;
    bot_public: boolean;
    bot_require_code_grant: boolean;
    terms_of_service_url?: string;
    privacy_policy_url?: string;
    owner?: User;
    summary?: string;
    verify_key?: string;
}

export interface RTCRegion {
    id: string;
    name: string;
    optimal: boolean;
    deprecated: boolean;
    custom: boolean;
}

export interface AuditLogEntry {
    id: Snowflake;
    action_type: number;
    user_id?: Snowflake;
    target_id?: Snowflake;
    changes?: AuditLogChange[];
    options?: AuditLogOptions;
    reason?: string;
}

export interface AuditLogChange {
    key: string;
    old_value?: unknown;
    new_value?: unknown;
}

export interface AuditLogOptions {
    delete_member_days?: string;
    members_removed?: string;
    channel_id?: Snowflake;
    message_id?: Snowflake;
    count?: string;
    id?: Snowflake;
    type?: string;
    role_name?: string;
}

export interface ApplicationCommand {
    id: Snowflake;
    type?: number;
    application_id: Snowflake;
    guild_id?: Snowflake;
    name: string;
    name_localizations?: Record<string, string> | null;
    description: string;
    description_localizations?: Record<string, string> | null;
    options?: ApplicationCommandOption[];
    default_member_permissions?: string | null;
    dm_permission?: boolean;
    default_permission?: boolean;
    nsfw?: boolean;
    version?: Snowflake;
}

export interface ApplicationCommandOption {
    type: number;
    name: string;
    name_localizations?: Record<string, string> | null;
    description: string;
    description_localizations?: Record<string, string> | null;
    required?: boolean;
    choices?: ApplicationCommandOptionChoice[];
    options?: ApplicationCommandOption[];
    channel_types?: number[];
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
}

export interface ApplicationCommandOptionChoice {
    name: string;
    name_localizations?: Record<string, string> | null;
    value: string | number;
}

export interface Interaction {
    id: Snowflake;
    application_id: Snowflake;
    type: number;
    data?: InteractionData;
    guild_id?: Snowflake;
    channel_id?: Snowflake;
    member?: GuildMember;
    user?: User;
    token: string;
    version: number;
    message?: Message;
    app_permissions?: string;
    locale?: string;
    guild_locale?: string;
}

export interface InteractionData {
    id?: Snowflake;
    name?: string;
    type?: number;
    resolved?: InteractionResolvedData;
    options?: InteractionDataOption[];
    custom_id?: string;
    component_type?: number;
    values?: string[];
    target_id?: Snowflake;
}

export interface InteractionResolvedData {
    users?: Record<string, User>;
    members?: Record<string, GuildMember>;
    roles?: Record<string, Role>;
    channels?: Record<string, Channel>;
    messages?: Record<string, Message>;
    attachments?: Record<string, Attachment>;
}

export interface InteractionDataOption {
    name: string;
    type: number;
    value?: string | number | boolean;
    options?: InteractionDataOption[];
    focused?: boolean;
}

export interface ActivityData {
    name: string;
    type: number;
    url?: string | null;
}

export interface PresenceUpdateEventData {
    user: User;
    guild_id: Snowflake;
    status: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';
    activities: ActivityData[];
    client_status?: Record<string, 'online' | 'idle' | 'dnd' | 'offline'>;
}

export interface VoiceStateData {
    guild_id: Snowflake;
    channel_id: Snowflake | null;
    user_id: Snowflake;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    self_video: boolean;
    suppress: boolean;
    request_to_speak_timestamp: string | null;
}

export interface ReadyEventData {
    v: number;
    user: User;
    guilds: Array<{ id: Snowflake; unavailable?: boolean }>;
    session_id: string;
    resume_gateway_url: string;
    shard?: [number, number];
    application?: { id: Snowflake; flags?: number };
}

export interface ClientEvents {
    ready: [ReadyEventData];
    shardReady: [shardId: number, data: ReadyEventData];
    shardResume: [shardId: number];
    shardDisconnect: [shardId: number, code: number];
    shardError: [shardId: number, error: Error];
    shardDispatch: [shardId: number, event: string, data: unknown];
    messageCreate: [Message];
    messageUpdate: [Message];
    messageDelete: [data: { id: Snowflake; channel_id: Snowflake; guild_id?: Snowflake }];
    messageDeleteBulk: [data: { ids: Snowflake[]; channel_id: Snowflake; guild_id?: Snowflake }];
    guildCreate: [Guild];
    guildUpdate: [Guild];
    guildDelete: [data: { id: Snowflake; unavailable?: boolean }];
    guildMemberAdd: [GuildMember];
    guildMemberUpdate: [GuildMember];
    guildMemberRemove: [data: { guild_id: Snowflake; user: User }];
    channelCreate: [Channel];
    channelUpdate: [Channel];
    channelDelete: [Channel];
    typingStart: [data: { channel_id: Snowflake; guild_id?: Snowflake; user_id: Snowflake; timestamp: number }];
    presenceUpdate: [PresenceUpdateEventData];
    voiceStateUpdate: [VoiceStateData];
    voiceServerUpdate: [data: unknown];
    messageReactionAdd: [data: unknown];
    messageReactionRemove: [data: unknown];
    error: [error: Error];
    debug: [message: string];
    raw: [payload: GatewayPayload];
    disconnected: [code: number];
}

export interface GuildBan {
    reason: string | null;
    user: User;
}
