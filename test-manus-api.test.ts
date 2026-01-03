import { describe, it, expect } from "vitest";

describe("Manus API Key Configuration", () => {
  it("should have VITE_MANUS_API_KEY configured", () => {
    const apiKey = import.meta.env.VITE_MANUS_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(typeof apiKey).toBe("string");
  });

  it("should validate API key format", () => {
    const apiKey = import.meta.env.VITE_MANUS_API_KEY;
    // API keys typically have a minimum length
    expect(apiKey.length).toBeGreaterThan(10);
  });
});
