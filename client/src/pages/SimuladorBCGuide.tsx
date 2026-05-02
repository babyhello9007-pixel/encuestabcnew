import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type PartyKey = "PP" | "PSOE" | "VOX" | "SUMAR" | "ERC" | "JUNTS";

type ProvinceData = {
  seats: number;
  votes: Record<PartyKey, number>;
};

const COLORS: Record<PartyKey, string> = {
  PP: "#0064B0",
  PSOE: "#E0001B",
  VOX: "#5BBE21",
  SUMAR: "#E5007E",
  ERC: "#F4A800",
  JUNTS: "#1E90A0",
};

const PROVINCES: Record<string, ProvinceData> = {
  Madrid: { seats: 37, votes: { PP: 1470000, PSOE: 1070000, VOX: 740000, SUMAR: 620000, ERC: 2000, JUNTS: 2000 } },
  Barcelona: { seats: 32, votes: { PP: 470000, PSOE: 830000, VOX: 220000, SUMAR: 640000, ERC: 450000, JUNTS: 390000 } },
  Valencia: { seats: 16, votes: { PP: 640000, PSOE: 480000, VOX: 260000, SUMAR: 210000, ERC: 1000, JUNTS: 1000 } },
  Sevilla: { seats: 12, votes: { PP: 340000, PSOE: 460000, VOX: 140000, SUMAR: 180000, ERC: 400, JUNTS: 400 } },
  Málaga: { seats: 11, votes: { PP: 390000, PSOE: 290000, VOX: 170000, SUMAR: 130000, ERC: 300, JUNTS: 300 } },
  Alicante: { seats: 12, votes: { PP: 390000, PSOE: 300000, VOX: 190000, SUMAR: 120000, ERC: 300, JUNTS: 300 } },
};

function dhondt(votes: Record<string, number>, seats: number) {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const eligible = Object.entries(votes).filter(([, v]) => total > 0 && v / total >= 0.03);
  const result: Record<string, number> = {};
  eligible.forEach(([k]) => (result[k] = 0));
  const q: { party: string; score: number }[] = [];
  eligible.forEach(([party, v]) => {
    for (let d = 1; d <= seats; d++) q.push({ party, score: v / d });
  });
  q.sort((a, b) => b.score - a.score);
  for (let i = 0; i < Math.min(seats, q.length); i++) result[q[i].party]++;
  return result;
}

function PartyBar({ name, seats, max }: { name: string; seats: number; max: number }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-sm"><span>{name}</span><span>{seats}</span></div>
      <div className="h-2 rounded bg-slate-700"><div className="h-2 rounded" style={{ width: `${max ? (seats / max) * 100 : 0}%`, background: COLORS[name as PartyKey] || "#999" }} /></div>
    </div>
  );
}

export default function SimuladorBCGuide() {
  const [, setLocation] = useLocation();
  const [selectedProvince, setSelectedProvince] = useState(Object.keys(PROVINCES)[0]);
  const [provinceData, setProvinceData] = useState<Record<string, ProvinceData>>(PROVINCES);
  const [coalition, setCoalition] = useState<Set<string>>(new Set());

  const nationalSeats = useMemo(() => {
    const out: Record<string, number> = {};
    Object.values(provinceData).forEach((prov) => {
      const seatResult = dhondt(prov.votes, prov.seats);
      Object.entries(seatResult).forEach(([p, s]) => (out[p] = (out[p] || 0) + s));
    });
    return out;
  }, [provinceData]);

  const nationalVotes = useMemo(() => {
    const out: Record<string, number> = {};
    Object.values(provinceData).forEach((prov) => {
      Object.entries(prov.votes).forEach(([p, v]) => (out[p] = (out[p] || 0) + v));
    });
    return out;
  }, [provinceData]);

  const totalSeats = Object.values(nationalSeats).reduce((a, b) => a + b, 0);
  const majority = Math.floor(totalSeats / 2) + 1;
  const coalitionSeats = [...coalition].reduce((a, p) => a + (nationalSeats[p] || 0), 0);
  const maxSeats = Math.max(...Object.values(nationalSeats), 1);

  const provinceSeatBreakdown = useMemo(() => dhondt(provinceData[selectedProvince].votes, provinceData[selectedProvince].seats), [provinceData, selectedProvince]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Simulador BC (Implementación React)</h1>
          <button onClick={() => setLocation("/resultados")} className="rounded border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">Volver</button>
        </div>

        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <h2 className="mb-2 text-lg font-bold">Editor provincial</h2>
          <div className="mb-3 flex gap-2">
            {Object.keys(provinceData).map((prov) => (
              <button key={prov} onClick={() => setSelectedProvince(prov)} className={`rounded px-2 py-1 text-sm ${prov === selectedProvince ? "bg-indigo-600" : "bg-slate-700"}`}>{prov}</button>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(provinceData[selectedProvince].votes).map(([party, votes]) => (
              <label key={party} className="flex items-center justify-between rounded bg-slate-800 p-2 text-sm">
                <span>{party}</span>
                <input
                  type="number"
                  value={votes}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value || 0));
                    setProvinceData((prev) => ({
                      ...prev,
                      [selectedProvince]: {
                        ...prev[selectedProvince],
                        votes: { ...prev[selectedProvince].votes, [party]: value as number },
                      },
                    }));
                  }}
                  className="w-32 rounded bg-slate-900 px-2 py-1 text-right"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-bold">Resultado nacional (D&apos;Hondt + barrera 3%)</h2>
            {Object.entries(nationalSeats).sort((a, b) => b[1] - a[1]).map(([p, s]) => (
              <PartyBar key={p} name={p} seats={s} max={maxSeats} />
            ))}
            <div className="mt-2 text-xs text-slate-400">Mayoría absoluta: {majority}</div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-bold">Coalition Builder</h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {Object.keys(nationalSeats).map((p) => {
                const active = coalition.has(p);
                return (
                  <button
                    key={p}
                    onClick={() => setCoalition((prev) => {
                      const next = new Set(prev);
                      if (next.has(p)) next.delete(p); else next.add(p);
                      return next;
                    })}
                    className={`rounded px-2 py-1 text-sm ${active ? "bg-emerald-600" : "bg-slate-700"}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <div className="text-sm">Escaños coalición: <b>{coalitionSeats}</b> / {majority}</div>
            <div className={`mt-2 text-sm font-semibold ${coalitionSeats >= majority ? "text-emerald-400" : "text-amber-300"}`}>
              {coalitionSeats >= majority ? "✅ Supera mayoría absoluta" : "⚠️ No alcanza mayoría absoluta"}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <h2 className="mb-2 text-lg font-bold">Detalle de {selectedProvince}</h2>
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(provinceSeatBreakdown).map(([p, s]) => (
              <div key={p} className="rounded bg-slate-800 p-2 text-sm">{p}: <b>{s}</b> escaños</div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Votos nacionales agregados: {Object.values(nationalVotes).reduce((a, b) => a + b, 0).toLocaleString("es-ES")}
          </div>
        </div>
      </div>
    </div>
  );
}
