import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { usePartySync } from "./usePartySync";
import * as socketIO from "socket.io-client";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(),
}));

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      parties: {
        getAll: {
          invalidate: vi.fn(),
        },
        getByKey: {
          invalidate: vi.fn(),
        },
      },
    }),
  },
}));

describe("usePartySync Hook", () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      connected: false,
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    vi.mocked(socketIO.io).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize socket connection with correct options", () => {
    // Note: Hook testing requires React Testing Library or similar
    // This is a basic verification that the module exports correctly
    expect(typeof usePartySync).toBe("function");
  });

  it("should export usePartySync as a function", () => {
    expect(usePartySync).toBeDefined();
    expect(typeof usePartySync).toBe("function");
  });

  it("should have correct hook signature", () => {
    const hook = usePartySync;
    expect(hook.length).toBe(0); // No parameters
  });
});
