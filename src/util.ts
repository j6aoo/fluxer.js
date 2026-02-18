import { CDN_URL, STATIC_URL } from './consts';
import type { ImageURLOptions } from './types';

// Fluxer uses the same epoch as Discord for Snowflake IDs
// This is the epoch from January 1, 2015 (Discord/Fluxer standard)
export const FLUXER_EPOCH = 1420070400000n;

export function snowflakeToTimestamp(snowflake: string): number {
    const timestamp = (BigInt(snowflake) >> 22n) + FLUXER_EPOCH;
    return Number(timestamp);
}

export function timestampToSnowflake(timestamp: number): string {
    const snowflake = (BigInt(timestamp) - FLUXER_EPOCH) << 22n;
    return snowflake.toString();
}

export function getCreationDate(snowflake: string): Date {
    return new Date(snowflakeToTimestamp(snowflake));
}

function buildCDNUrl(path: string, options: ImageURLOptions = {}): string {
    const format = options.format || 'webp';
    const params = new URLSearchParams();
    if (options.size) params.append('size', options.size.toString());
    if (options.quality) params.append('quality', options.quality);
    if (options.animated) params.append('animated', 'true');
    const qs = params.toString();
    return `${CDN_URL}/${path}.${format}${qs ? `?${qs}` : ''}`;
}

export function getDefaultAvatarUrl(userId: string): string {
    const index = Number(BigInt(userId) % 6n);
    return `${STATIC_URL}/avatars/${index}.png`;
}

export function getUserAvatarUrl(userId: string, hash: string, options: ImageURLOptions = {}): string {
    if (!options.format && hash.startsWith('a_')) {
        options = { ...options, format: 'gif' };
    }
    return buildCDNUrl(`avatars/${userId}/${hash}`, options);
}

export function getUserBannerUrl(userId: string, hash: string, options: ImageURLOptions = {}): string {
    if (!options.format && hash.startsWith('a_')) {
        options = { ...options, format: 'gif' };
    }
    return buildCDNUrl(`banners/${userId}/${hash}`, options);
}

export function getGuildIconUrl(guildId: string, hash: string, options: ImageURLOptions = {}): string {
    if (!options.format && hash.startsWith('a_')) {
        options = { ...options, format: 'gif' };
    }
    return buildCDNUrl(`icons/${guildId}/${hash}`, options);
}

export function getGuildBannerUrl(guildId: string, hash: string, options: ImageURLOptions = {}): string {
    return buildCDNUrl(`banners/${guildId}/${hash}`, options);
}

export function getGuildSplashUrl(guildId: string, hash: string, options: ImageURLOptions = {}): string {
    return buildCDNUrl(`splashes/${guildId}/${hash}`, options);
}

export function getEmojiUrl(emojiId: string, options: ImageURLOptions = {}): string {
    return buildCDNUrl(`emojis/${emojiId}`, options);
}

export function getStickerUrl(stickerId: string, options: Omit<ImageURLOptions, 'quality' | 'animated'> = {}): string {
    const format = options.format || 'webp';
    const params = new URLSearchParams();
    if (options.size) params.append('size', options.size.toString());
    const qs = params.toString();
    return `${CDN_URL}/stickers/${stickerId}.${format}${qs ? `?${qs}` : ''}`;
}

/**
 * Resolves an emoji to a string for API requests.
 */
export function resolveEmoji(emoji: any): string {
    if (typeof emoji === 'string') return emoji;
    if (emoji.id) return `${emoji.animated ? 'a:' : ''}${emoji.name}:${emoji.id}`;
    return emoji.name;
}

export type { ImageURLOptions } from './types';
