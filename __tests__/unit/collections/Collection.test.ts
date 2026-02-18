import { describe, it, expect } from 'vitest';
import { Collection } from '../../../src/collections/Collection';

describe('Collection', () => {
  it('should filter items', () => {
    const col = new Collection<string, number>();
    col.set('a', 1);
    col.set('b', 2);
    col.set('c', 3);

    const filtered = col.filter(v => v > 1);
    expect(filtered.size).toBe(2);
    expect(filtered.has('b')).toBe(true);
    expect(filtered.has('c')).toBe(true);
  });

  it('should map items', () => {
    const col = new Collection<string, number>();
    col.set('a', 1);
    col.set('b', 2);

    const mapped = col.map(v => v * 2);
    expect(mapped).toEqual([2, 4]);
  });

  it('should find an item', () => {
    const col = new Collection<string, number>();
    col.set('a', 1);
    col.set('b', 2);

    expect(col.find(v => v === 2)).toBe(2);
    expect(col.find(v => v === 3)).toBeUndefined();
  });

  it('should check some/every', () => {
    const col = new Collection<string, number>();
    col.set('a', 1);
    col.set('b', 2);

    expect(col.some(v => v === 1)).toBe(true);
    expect(col.every(v => v > 0)).toBe(true);
    expect(col.every(v => v > 1)).toBe(false);
  });
});
