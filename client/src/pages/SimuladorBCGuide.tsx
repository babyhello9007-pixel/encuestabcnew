import { memo, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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


const AUTONOMIC_SEATS: Record<string, Record<string, number>> = {
  Andalucía: { Sevilla: 18, Málaga: 17, Cádiz: 15, Granada: 13, Almería: 12, Córdoba: 12, Huelva: 11, Jaén: 11 },
  Aragón: { Zaragoza: 35, Huesca: 18, Teruel: 14 }, Asturias: { Central: 34, Occidental: 6, Oriental: 5 },
  Baleares: { Mallorca: 33, Menorca: 13, Ibiza: 12, Formentera: 1 }, Canarias: { Tenerife: 15, "Gran Canaria": 15, Lanzarote: 8, Fuerteventura: 8, "La Palma": 8, "La Gomera": 4, "El Hierro": 3, Regional: 9 },
  Cantabria: { Cantabria: 35 }, "Castilla-La Mancha": { Toledo: 9, Albacete: 7, "Ciudad Real": 7, Cuenca: 5, Guadalajara: 5 },
  "Castilla y León": { Valladolid: 15, León: 13, Burgos: 11, Salamanca: 10, Ávila: 7, Palencia: 7, Zamora: 7, Segovia: 6, Soria: 5 },
  Cataluña: { Barcelona: 85, Tarragona: 18, Girona: 17, Lleida: 15 }, Extremadura: { Badajoz: 36, Cáceres: 29 },
  Galicia: { "A Coruña": 25, Pontevedra: 22, Lugo: 14, Ourense: 14 }, Madrid: { Madrid: 135 }, Murcia: { Murcia: 45 },
  Navarra: { Navarra: 50 }, "País Vasco": { Álava: 25, Guipúzcoa: 25, Vizcaya: 25 }, "La Rioja": { "La Rioja": 33 },
  "C. Valenciana": { Valencia: 40, Alicante: 35, Castellón: 24 }, Ceuta: { Ceuta: 25 }, Melilla: { Melilla: 25 },
};
const MUNICIPAL_SEATS: Record<string, number> = { Madrid:57, Bilbao:29, Barcelona:41, Alicante:29, Valencia:33, Córdoba:29, Sevilla:31, Valladolid:27, Zaragoza:31, "Vitoria-Gasteiz":27, Málaga:31, "A Coruña":27, Murcia:29, Granada:27, Palma:29, Oviedo:27, "Las Palmas de G.C.":29, "S.C. de Tenerife":27, Pamplona:27, Almería:27, Santander:27, "San Sebastián":27, Burgos:27, "Castellón de la Plana":27, Albacete:27, Salamanca:27, Logroño:27, Huelva:27, Badajoz:27, Cádiz:27, León:27, Jaén:27, Ourense:27, Lleida:27, Tarragona:27, Girona:27, Lugo:25, Cáceres:25, Guadalajara:25, Toledo:25, Pontevedra:25, "Ciudad Real":25, Zamora:25, Palencia:25, Ávila:25, Cuenca:25, Segovia:25, Huesca:25, Soria:21, Teruel:21, Ceuta:25, Melilla:25 };

type Arena = "generales" | "autonomicas" | "ayuntamientos";

const buildSimData = (seatsMap: Record<string, number>): Record<string, ProvinceModel> => Object.fromEntries(Object.entries(seatsMap).map(([prov, seats]) => {
  const validVotes = Math.max(60000, seats * 85000);
const PROV23: Record<string, ProvinceModel> = buildSimData(SEATS);
function calcProv(provincia: string, simData: Record<string, ProvinceModel>, seatsMap: Record<string, number>) {
  const escaniosProvincia = seatsMap[provincia] || 0;
function natCalc(simData: Record<string, ProvinceModel>, seatsMap: Record<string, number>) {
    const { sa } = calcProv(prov, simData, seatsMap);
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

const PROV_COORDS: Record<string, [number, number]> = {
  Madrid: [40.4168, -3.7038], Barcelona: [41.3874, 2.1686], Valencia: [39.4699, -0.3763],
  Sevilla: [37.3891, -5.9845], Málaga: [36.7213, -4.4214], Alicante: [38.3452, -0.4810],
};

const MapView = memo(function MapView({ winners, onSelect, selected }: { winners: Record<string, string>; onSelect: (p: string) => void; selected: string }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current).setView([40.2, -3.7], 5.7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    leafletRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); leafletRef.current = null; };
  }, []);

  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();
    Object.keys(PROV23).forEach((prov) => {
      const coords = PROV_COORDS[prov];
      if (!coords) return;
      const color = winners[prov] || "#64748b";
      const m = L.circleMarker(coords, { radius: selected === prov ? 10 : 8, color, fillColor: color, fillOpacity: 0.7, weight: 2 });
      m.bindTooltip(prov);
      m.on("click", () => onSelect(prov));
      m.addTo(markersRef.current!);
    });
  }, [winners, onSelect, selected]);

  return <div><div ref={mapRef} className="h-80 w-full rounded" /><div className="mt-1 text-[11px] text-slate-400">Leaflet | © OpenStreetMap contributors</div></div>;
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
  return <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] "><div className="mb-2 text-sm font-semibold">Modo noche electoral</div><div className="mb-2 text-xs text-slate-400">{headline}</div><div className="mb-2 h-2 rounded bg-slate-800"><div className="h-2 rounded bg-emerald-500" style={{ width: `${progress}%` }} /></div><button onClick={() => { setProgress(0); setRunning(true); }} className="rounded bg-emerald-700 px-3 py-1 text-xs">Iniciar simulación</button></div>;
}

export default function SimuladorBCGuide() {
  const [, setLocation] = useLocation();
  const [dark, setDark] = useState(true);
  const [arena, setArena] = useState<Arena>("generales");
  const [simData, setSimData] = useState<Record<string, ProvinceModel>>(PROV23);
  const currentSeats = useMemo(() => {
    if (arena === "generales") return SEATS;
    if (arena === "ayuntamientos") return MUNICIPAL_SEATS;
    return AUTONOMIC_SEATS["Andalucía"];
  }, [arena]);
  const [selectedCCAA, setSelectedCCAA] = useState("Andalucía");
  useEffect(() => {
    const seatsSource = arena === "generales" ? SEATS : arena === "ayuntamientos" ? MUNICIPAL_SEATS : (AUTONOMIC_SEATS[selectedCCAA] || AUTONOMIC_SEATS["Andalucía"]);
    setSimData(buildSimData(seatsSource));
    setSelectedProv(Object.keys(seatsSource)[0]);
  }, [arena, selectedCCAA]);
  const [selectedProv, setSelectedProv] = useState(Object.keys(PROV23)[0]);
  const [selectedCoalition, setSelectedCoalition] = useState<Set<string>>(new Set());
  const [parties, setParties] = useState<Party[]>(BASE_PARTIES);
  const [newParty, setNewParty] = useState({ key: "", color: "#9333ea" });

  const colors = useMemo(() => Object.fromEntries(parties.map((p) => [p.key, p.color])), [parties]);
  const nat = useMemo(() => natCalc(simData, currentSeats), [simData, currentSeats]);
  const winners = useMemo(() => Object.fromEntries(Object.keys(simData).map((prov) => {
    const sa = calcProv(prov, simData, currentSeats).sa;
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

  return <div className={dark ? "min-h-screen text-slate-100" : "min-h-screen text-slate-900"} style={{ background: dark ? "radial-gradient(circle at 20% 10%, #1e293b 0%, #020617 50%, #02030a 100%)" : "radial-gradient(circle at 20% 10%, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)" }}>
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button onClick={() => setDark((d) => !d)} className="rounded-xl border border-white/25 bg-white/10 px-3 py-1 text-sm backdrop-blur">{dark ? "Tema claro" : "Tema oscuro"}</button>
          <button onClick={() => exportData("json")} className="rounded-xl border border-white/25 bg-white/10 px-3 py-1 text-sm backdrop-blur">Exportar JSON</button>
          <button onClick={() => exportData("csv")} className="rounded-xl border border-white/25 bg-white/10 px-3 py-1 text-sm backdrop-blur">Exportar CSV</button>
          <button onClick={() => setLocation("/resultados")} className="rounded-xl border border-white/25 bg-white/10 px-3 py-1 text-sm backdrop-blur">Volver</button>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["generales","autonomicas","ayuntamientos"] as Arena[]).map((m) => <button key={m} onClick={() => setArena(m)} className={`rounded-xl px-3 py-1 text-sm border ${arena===m?"bg-indigo-600/80 border-indigo-300":"border-white/25 bg-white/10"}`}>{m}</button>)}
        {arena === "autonomicas" && <select value={selectedCCAA} onChange={(e) => setSelectedCCAA(e.target.value)} className="rounded-xl border border-white/25 bg-white/10 px-2 py-1 text-sm">{Object.keys(AUTONOMIC_SEATS).map((c)=><option key={c} value={c}>{c}</option>)}</select>}
      </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] lg:col-span-2">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] ">
            <input value={newParty.key} onChange={(e) => setNewParty((n) => ({ ...n, key: e.target.value }))} placeholder="Nuevo partido" className="rounded-xl border border-white/25 bg-white/10 px-2 py-1 backdrop-blur"/>
            <button onClick={addParty} className="rounded-xl bg-indigo-600/80 px-2 backdrop-blur">Añadir partido</button>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] ">

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
