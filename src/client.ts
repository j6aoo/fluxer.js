import { EventEmitter } from 'events';
import { RestClient, RestOptions } from './rest';
import { GatewayClient, GatewayClientOptions } from './gateway';
import { BASE_URL, API_VERSION } from './consts';

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

        const events = ['ready', 'messageCreate', 'interactionCreate', 'guildCreate', 'debug', 'error']; 
        
        this.gateway.on('raw', (payload) => {
        });

        const originalEmit = this.gateway.emit.bind(this.gateway);
        
        this.gateway.emit = (event: string | symbol, ...args: any[]): boolean => {
            const result = originalEmit(event, ...args);
            
            this.emit(event, ...args);

            return result;
        };
    }

    public async login() {
        this.gateway.connect();
    }

    public destroy() {
        this.gateway.disconnect();
    }
}
