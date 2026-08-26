import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

describe("integración de tablas del resumen PDF", () => {
  it("genera una tabla con la API directa de autoTable", () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Partido", "Escaños"]],
      body: [["PP", "120"]],
      startY: 20,
    });

    expect(doc.getNumberOfPages()).toBe(1);
    expect((doc as any).lastAutoTable?.finalY).toBeGreaterThan(20);
  });
});
