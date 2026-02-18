import { describe, it, expect } from 'vitest';
import { EmbedBuilder, Colors } from '../../../src/builders/EmbedBuilder';

describe('EmbedBuilder', () => {
  it('should set basic properties', () => {
    const embed = new EmbedBuilder()
      .setTitle('Test Title')
      .setDescription('Test Description')
      .setColor(Colors.Blue);

    const json = embed.toJSON();
    expect(json.title).toBe('Test Title');
    expect(json.description).toBe('Test Description');
    expect(json.color).toBe(Colors.Blue);
  });

  it('should add fields', () => {
    const embed = new EmbedBuilder()
      .addFields({ name: 'Field 1', value: 'Value 1' })
      .addField('Field 2', 'Value 2', true);

    const json = embed.toJSON();
    expect(json.fields).toHaveLength(2);
    expect(json.fields![0].name).toBe('Field 1');
    expect(json.fields![1].inline).toBe(true);
  });

  it('should handle hex colors', () => {
    const embed = new EmbedBuilder().setColor('#ffffff');
    expect(embed.toJSON().color).toBe(0xffffff);
  });

  it('should set timestamp', () => {
    const date = new Date('2023-01-01T00:00:00Z');
    const embed = new EmbedBuilder().setTimestamp(date);
    expect(embed.toJSON().timestamp).toBe(date.toISOString());
  });
});
