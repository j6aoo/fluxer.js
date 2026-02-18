import type { ImageURLOptions } from '../types';

export const CDN_BASE = 'https://fluxerusercontent.com';
export const STATIC_CDN_BASE = 'https://fluxerstatic.com';

export const CDN = {
    CDN_BASE,
    STATIC_CDN_BASE,
    avatarURL,
    defaultAvatarURL,
    guildIconURL,
    guildBannerURL,
    emojiURL,
    stickerURL,
    attachmentURL,
};

function buildCDNUrl(path: string, options: ImageURLOptions = {}): string {
    const format = options.format || 'webp';
    const params = new URLSearchParams();
    if (options.size) params.append('size', options.size.toString());
    if (options.quality) params.append('quality', options.quality);
    if (options.animated) params.append('animated', 'true');
    const qs = params.toString();
    return `${CDN_BASE}/${path}.${format}${qs ? `?${qs}` : ''}`;
}

export function avatarURL(userId: string, avatar: string | null, options: ImageURLOptions = {}): string {
    if (!avatar) return defaultAvatarURL(userId);
    if (!options.format && avatar.startsWith('a_')) {
        options = { ...options, format: 'gif' };
    }
    return buildCDNUrl(`avatars/${userId}/${avatar}`, options);
}

export function defaultAvatarURL(userId: string): string {
    const index = Number(BigInt(userId) % 6n);
    return `${STATIC_CDN_BASE}/avatars/${index}.png`;
}

export function guildIconURL(guildId: string, icon: string | null, options: ImageURLOptions = {}): string {
    if (!icon) return '';
    if (!options.format && icon.startsWith('a_')) {
        options = { ...options, format: 'gif' };
    }
    return buildCDNUrl(`icons/${guildId}/${icon}`, options);
}

export function guildBannerURL(guildId: string, banner: string | null, options: ImageURLOptions = {}): string {
    if (!banner) return '';
    return buildCDNUrl(`banners/${guildId}/${banner}`, options);
}

export function emojiURL(emojiId: string, options: ImageURLOptions = {}): string {
    return buildCDNUrl(`emojis/${emojiId}`, options);
}

export function stickerURL(stickerId: string): string {
    return `${CDN_BASE}/stickers/${stickerId}.png`;
}

export function attachmentURL(channelId: string, messageId: string, filename: string): string {
    const safeFilename = encodeURIComponent(filename);
    return `${CDN_BASE}/attachments/${channelId}/${messageId}/${safeFilename}`;
}
