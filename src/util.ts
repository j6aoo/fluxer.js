export const FLUXER_EPOCH = 1420070400000n;

export function snowflakeToTimestamp(snowflake: string): number {
    const timestamp = (BigInt(snowflake) >> 22n) + FLUXER_EPOCH;
    return Number(timestamp);
}

export function timestampToSnowflake(timestamp: number): string {
    const snowflake = (BigInt(timestamp) - FLUXER_EPOCH) << 22n;
    return snowflake.toString();
}

export function getDefaultAvatarUrl(userId: string): string {
    const index = Number(BigInt(userId) % 6n);
    return `https://fluxerstatic.com/avatars/${index}.png`;
}

export function getUserAvatarUrl(userId: string, hash: string, options: { size?: number, format?: 'png' | 'jpeg' | 'webp' | 'gif', quality?: 'high' | 'low' | 'lossless' } = {}): string {
    const format = options.format || 'webp';
    const params = new URLSearchParams();
    if (options.size) params.append('size', options.size.toString());
    if (options.quality) params.append('quality', options.quality);
    
    return `https://fluxerusercontent.com/avatars/${userId}/${hash}.${format}?${params.toString()}`;
}

export function getGuildIconUrl(guildId: string, hash: string, options: { size?: number, format?: 'png' | 'jpeg' | 'webp' | 'gif', quality?: 'high' | 'low' | 'lossless' } = {}): string {
    const format = options.format || 'webp';
    const params = new URLSearchParams();
    if (options.size) params.append('size', options.size.toString());
    if (options.quality) params.append('quality', options.quality);

    return `https://fluxerusercontent.com/icons/${guildId}/${hash}.${format}?${params.toString()}`;
}
