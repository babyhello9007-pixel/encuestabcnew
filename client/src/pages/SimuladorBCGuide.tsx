import { memo, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Party = { key: string; name: string; color: string };
type ProvinceModel = { census: number; validVotes: number; p: Record<string, number> };

const NO_SEATS_PARTIES = new Set(["Voto en blanco", "Votos nulos", "OTROS", "Abstención"]);
const ABS_MAJORITY = 176;

const BASE_PARTIES: Party[] = [
  { key: "PP", name: "PP", color: "#0064B0" },
  { key: "PSOE", name: "PSOE", color: "#E0001B" },
  { key: "VOX", name: "VOX", color: "#5BBE21" },
  { key: "SUMAR", name: "SUMAR", color: "#E5007E" },
  { key: "ERC", name: "ERC", color: "#F4A800" },
  { key: "JUNTS", name: "JUNTS", color: "#1E90A0" },
];

const SEATS: Record<string, number> = {
  Madrid: 37, Barcelona: 32, Valencia: 16, Alicante: 12, Sevilla: 12, Málaga: 11, Murcia: 10, Cádiz: 9,
  Baleares: 8, "A Coruña": 8, "Las Palmas": 8, Vizcaya: 8, Granada: 7, Pontevedra: 7, "S.C. Tenerife": 7,
  Zaragoza: 7, Almería: 6, Córdoba: 6, Girona: 6, Guipúzcoa: 6, Tarragona: 6, Toledo: 6, Badajoz: 5,
  Cantabria: 5, Castellón: 5, "Ciudad Real": 5, Huelva: 5, Jaén: 5, Navarra: 5, Valladolid: 5, Álava: 4,
  Albacete: 4, Burgos: 4, Cáceres: 4, León: 4, Lleida: 4, Lugo: 4, Ourense: 4, "La Rioja": 4, Salamanca: 4,
  Ávila: 3, Cuenca: 3, Guadalajara: 3, Huesca: 3, Palencia: 3, Segovia: 3, Teruel: 3, Zamora: 3, Soria: 2,
  Ceuta: 1, Melilla: 1,
};

const PROV23: Record<string, ProvinceModel> = {
  Madrid: { census: 5400000, validVotes: 3900000, p: { PP: 1470000, PSOE: 1070000, VOX: 740000, SUMAR: 620000, ERC: 1000, JUNTS: 1000, OTROS: 20000 } },
  Barcelona: { census: 4100000, validVotes: 3050000, p: { PP: 470000, PSOE: 830000, VOX: 220000, SUMAR: 640000, ERC: 450000, JUNTS: 390000, OTROS: 50000 } },
  Valencia: { census: 1900000, validVotes: 1400000, p: { PP: 640000, PSOE: 480000, VOX: 260000, SUMAR: 210000, ERC: 1000, JUNTS: 1000, OTROS: 18000 } },
  Sevilla: { census: 1500000, validVotes: 1120000, p: { PP: 340000, PSOE: 460000, VOX: 140000, SUMAR: 180000, ERC: 400, JUNTS: 400, OTROS: 12000 } },
  Málaga: { census: 1300000, validVotes: 980000, p: { PP: 390000, PSOE: 290000, VOX: 170000, SUMAR: 130000, ERC: 300, JUNTS: 300, OTROS: 9000 } },
  Alicante: { census: 1400000, validVotes: 970000, p: { PP: 390000, PSOE: 300000, VOX: 190000, SUMAR: 120000, ERC: 300, JUNTS: 300, OTROS: 12000 } },
};

function dhondt(votos: Record<string, number>, escanios: number) {
  if (!escanios || !Object.keys(votos).length) return {};
  const resultado: Record<string, number> = {};
  Object.keys(votos).forEach((p) => (resultado[p] = 0));
  const cocientes: { q: number; partido: string }[] = [];
  Object.entries(votos).forEach(([partido, numVotos]) => {
    for (let d = 1; d <= escanios; d++) cocientes.push({ q: numVotos / d, partido });
  });
  cocientes.sort((a, b) => b.q - a.q);
  for (let i = 0; i < escanios && i < cocientes.length; i++) resultado[cocientes[i].partido]++;
  return resultado;
}

function calcProv(provincia: string, simData: Record<string, ProvinceModel>) {
  const datos = simData[provincia];
  const escaniosProvincia = SEATS[provincia] || 0;
  const totalVotosValidos = Object.values(datos?.p || {}).reduce((a, b) => a + b, 0);
  const elegibles: Record<string, number> = {};
  const excluidos: string[] = [];
  Object.entries(datos?.p || {}).forEach(([p, v]) => {
    if (NO_SEATS_PARTIES.has(p) || v === 0) return;
    if (v >= totalVotosValidos * 0.03) elegibles[p] = v;
    else excluidos.push(p);
  });
  return { sa: dhondt(elegibles, escaniosProvincia), excl: excluidos, tv: totalVotosValidos };
}

function natCalc(simData: Record<string, ProvinceModel>) {
  const votosNacionales: Record<string, number> = {};
  const escanosNacionales: Record<string, number> = {};
  Object.keys(simData).forEach((prov) => {
    const { sa } = calcProv(prov, simData);
    Object.entries(simData[prov].p).forEach(([p, v]) => (votosNacionales[p] = (votosNacionales[p] || 0) + v));
    Object.entries(sa).forEach(([p, e]) => (escanosNacionales[p] = (escanosNacionales[p] || 0) + e));
  });
  return { votos: votosNacionales, escanos: escanosNacionales };
}

const MapView = memo(function MapView({ winners, onSelect, selected }: { winners: Record<string, string>; onSelect: (p: string) => void; selected: string }) {
  const provinces = Object.keys(PROV23);
  return <div className="grid grid-cols-2 gap-2 md:grid-cols-3">{provinces.map((p) => <button key={p} onClick={() => onSelect(p)} className={`rounded border p-2 text-left text-xs ${selected === p ? "border-indigo-400" : "border-slate-700"}`} style={{ background: winners[p] ? `${winners[p]}20` : "#0f172a" }}>{p}</button>)}</div>;
});

function Hemicycle({ seats, colors, onToggle, selected }: { seats: Record<string, number>; colors: Record<string, string>; onToggle: (p: string) => void; selected: Set<string> }) {
  const entries = Object.entries(seats).sort((a, b) => b[1] - a[1]);
  const dots: { p: string; color: string }[] = [];
  entries.forEach(([p, n]) => { for (let i = 0; i < n; i++) dots.push({ p, color: colors[p] || "#999" }); });
  return <svg viewBox="0 0 420 210" className="w-full rounded bg-slate-900 p-2">{dots.map((d, i) => {
    const row = Math.floor(i / 36);
    const inRow = i % 36;
    const angle = Math.PI - (inRow / 35) * Math.PI;
    const radius = 180 - row * 24;
    const cx = 210 + Math.cos(angle) * radius;
    const cy = 200 - Math.sin(angle) * radius;
    return <circle key={i} cx={cx} cy={cy} r={5} fill={d.color} opacity={selected.size === 0 || selected.has(d.p) ? 1 : 0.25} onClick={() => onToggle(d.p)} />;
  })}<line x1="30" y1="116" x2="390" y2="116" stroke="#f59e0b" strokeDasharray="4 4" /></svg>;
}

function NightModeSimulation({ onApply }: { onApply: (progress: number) => void }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headline, setHeadline] = useState("Preparado para simulación de noche electoral");
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 5);
        onApply(next);
        setHeadline(next < 30 ? "Primer avance de escrutinio" : next < 70 ? "Tendencia consolidándose" : next < 100 ? "Recta final del escrutinio" : "Escrutinio completo");
        if (next === 100) setRunning(false);
        return next;
      });
    }, 900);
    return () => clearInterval(id);
  }, [running, onApply]);
  return <div className="rounded border border-slate-700 p-3"><div className="mb-2 text-sm font-semibold">Modo noche electoral</div><div className="mb-2 text-xs text-slate-400">{headline}</div><div className="mb-2 h-2 rounded bg-slate-800"><div className="h-2 rounded bg-emerald-500" style={{ width: `${progress}%` }} /></div><button onClick={() => { setProgress(0); setRunning(true); }} className="rounded bg-emerald-700 px-3 py-1 text-xs">Iniciar simulación</button></div>;
}

export default function SimuladorBCGuide() {
  const [, setLocation] = useLocation();
  const [dark, setDark] = useState(true);
  const [simData, setSimData] = useState<Record<string, ProvinceModel>>(PROV23);
  const [selectedProv, setSelectedProv] = useState(Object.keys(PROV23)[0]);
  const [selectedCoalition, setSelectedCoalition] = useState<Set<string>>(new Set());
  const [parties, setParties] = useState<Party[]>(BASE_PARTIES);
  const [newParty, setNewParty] = useState({ key: "", color: "#9333ea" });

  const colors = useMemo(() => Object.fromEntries(parties.map((p) => [p.key, p.color])), [parties]);
  const nat = useMemo(() => natCalc(simData), [simData]);
  const winners = useMemo(() => Object.fromEntries(Object.keys(simData).map((prov) => {
    const sa = calcProv(prov, simData).sa;
    const winner = Object.entries(sa).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    return [prov, colors[winner] || "#64748b"];
  })), [simData, colors]);

  const coalitionSeats = Array.from(selectedCoalition).reduce((acc, p) => acc + (nat.escanos[p] || 0), 0);

  const addParty = () => {
    const key = newParty.key.trim().toUpperCase();
    if (!key || parties.some((p) => p.key === key)) return;
    setParties((prev) => [...prev, { key, name: key, color: newParty.color }]);
    setSimData((prev) => Object.fromEntries(Object.entries(prev).map(([prov, d]) => [prov, { ...d, p: { ...d.p, [key]: 0 } }] )));
    setNewParty({ key: "", color: "#9333ea" });
  };

  const exportData = (type: "json" | "csv") => {
    const csv = ["provincia,partido,votos", ...Object.entries(simData).flatMap(([prov, d]) => Object.entries(d.p).map(([p, v]) => `${prov},${p},${v}`))].join("\n");
    const content = type === "json" ? JSON.stringify({ simData, nat }, null, 2) : csv;
    const blob = new Blob([content], { type: type === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulador-bc.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <div className={dark ? "min-h-screen bg-slate-950 text-slate-100" : "min-h-screen bg-slate-100 text-slate-900"}>
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Simulador BC · Elecciones Generales y autonómicas</h1>
        <div className="flex gap-2">
          <button onClick={() => setDark((d) => !d)} className="rounded border border-slate-600 px-3 py-1 text-sm">{dark ? "Tema claro" : "Tema oscuro"}</button>
          <button onClick={() => exportData("json")} className="rounded border border-slate-600 px-3 py-1 text-sm">Exportar JSON</button>
          <button onClick={() => exportData("csv")} className="rounded border border-slate-600 px-3 py-1 text-sm">Exportar CSV</button>
          <button onClick={() => setLocation("/resultados")} className="rounded border border-slate-600 px-3 py-1 text-sm">Volver</button>
        </div>
      </div>

      <p className="mb-4 text-sm opacity-90">Herramienta educativa y de análisis político sin valor predictivo oficial.</p>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded border border-slate-700 p-3 lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">MapView · Mapa electoral por provincias</div>
          <MapView winners={winners} onSelect={setSelectedProv} selected={selectedProv} />
        </div>
        <NightModeSimulation onApply={() => undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border border-slate-700 p-3">
          <div className="mb-2 text-sm font-semibold">ProvinceEditor · {selectedProv}</div>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(simData[selectedProv].p).map(([p, v]) => <label key={p} className="flex items-center justify-between rounded bg-black/20 p-2 text-xs"><span>{p}</span><input type="number" value={v} onChange={(e) => setSimData((prev) => ({ ...prev, [selectedProv]: { ...prev[selectedProv], p: { ...prev[selectedProv].p, [p]: Math.max(0, Number(e.target.value || 0)) } } }))} className="w-28 rounded bg-transparent text-right"/></label>)}
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <input value={newParty.key} onChange={(e) => setNewParty((n) => ({ ...n, key: e.target.value }))} placeholder="Nuevo partido" className="rounded border border-slate-600 bg-transparent px-2 py-1"/>
            <input type="color" value={newParty.color} onChange={(e) => setNewParty((n) => ({ ...n, color: e.target.value }))} />
            <button onClick={addParty} className="rounded bg-indigo-700 px-2">Añadir partido</button>
          </div>
        </div>

        <div className="rounded border border-slate-700 p-3">
          <div className="mb-2 text-sm font-semibold">Hemicycle + CoalitionBuilder</div>
          <Hemicycle seats={nat.escanos} colors={colors} selected={selectedCoalition} onToggle={(p) => setSelectedCoalition((prev) => { const n = new Set(prev); if (n.has(p)) n.delete(p); else n.add(p); return n; })} />
          <div className="mt-2 text-sm">Coalición: <b>{coalitionSeats}</b> / {ABS_MAJORITY}</div>
          <div className={`text-xs ${coalitionSeats >= ABS_MAJORITY ? "text-emerald-400" : "text-amber-400"}`}>{coalitionSeats >= ABS_MAJORITY ? "Mayoría absoluta alcanzada" : "Sin mayoría absoluta"}</div>
        </div>
      </div>

      <div className="mt-4 rounded border border-slate-700 p-3">
        <div className="mb-2 text-sm font-semibold">Resultados nacionales</div>
        <div className="grid gap-2 md:grid-cols-3">{Object.entries(nat.escanos).sort((a, b) => b[1] - a[1]).map(([p, e]) => <div key={p} className="rounded p-2 text-sm" style={{ background: `${colors[p] || "#777"}22` }}>{p}: <b>{e}</b> escaños · {(nat.votos[p] || 0).toLocaleString("es-ES")} votos</div>)}</div>
      </div>
    </div>
  </div>;
}
