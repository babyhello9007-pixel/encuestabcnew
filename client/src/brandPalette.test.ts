import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../..");
const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("corporate purple visual contract", () => {
  it("keeps NanoEncuesta accent, progress spinner and active button feedback purple", () => {
    const nano = readProjectFile("client/src/pages/NanoEncuestaBC.tsx");

    expect(nano).toContain("--nc-accent: #4b0082");
    expect(nano).toContain("border-top-color: #4b0082");
    expect(nano).toContain(":active");
    expect(nano).toContain("scale(0.97)");
    expect(nano).not.toContain("#e8465a");
  });

  it("keeps Results export progress and button states aligned with purple", () => {
    const results = readProjectFile("client/src/pages/Results.tsx");

    expect(results).toContain("rgba(75,0,130,.18)");
    expect(results).toContain("border-top-color: #a78bfa");
    expect(results).toContain(".r-hbtn:not(:disabled):active");
    expect(results).toContain("rgba(75,0,130,.22)");
    expect(results).not.toContain("#e8465a");
  });

  it("does not reintroduce the legacy brand red in global or related result styles", () => {
    const files = [
      "client/src/index.css",
      "client/src/components/results/CrisisCeutaSection.tsx",
      "client/src/components/TransferenciaVotoModal.tsx",
    ];

    for (const file of files) {
      expect(readProjectFile(file), file).not.toMatch(/#e8465a|rgba\(232,\s*70,\s*90/);
    }
  });
});
