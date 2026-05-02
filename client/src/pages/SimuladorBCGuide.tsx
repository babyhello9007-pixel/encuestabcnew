import { useLocation } from "wouter";

export default function SimuladorBCGuide() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold md:text-3xl">Simulador BC: Guía Completa de Replicación (Arquitectura React)</h1>
          <button onClick={() => setLocation("/resultados")} className="rounded-md border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">Volver a Resultados</button>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="mb-2 text-xl font-bold">1. Concepto General y Propósito</h2>
            <p>El Simulador BC es una SPA para simular resultados electorales en España (Generales y autonómicas), modificando votos provinciales para observar el impacto en tiempo real sobre el reparto de escaños con la Ley D&apos;Hondt.</p>
            <p className="mt-2 text-slate-300">Herramienta educativa y de análisis político sin valor predictivo oficial.</p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">2. Arquitectura Tecnológica</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li><b>Frontend:</b> React (Vite), TypeScript recomendado, Tailwind CSS.</li>
              <li><b>Visualización:</b> Chart.js/Recharts, SVG para hemiciclo y mapa coroplético.</li>
              <li><b>Estado:</b> Context o Zustand/Redux Toolkit. Supabase opcional para persistencia.</li>
              <li><b>Componentes:</b> MapView, Hemicycle, ProvinceEditor, CoalitionBuilder y NightModeSimulation.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">3. Lógica de Cálculo Electoral</h2>
            <p className="mb-2">Método D&apos;Hondt: <code>V / d</code>.</p>
            <p>Incluye barrera del 3% por circunscripción, cálculo provincial y agregación nacional de escaños.</p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">4. Estructura de Datos</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>SEATS por provincia.</li>
              <li>PROV23: censo, votos válidos y desglose por partido.</li>
              <li>Mapa de colores de partido.</li>
              <li>Set de partidos excluidos del reparto (nulos, blanco, etc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">5. Funcionalidades Clave</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Edición por provincia y recálculo automático.</li>
              <li>Calculadora de pactos con mayoría absoluta (176).</li>
              <li>Modo noche electoral con progreso y titulares dinámicos.</li>
              <li>Añadir partidos dinámicamente.</li>
              <li>Exportación JSON/CSV y generación de infografías PNG.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">6. UI/UX y Escalabilidad</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Hemiciclo SVG interactivo.</li>
              <li>Mapa electoral SVG con selección provincial.</li>
              <li>Tema claro/oscuro y línea visual de mayoría absoluta.</li>
              <li>Optimización con memo/useMemo y Web Workers para D&apos;Hondt.</li>
              <li>Comparación histórica y simulaciones compartibles por URL.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">7. Tablas de Referencia</h2>
            <p className="mb-2">Se incluye referencia operativa para:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Congreso de los Diputados (350 escaños por provincia).</li>
              <li>Parlamentos autonómicos y sus circunscripciones.</li>
              <li>Ayuntamientos de capitales de provincia (concejales 2023).</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
