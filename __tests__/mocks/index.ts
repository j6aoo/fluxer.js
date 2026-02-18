import { vi } from 'vitest';

export const MockClient = {
  token: 'mock-token',
  options: {},
  rest: vi.fn(),
  ws: vi.fn(),
  users: {
    cache: {
      get: vi.fn(),
      set: vi.fn(),
    }
  },
  guilds: {
    cache: {
      get: vi.fn(),
      set: vi.fn(),
    }
  },
  channels: {
    cache: {
      get: vi.fn(),
      set: vi.fn(),
    }
  },
  on: vi.fn(),
  emit: vi.fn(),
};

export const MockRestClient = {
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

export const MockGatewayShard = {
  id: 0,
  send: vi.fn(),
  connect: vi.fn(),
  destroy: vi.fn(),
};

export const MockGuild = {
  id: '123456789012345678',
  name: 'Mock Guild',
  ownerId: '123456789012345678',
};

export const MockUser = {
  id: '123456789012345678',
  username: 'MockUser',
  discriminator: '0001',
  avatar: null,
  bot: false,
};

export const MockMessage = {
  id: '123456789012345678',
  content: 'Hello World',
  author: MockUser,
  channelId: '123456789012345678',
  guildId: '123456789012345678',
};

export const MockChannel = {
  id: '123456789012345678',
  type: 0,
  name: 'mock-channel',
};

export const MockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
};
