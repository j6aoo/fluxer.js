import { EventEmitter } from 'events';
import { RestClient, RestOptions } from './rest';
import { GatewayClient, GatewayClientOptions, PresenceData, ActivityType } from './gateway';
import { ChannelManager } from './managers/ChannelManager';
import { UserManager } from './managers/UserManager';
import { GuildManager } from './managers/GuildManager';
import { WebhookManager } from './managers/WebhookManager';
import { Message } from './structures/Message';
import { Guild } from './structures/Guild';
import { Channel } from './structures/Channel';
import { GuildMember } from './structures/GuildMember';
import { User } from './structures/User';
import { FluxerError } from './errors';

export interface ClientOptions {
    token: string;
    intents?: number;
    rest?: Partial<RestOptions>;
    gateway?: Partial<GatewayClientOptions>;
    presence?: PresenceData;
    messageCacheMaxSize?: number;
}

export interface ClientEvents {
    ready: [user: User];
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
    presenceUpdate: [data: any];
    voiceStateUpdate: [data: any];
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
    public readonly gateway: GatewayClient;
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

        this.gateway = new GatewayClient({
            token: this.token,
            intents: options.intents,
            presence: options.presence,
            ...options.gateway,
        });

        this.channels = new ChannelManager(this);
        this.users = new UserManager(this);
        this.guilds = new GuildManager(this);
        this.webhooks = new WebhookManager(this);

        this._setupGatewayListeners();
    }

    private _setupGatewayListeners(): void {
        // Forward debug and error events
        this.gateway.on('debug', (msg: string) => this.emit('debug', msg));
        this.gateway.on('error', (err: Error) => this.emit('error', err));
        this.gateway.on('disconnected', (code: number) => this.emit('disconnected', code));

        // Forward raw events
        this.gateway.on('raw', (payload: any) => this.emit('raw', payload));

        // READY
        this.gateway.on('READY', (data: any) => {
            this.user = new User(this, data.user);
            this.users._add(data.user);
            this.readyAt = new Date();
            this._ready = true;

            // Cache guilds from ready payload
            if (data.guilds) {
                for (const guildData of data.guilds) {
                    this.guilds._add(guildData);
                }
            }

            this.emit('ready', this.user);
        });

        // RESUMED
        this.gateway.on('RESUMED', () => {
            this.emit('debug', '[Client] Session resumed');
        });

        // MESSAGE_CREATE
        this.gateway.on('MESSAGE_CREATE', (data: any) => {
            const message = new Message(this, data);
            // Cache author
            this.users._add(data.author);
            this.emit('messageCreate', message);
        });

        // MESSAGE_UPDATE
        this.gateway.on('MESSAGE_UPDATE', (data: any) => {
            if (data.author) {
                const message = new Message(this, data);
                this.emit('messageUpdate', message);
            }
        });

        // MESSAGE_DELETE
        this.gateway.on('MESSAGE_DELETE', (data: any) => {
            this.emit('messageDelete', data);
        });

        // MESSAGE_DELETE_BULK
        this.gateway.on('MESSAGE_DELETE_BULK', (data: any) => {
            this.emit('messageDeleteBulk', data);
        });

        // MESSAGE_REACTION_ADD
        this.gateway.on('MESSAGE_REACTION_ADD', (data: any) => {
            this.emit('messageReactionAdd', data);
        });

        // MESSAGE_REACTION_REMOVE
        this.gateway.on('MESSAGE_REACTION_REMOVE', (data: any) => {
            this.emit('messageReactionRemove', data);
        });

        // GUILD_CREATE
        this.gateway.on('GUILD_CREATE', (data: any) => {
            const guild = this.guilds._add(data);

            // Cache channels from guild
            if (data.channels) {
                for (const channelData of data.channels) {
                    channelData.guild_id = data.id;
                    this.channels._add(channelData);
                }
            }

            this.emit('guildCreate', guild);
        });

        // GUILD_UPDATE
        this.gateway.on('GUILD_UPDATE', (data: any) => {
            const guild = this.guilds._add(data);
            this.emit('guildUpdate', guild);
        });

        // GUILD_DELETE
        this.gateway.on('GUILD_DELETE', (data: any) => {
            this.guilds._remove(data.id);
            this.emit('guildDelete', data);
        });

        // GUILD_MEMBER_ADD
        this.gateway.on('GUILD_MEMBER_ADD', (data: any) => {
            const member = new GuildMember(this, data);
            if (data.user) this.users._add(data.user);
            this.emit('guildMemberAdd', member);
        });

        // GUILD_MEMBER_UPDATE
        this.gateway.on('GUILD_MEMBER_UPDATE', (data: any) => {
            const member = new GuildMember(this, data);
            if (data.user) this.users._add(data.user);
            this.emit('guildMemberUpdate', member);
        });

        // GUILD_MEMBER_REMOVE
        this.gateway.on('GUILD_MEMBER_REMOVE', (data: any) => {
            this.emit('guildMemberRemove', data);
        });

        // CHANNEL_CREATE
        this.gateway.on('CHANNEL_CREATE', (data: any) => {
            const channel = this.channels._add(data);
            this.emit('channelCreate', channel);
        });

        // CHANNEL_UPDATE
        this.gateway.on('CHANNEL_UPDATE', (data: any) => {
            const channel = this.channels._add(data);
            this.emit('channelUpdate', channel);
        });

        // CHANNEL_DELETE
        this.gateway.on('CHANNEL_DELETE', (data: any) => {
            const channel = new Channel(this, data);
            this.channels._remove(data.id);
            this.emit('channelDelete', channel);
        });

        // TYPING_START
        this.gateway.on('TYPING_START', (data: any) => {
            this.emit('typingStart', data);
        });

        // PRESENCE_UPDATE
        this.gateway.on('PRESENCE_UPDATE', (data: any) => {
            this.emit('presenceUpdate', data);
        });

        // VOICE_STATE_UPDATE
        this.gateway.on('VOICE_STATE_UPDATE', (data: any) => {
            this.emit('voiceStateUpdate', data);
        });

        // VOICE_SERVER_UPDATE
        this.gateway.on('VOICE_SERVER_UPDATE', (data: any) => {
            this.emit('voiceServerUpdate', data);
        });
    }

    /** Connect to the gateway and start receiving events */
    public async login(): Promise<void> {
        this.emit('debug', '[Client] Logging in...');
        this.gateway.connect();
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
