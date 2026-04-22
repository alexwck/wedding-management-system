import { vi } from "vitest";

/**
 * Creates a chainable Supabase query mock that resolves to the given value.
 * Supports .select(), .insert(), .update(), .delete(), .eq(), .in(),
 * .order(), .maybeSingle(), .single(), and is thenable (Promise-compatible).
 */
export function mockFrom(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.ilike = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.upsert = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);
  // Make the chain thenable so `await` and `Promise.all` work
  chain.then = (resolve: (v: unknown) => void) => resolve(resolvedValue);
  return chain;
}

/**
 * Creates a mock Supabase admin client with `.from()` returning mockFrom chains.
 * Pass an array of resolved values to set up sequential `.from()` calls.
 */
export function createMockSupabaseClient(resolvedValues: unknown[]) {
  const fromMock = vi.fn();
  resolvedValues.forEach((val) => {
    fromMock.mockReturnValueOnce(mockFrom(val));
  });
  // Default: return empty chain for any additional calls
  fromMock.mockReturnValue(mockFrom({ data: null, error: null }));

  return {
    from: fromMock,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      admin: {
        createUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/image.png" } }),
      }),
    },
  };
}
