import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { buildElectoralSummaryPdf, type ElectoralPdfContext, type ElectoralPdfParty } from "./electoralSummaryPdf";

const context: ElectoralPdfContext = {
  titulo: "Resultados de prueba",
  respuestas: 100,
  ambito: "Nacional",
  ccaa: "Todas",
  provincia: "Todas",
  edad: "Todas",
  totalEscanos: 350,
  umbral: "3%",
  tipoEleccion: "Elecciones Generales",
  notaEjecutivo: 4.2,
};

const parties: ElectoralPdfParty[] = [{
  partido: "PP",
  votos: 60,
  porcentaje: 60,
  escanos: 210,
  barometro: 205,
  mediaEncuestas: 200,
  edadMedia: 42,
  lider: "Líder de prueba",
  apoyoLider: 58,
}];

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

  it("construye el resumen en vertical y horizontal", () => {
    const portrait = buildElectoralSummaryPdf(parties, context, "portrait");
    const landscape = buildElectoralSummaryPdf(parties, context, "landscape");

    expect(portrait.internal.pageSize.getHeight()).toBeGreaterThan(portrait.internal.pageSize.getWidth());
    expect(landscape.internal.pageSize.getWidth()).toBeGreaterThan(landscape.internal.pageSize.getHeight());
    expect(portrait.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(landscape.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});
