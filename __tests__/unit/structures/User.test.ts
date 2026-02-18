import { describe, it, expect, vi } from 'vitest';
import { User } from '../../../src/structures/User';
import { Client } from '../../../src/client';
import { MockClient } from '../../mocks';

describe('User', () => {
  const mockUserData = {
    id: '123456789012345678',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
    bot: false,
    system: false,
    flags: 0,
  };

  it('should instantiate correctly', () => {
    const user = new User(MockClient as unknown as Client, mockUserData);
    expect(user.id).toBe(mockUserData.id);
    expect(user.username).toBe(mockUserData.username);
    expect(user.tag).toBe('testuser#0001');
  });

  it('should return correct mention string', () => {
    const user = new User(MockClient as unknown as Client, mockUserData);
    expect(user.toString()).toBe(`<@${mockUserData.id}>`);
  });

  it('should use globalName as displayName if present', () => {
    const user = new User(MockClient as unknown as Client, {
      ...mockUserData,
      global_name: 'Global Name'
    } as any);
    expect(user.displayName).toBe('Global Name');
  });
});
