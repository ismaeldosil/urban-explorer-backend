// Test setup file for Vitest
// This file runs before each test file

import { vi } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
