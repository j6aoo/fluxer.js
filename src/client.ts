import { EventEmitter } from 'events';
import { RestClient, RestOptions } from './rest';
import { GatewayManager, GatewayManagerOptions, PresenceData, ActivityType, GatewayDispatchEvents } from './gateway';
import { ChannelManager } from './managers/ChannelManager';
import { UserManager } from './managers/UserManager';
import { GuildManager } from './managers/GuildManager';
import { WebhookManager } from './managers/WebhookManager';
import { Message } from './structures/Message';
import { MessageReaction } from './structures/MessageReaction';
import { ReactionEmoji } from './structures/ReactionEmoji';
import { Guild } from './structures/Guild';
import { Channel } from './structures/Channel';
import { GuildMember } from './structures/GuildMember';
import { User } from './structures/User';
import { Presence } from './structures/Presence';
import { VoiceState } from './structures/VoiceState';
import { FluxerError } from './errors';

export interface ClientOptions {
    token: string;
    intents?: number | bigint;
    rest?: Partial<RestOptions>;
    gateway?: Partial<GatewayManagerOptions>;
    presence?: PresenceData;
    messageCacheMaxSize?: number;
    shards?: number | 'auto';
    shardList?: number[];
    totalShards?: number;
}

export interface ClientEvents {
    ready: [user: User];
    shardReady: [shardId: number, data: any];
    shardResume: [shardId: number];
    shardDisconnect: [shardId: number, code: number];
    shardError: [shardId: number, error: Error];
    shardDispatch: [shardId: number, event: string, data: any];
    messageCreate: [message: Message];
    messageUpdate: [message: Message];
    messageDelete: [data: { id: string; channel_id: string; guild_id?: string }];
    messageDeleteBulk: [data: { ids: string[]; channel_id: string; guild_id?: string }];
    guildCreate: [guild: Guild];
    guildUpdate: [guild: Guild];
    guildDelete: [data: { id: string; unavailable?: boolean }];
    guildMemberAdd: [member: GuildMember];
    guildMemberUpdate: [member: GuildMember];
    guildMemberRemove: [data: { guild_id: string; user: any }];
    channelCreate: [channel: Channel];
    channelUpdate: [channel: Channel];
    channelDelete: [channel: Channel];
    typingStart: [data: { channel_id: string; guild_id?: string; user_id: string; timestamp: number }];
    presenceUpdate: [presence: Presence];
    voiceStateUpdate: [voiceState: VoiceState];
    voiceServerUpdate: [data: any];
    messageReactionAdd: [data: any];
    messageReactionRemove: [data: any];
    error: [error: Error];
    debug: [message: string];
    raw: [payload: any];
    disconnected: [code: number];
}

export class Client extends EventEmitter {
    public readonly token: string;
    public readonly rest: RestClient;
    public readonly gateway: GatewayManager;
    public readonly channels: ChannelManager;
    public readonly users: UserManager;
    public readonly guilds: GuildManager;
    public readonly webhooks: WebhookManager;
    public user: User | null = null;
    public readyAt: Date | null = null;
    private _ready = false;

    constructor(options: ClientOptions) {
        super();

        if (!options.token) {
            throw new FluxerError('A bot token must be provided');
        }

        this.token = options.token;

        this.rest = new RestClient({
            token: this.token,
            ...options.rest,
        });

        this.gateway = new GatewayManager(this, {
            token: this.token,
            intents: options.intents || 0,
            presence: options.presence,
            shardCount: options.shards,
            shardList: options.shardList,
            totalShards: options.totalShards,
            ...options.gateway,
        });

        this.channels = new ChannelManager(this);
        this.users = new UserManager(this);
        this.guilds = new GuildManager(this);
        this.webhooks = new WebhookManager(this);

        this._setupGatewayListeners();
    }

    private _setupGatewayListeners(): void {
        // Forward manager events
        this.gateway.on('shardReady', (id, data) => {
            this.emit('shardReady', id, data);
            
            // First shard ready defines the client user
            if (!this.user && data.user) {
                this.user = new User(this, data.user);
                this.users._add(data.user);
                this.readyAt = new Date();
                this._ready = true;
                this.emit('ready', this.user);
            }

            if (data.guilds && Array.isArray(data.guilds)) {
                for (const guildData of data.guilds) {
                    if (guildData && guildData.id) {
                        this.guilds._add(guildData);
                    }
                }
            }
        });

        this.gateway.on('shardResume', (id) => this.emit('shardResume', id));
        this.gateway.on('shardDisconnect', (id, code) => this.emit('shardDisconnect', id, code));
        this.gateway.on('shardError', (id, err) => this.emit('shardError', id, err));
        
        this.gateway.on('shardDispatch', (shardId, event, data) => {
            this.emit('shardDispatch', shardId, event, data);
            this._handleDispatch(event, data);
        });
    }

    private _handleDispatch(event: string, data: any): void {
        switch (event) {
            case GatewayDispatchEvents.MessageCreate: {
                const message = new Message(this, data);
                this.users._add(data.author);
                this.emit('messageCreate', message);
                break;
            }
            case GatewayDispatchEvents.MessageUpdate: {
                if (data.author) {
                    const message = new Message(this, data);
                    this.emit('messageUpdate', message);
                }
                break;
            }
            case GatewayDispatchEvents.MessageDelete:
                this.emit('messageDelete', data);
                break;
            case GatewayDispatchEvents.MessageDeleteBulk:
                this.emit('messageDeleteBulk', data);
                break;
            case GatewayDispatchEvents.GuildCreate: {
                const guild = this.guilds._add(data);
                if (data.channels) {
                    for (const channelData of data.channels) {
                        channelData.guild_id = data.id;
                        this.channels._add(channelData);
                    }
                }
                this.emit('guildCreate', guild);
                break;
            }
            case GatewayDispatchEvents.GuildUpdate: {
                const guild = this.guilds._add(data);
                this.emit('guildUpdate', guild);
                break;
            }
            case GatewayDispatchEvents.GuildDelete:
                this.guilds._remove(data.id);
                this.emit('guildDelete', data);
                break;
            case GatewayDispatchEvents.GuildMemberAdd: {
                const member = new GuildMember(this, data);
                if (data.user) this.users._add(data.user);
                this.emit('guildMemberAdd', member);
                break;
            }
            case GatewayDispatchEvents.GuildMemberUpdate: {
                const member = new GuildMember(this, data);
                if (data.user) this.users._add(data.user);
                this.emit('guildMemberUpdate', member);
                break;
            }
            case GatewayDispatchEvents.GuildMemberRemove:
                this.emit('guildMemberRemove', data);
                break;
            case GatewayDispatchEvents.ChannelCreate: {
                const channel = this.channels._add(data);
                this.emit('channelCreate', channel);
                break;
            }
            case GatewayDispatchEvents.ChannelUpdate: {
                const channel = this.channels._add(data);
                this.emit('channelUpdate', channel);
                break;
            }
            case GatewayDispatchEvents.ChannelDelete: {
                const channel = new Channel(this, data);
                this.channels._remove(data.id);
                this.emit('channelDelete', channel);
                break;
            }
            case GatewayDispatchEvents.PresenceUpdate: {
                const guild = this.guilds.cache.get(data.guild_id);
                if (guild) {
                    const presence = guild.presences._add(data);
                    this.emit('presenceUpdate', presence);
                }
                break;
            }
            case GatewayDispatchEvents.VoiceStateUpdate: {
                const guild = this.guilds.cache.get(data.guild_id);
                if (guild) {
                    const voiceState = guild.voiceStates._add(data);
                    this.emit('voiceStateUpdate', voiceState);
                }
                break;
            }
            case GatewayDispatchEvents.VoiceServerUpdate:
                this.emit('voiceServerUpdate', data);
                break;
            case GatewayDispatchEvents.TypingStart:
                this.emit('typingStart', data);
                break;
            case GatewayDispatchEvents.MessageReactionAdd:
                this._handleReactionAdd(data);
                break;
            case GatewayDispatchEvents.MessageReactionRemove:
                this._handleReactionRemove(data);
                break;
        }
    }

    private _handleReactionAdd(data: any): void {
        const channel = this.channels.cache.get(data.channel_id);
        const message = (channel as any)?.messages?.cache?.get(data.message_id);
        if (message) {
            const reaction = message.reactions._add({
                count: 1,
                me: data.user_id === this.user?.id,
                emoji: data.emoji
            });
            this.emit('messageReactionAdd', reaction, this.users._add(data.member?.user || { id: data.user_id }));
        } else {
            this.emit('messageReactionAdd', data);
        }
    }

    private _handleReactionRemove(data: any): void {
        const channel = this.channels.cache.get(data.channel_id);
        const message = (channel as any)?.messages?.cache?.get(data.message_id);
        if (message) {
            const emojiId = data.emoji.id ?? data.emoji.name;
            const reaction = message.reactions.cache.get(emojiId);
            if (reaction) {
                reaction.count--;
                if (data.user_id === this.user?.id) reaction.me = false;
                if (reaction.count <= 0) message.reactions.cache.delete(emojiId);
            }
            this.emit('messageReactionRemove', reaction || data, data.user_id);
        } else {
            this.emit('messageReactionRemove', data);
        }
    }

    /** Connect to the gateway and start receiving events */
    public async login(): Promise<void> {
        this.emit('debug', '[Client] Logging in...');
        await this.gateway.connect();
    }

    /** Disconnect from the gateway */
    public destroy(): void {
        this._ready = false;
        this.readyAt = null;
        this.user = null;
        this.gateway.disconnect();
    }

    /** Whether the client is ready */
    public get isReady(): boolean {
        return this._ready;
    }

    /** Uptime in milliseconds */
    public get uptime(): number | null {
        if (!this.readyAt) return null;
        return Date.now() - this.readyAt.getTime();
    }

    /** Set the bot's presence/status */
    public setPresence(presence: PresenceData): void {
        this.gateway.setPresence(presence);
    }

    /** Set the bot's activity */
    public setActivity(name: string, type: ActivityType = ActivityType.Playing): void {
        this.setPresence({
            activities: [{ name, type }],
            status: 'online',
        });
    }

    /** Set the bot's status */
    public setStatus(status: 'online' | 'idle' | 'dnd' | 'invisible'): void {
        this.setPresence({ status });
    }

    /** Fetch the bot user from the API */
    public async fetchUser(userId: string): Promise<User> {
        return this.users.fetch(userId);
    }

    /** Fetch a guild from the API */
    public async fetchGuild(guildId: string): Promise<Guild> {
        return this.guilds.fetch(guildId);
    }

    /** Fetch a channel from the API */
    public async fetchChannel(channelId: string): Promise<Channel> {
        return this.channels.fetch(channelId);
    }

    /** Fetch an invite */
    public async fetchInvite(code: string): Promise<any> {
        return this.rest.get(`/invites/${code}`);
    }

    /** Generate an invite link for the bot (if applicable) */
    public generateInvite(permissions?: string): string {
        const botId = this.user?.id;
        if (!botId) throw new FluxerError('Client is not ready');
        let url = `https://fluxer.app/oauth2/authorize?client_id=${botId}&scope=bot`;
        if (permissions) url += `&permissions=${permissions}`;
        return url;
    }

    // Type-safe event emitter overrides
    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    public on(event: string, listener: (...args: any[]) => void): this;
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    public once(event: string, listener: (...args: any[]) => void): this;
    public once(event: string, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }

    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    public emit(event: string, ...args: any[]): boolean;
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}
