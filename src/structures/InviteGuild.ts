import { getGuildBannerUrl, getGuildIconUrl, getGuildSplashUrl } from '../util';
import type { ImageURLOptions } from '../types';

export interface InviteGuildData {
    id: string;
    name: string;
    splash: string | null;
    banner: string | null;
    description: string | null;
    icon: string | null;
    features: string[];
    verification_level: number;
    vanity_url_code: string | null;
}

export class InviteGuild {
    public id: string;
    public name: string;
    public splash: string | null;
    public banner: string | null;
    public description: string | null;
    public icon: string | null;
    public features: string[];
    public verificationLevel: number;
    public vanityUrlCode: string | null;

    constructor(data: InviteGuildData) {
        this.id = data.id;
        this.name = data.name;
        this.splash = data.splash;
        this.banner = data.banner;
        this.description = data.description;
        this.icon = data.icon;
        this.features = data.features || [];
        this.verificationLevel = data.verification_level;
        this.vanityUrlCode = data.vanity_url_code;
    }

    iconURL(options: ImageURLOptions = {}): string | null {
        if (!this.icon) return null;
        return getGuildIconUrl(this.id, this.icon, options);
    }

    bannerURL(options: ImageURLOptions = {}): string | null {
        if (!this.banner) return null;
        return getGuildBannerUrl(this.id, this.banner, options);
    }

    splashURL(options: ImageURLOptions = {}): string | null {
        if (!this.splash) return null;
        return getGuildSplashUrl(this.id, this.splash, options);
    }
}
