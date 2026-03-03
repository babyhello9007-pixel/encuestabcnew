import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock socket.io antes de importar
vi.mock("socket.io", () => {
  const mockIO = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  return {
    Server: vi.fn(() => mockIO),
  };
});

import { initializeWebSocket, emitPartyUpdate, emitPartyCreate, emitPartyDelete } from "./websocket";

describe("WebSocket Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should export initializeWebSocket function", () => {
    expect(typeof initializeWebSocket).toBe("function");
  });



  it("should export emitPartyUpdate function", () => {
    expect(typeof emitPartyUpdate).toBe("function");
  });

  it("should export emitPartyCreate function", () => {
    expect(typeof emitPartyCreate).toBe("function");
  });

  it("should export emitPartyDelete function", () => {
    expect(typeof emitPartyDelete).toBe("function");
  });

  it("should have correct function signatures", () => {
    expect(initializeWebSocket.length).toBe(1); // Takes httpServer parameter
    expect(emitPartyUpdate.length).toBe(1); // Takes data parameter
    expect(emitPartyCreate.length).toBe(1); // Takes data parameter
    expect(emitPartyDelete.length).toBe(1); // Takes partyKey parameter
  });

  it("should have all required exports", () => {
    expect(initializeWebSocket).toBeDefined();
    expect(emitPartyUpdate).toBeDefined();
    expect(emitPartyCreate).toBeDefined();
    expect(emitPartyDelete).toBeDefined();
  });
});
