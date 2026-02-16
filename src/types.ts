export type Snowflake = string;

export interface User {
    id: Snowflake;
    username: string;
    discriminator: string;
    avatar?: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: number;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
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
    id?: Snowflake;
    name?: string;
    roles?: Snowflake[];
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
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
    type: number; 
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
}

export interface SelectOption {
    label: string;
    value: string;
    description?: string;
    emoji?: Emoji;
    default?: boolean;
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
    d?: any;
    s?: number;
    t?: string;
}
