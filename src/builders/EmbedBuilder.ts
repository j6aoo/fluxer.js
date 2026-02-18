import { Embed, EmbedField, EmbedFooter, EmbedAuthor, EmbedImage, EmbedThumbnail } from '../types';

export class EmbedBuilder {
    private data: Embed = {};

    constructor(data?: Embed) {
        if (data) this.data = { ...data };
    }

    setTitle(title: string): this {
        if (title.length > 256) {
            throw new RangeError('Embed title must be 256 or fewer characters');
        }
        this.data.title = title;
        return this;
    }

    setDescription(description: string): this {
        if (description.length > 4096) {
            throw new RangeError('Embed description must be 4096 or fewer characters');
        }
        this.data.description = description;
        return this;
    }

    setURL(url: string): this {
        this.data.url = url;
        return this;
    }

    setColor(color: number | string): this {
        if (typeof color === 'string') {
            // Handle hex color strings
            this.data.color = parseInt(color.replace('#', ''), 16);
        } else {
            this.data.color = color;
        }
        return this;
    }

    setTimestamp(timestamp?: Date | number | string): this {
        if (timestamp === undefined) {
            this.data.timestamp = new Date().toISOString();
        } else if (timestamp instanceof Date) {
            this.data.timestamp = timestamp.toISOString();
        } else if (typeof timestamp === 'number') {
            this.data.timestamp = new Date(timestamp).toISOString();
        } else {
            this.data.timestamp = timestamp;
        }
        return this;
    }

    setFooter(footer: { text: string; icon_url?: string }): this {
        if (footer.text.length > 2048) {
            throw new RangeError('Embed footer text must be 2048 or fewer characters');
        }
        this.data.footer = footer;
        return this;
    }

    setImage(url: string): this {
        this.data.image = { url };
        return this;
    }

    setThumbnail(url: string): this {
        this.data.thumbnail = { url };
        return this;
    }

    setAuthor(author: { name: string; url?: string; icon_url?: string }): this {
        if (author.name.length > 256) {
            throw new RangeError('Embed author name must be 256 or fewer characters');
        }
        this.data.author = author;
        return this;
    }

    addFields(...fields: EmbedField[]): this {
        if (!this.data.fields) this.data.fields = [];
        
        // Validate field limits
        if (this.data.fields.length + fields.length > 25) {
            throw new RangeError('Embeds can have a maximum of 25 fields');
        }
        
        // Validate each field
        for (const field of fields) {
            if (field.name.length > 256) {
                throw new RangeError('Embed field name must be 256 or fewer characters');
            }
            if (field.value.length > 1024) {
                throw new RangeError('Embed field value must be 1024 or fewer characters');
            }
        }
        
        this.data.fields.push(...fields);
        return this;
    }

    addField(name: string, value: string, inline?: boolean): this {
        if (name.length > 256) {
            throw new RangeError('Embed field name must be 256 or fewer characters');
        }
        if (value.length > 1024) {
            throw new RangeError('Embed field value must be 1024 or fewer characters');
        }
        return this.addFields({ name, value, inline });
    }

    setFields(...fields: EmbedField[]): this {
        if (fields.length > 25) {
            throw new RangeError('Embeds can have a maximum of 25 fields');
        }
        
        // Validate each field
        for (const field of fields) {
            if (field.name.length > 256) {
                throw new RangeError('Embed field name must be 256 or fewer characters');
            }
            if (field.value.length > 1024) {
                throw new RangeError('Embed field value must be 1024 or fewer characters');
            }
        }
        
        this.data.fields = fields;
        return this;
    }

    spliceFields(index: number, deleteCount: number, ...fields: EmbedField[]): this {
        if (!this.data.fields) this.data.fields = [];
        
        // Check if adding these fields would exceed the limit
        const newLength = this.data.fields.length - deleteCount + fields.length;
        if (newLength > 25) {
            throw new RangeError('Embeds can have a maximum of 25 fields');
        }
        
        // Validate each new field
        for (const field of fields) {
            if (field.name.length > 256) {
                throw new RangeError('Embed field name must be 256 or fewer characters');
            }
            if (field.value.length > 1024) {
                throw new RangeError('Embed field value must be 1024 or fewer characters');
            }
        }
        
        this.data.fields.splice(index, deleteCount, ...fields);
        return this;
    }

    toJSON(): Embed {
        return { ...this.data };
    }

    /** Static helper: create a simple embed */
    static from(data: Embed): EmbedBuilder {
        return new EmbedBuilder(data);
    }
}

/** Some common colors for embeds */
export const Colors = {
    Default: 0x000000,
    White: 0xffffff,
    Aqua: 0x1abc9c,
    Green: 0x57f287,
    Blue: 0x3498db,
    Yellow: 0xfee75c,
    Purple: 0x9b59b6,
    LuminousVividPink: 0xe91e63,
    Fuchsia: 0xeb459e,
    Gold: 0xf1c40f,
    Orange: 0xe67e22,
    Red: 0xed4245,
    Grey: 0x95a5a6,
    Navy: 0x34495e,
    DarkAqua: 0x11806a,
    DarkGreen: 0x1f8b4c,
    DarkBlue: 0x206694,
    DarkPurple: 0x71368a,
    DarkVividPink: 0xad1457,
    DarkGold: 0xc27c0e,
    DarkOrange: 0xa84300,
    DarkRed: 0x992d22,
    DarkGrey: 0x979c9f,
    DarkerGrey: 0x7f8c8d,
    LightGrey: 0xbcc0c0,
    DarkNavy: 0x2c3e50,
    Blurple: 0x5865f2,
    Greyple: 0x99aab5,
    DarkButNotBlack: 0x2c2f33,
    NotQuiteBlack: 0x23272a,
} as const;
