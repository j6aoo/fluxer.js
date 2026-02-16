import { EventEmitter } from 'events';
import { RestClient, RestOptions } from './rest';
import { GatewayClient, GatewayClientOptions } from './gateway';
import { BASE_URL, API_VERSION } from './consts';
import { ChannelManager } from './managers/ChannelManager';
import { UserManager } from './managers/UserManager';
import { Message } from './structures/Message';

export interface ClientOptions {
    token: string;
    intents?: number;
    rest?: Partial<RestOptions>;
    gateway?: Partial<GatewayClientOptions>;
}

export class Client extends EventEmitter {
    public token: string;
    public rest: RestClient;
    public gateway: GatewayClient;
    public channels: ChannelManager;
    public users: UserManager;

    constructor(options: ClientOptions) {
        super();
        this.token = options.token;

        this.rest = new RestClient({
            token: this.token,
            ...options.rest,
        });

        this.gateway = new GatewayClient({
            token: this.token,
            intents: options.intents,
            ...options.gateway,
        });

        this.channels = new ChannelManager(this);
        this.users = new UserManager(this);

        this.gateway.on('MESSAGE_CREATE', (data) => {
            const message = new Message(this, data);
            this.emit('messageCreate', message);
            this.emit('MESSAGE_CREATE', data);
        });

        this.gateway.on('READY', (data) => {
            this.emit('ready', data);
            this.emit('READY', data);
        });

        // Forward other raw gateway events that aren't handled specially
        const specialEvents = ['MESSAGE_CREATE', 'READY'];
        this.gateway.on('raw', (payload) => {
            if (payload.t && !specialEvents.includes(payload.t)) {
                this.emit(payload.t, payload.d);
            }
        });
    }

    public async login() {
        this.gateway.connect();
    }

    public destroy() {
        this.gateway.disconnect();
    }
}
