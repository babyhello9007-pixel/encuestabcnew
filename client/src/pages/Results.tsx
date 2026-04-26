
// ─── Líderes por partido ──────────────────────────────────────────────────────
function LideresDePartidosSection({ partyMeta }: { partyMeta: Record<string, PartyMeta> }) {
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [lideresPreferidos, setLideresPreferidos] = useState<LiderPreferido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"candidatos" | "gobierno">("candidatos");
  const [logoB64, setLogoB64] = useState("");
  const [showGobModal, setShowGobModal] = useState(false);

  useEffect(() => {
    // Intentar cargar logo presidencia desde public
    fetch("/logo-presidencia-blanco.png").then(r => r.blob()).then(blob => {
      const reader = new FileReader();
      reader.onload = () => setLogoB64(reader.result as string);
      reader.readAsDataURL(blob);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: ld } = await supabase
          .from("party_leaders")
          .select(`id, party_key, leader_name, photo_url, is_active, party_configuration!inner(display_name, color, logo_url)`)
          .eq("is_active", true).order("party_key");
        const mapped: PartyLeader[] = (ld || []).map((row: any) => ({
          id: row.id, party_key: row.party_key, leader_name: row.leader_name,
          photo_url: row.photo_url, is_active: row.is_active,
          display_name: row.party_configuration?.display_name ?? row.party_key,
          color: row.party_configuration?.color ?? "#e8465a",
          logo_url: row.party_configuration?.logo_url ?? "",
        }));
        setLeaders(mapped);
        const { data: pd } = await supabase.from("lideres_preferidos").select("partido, lider_preferido");
        if (pd?.length) {
          const cnt: Record<string, Record<string, number>> = {};
          pd.forEach((r: any) => { if (!cnt[r.partido]) cnt[r.partido] = {}; cnt[r.partido][r.lider_preferido] = (cnt[r.partido][r.lider_preferido] || 0) + 1; });
          const arr: LiderPreferido[] = [];
          Object.entries(cnt).forEach(([partido, lids]: [string, Record<string, number>]) => {
            const tot = Object.values(lids).reduce((a, b) => a + b, 0);
            Object.entries(lids).forEach(([lider, votos]: [string, number]) => {
              const li = mapped.find(l => l.party_key === partido && l.leader_name === lider);
              const pi = mapped.find(l => l.party_key === partido);
              arr.push({ partido, lider_preferido: lider, votos, porcentaje: tot > 0 ? (votos / tot) * 100 : 0, photo_url: li?.photo_url, color: pi?.color, display_name: pi?.display_name ?? partido, logo_url: pi?.logo_url });
            });
          });
          setLideresPreferidos(arr);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const byParty = useMemo(() => {
    const m: Record<string, PartyLeader[]> = {};
    leaders.forEach(l => { if (!m[l.party_key]) m[l.party_key] = []; m[l.party_key].push(l); });
    return m;
  }, [leaders]);

  const prefByParty = useMemo(() => {
    const m: Record<string, LiderPreferido[]> = {};
    lideresPreferidos.forEach(l => { if (!m[l.partido]) m[l.partido] = []; m[l.partido].push(l); });
    Object.keys(m).forEach(k => m[k].sort((a, b) => b.votos - a.votos));
    return m;
  }, [lideresPreferidos]);

  const allLeadersForGov: PartyLeader[] = leaders;

  if (loading) return <div className="r-loader"><div className="r-spin" /></div>;
  const partyKeys = Object.keys(byParty);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#f0eff8", margin: 0 }}>Líderes por Partido</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="r-mode-tabs" style={{ marginBottom: 0 }}>
            <button className={`r-mode-tab${subTab === "candidatos" ? " active" : ""}`} onClick={() => setSubTab("candidatos")}>Candidatos</button>
            <button className={`r-mode-tab${subTab === "gobierno" ? " active" : ""}`} onClick={() => setSubTab("gobierno")}>Constructor de Gobierno</button>
          </div>
          {selectedParty && subTab === "candidatos" && (
            <button className="r-subtab-btn" onClick={() => setSelectedParty(null)}>← Ver todos</button>
          )}
        </div>
      </div>

      {/* Sub-tab: Gobierno */}
      {subTab === "gobierno" && (
        <div className="r-section">
          <div className="r-section-title" style={{ marginBottom: 6 }}>🏛️ Constructor de Gobierno</div>
          <p className="r-section-sub">Selecciona un partido, asigna ministros y genera una infografía oficial</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
            {partyKeys.map(pk => {
              const info = byParty[pk][0];
              const pm = partyMeta[pk] || { color: info.color, name: info.display_name, logo: info.logo_url };
              return (
                <button key={pk}
                  className="r-party-card"
                  style={{ borderColor: selectedParty === pk ? pm.color : undefined, background: selectedParty === pk ? `${pm.color}12` : undefined }}
                  onClick={() => { setSelectedParty(pk); setShowGobModal(true); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PartyLogoImg src={pm.logo || info.logo_url} name={pm.name} color={pm.color} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0eff8" }}>{pm.name}</div>
                      <div style={{ fontSize: 10, color: "#7a7990" }}>{byParty[pk].length} candidato{byParty[pk].length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <button className="r-infog-generate" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", fontSize: 14 }}
              onClick={() => setShowGobModal(true)}>
              <Building2 size={16} />Abrir Constructor de Gobierno
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab: Candidatos */}
      {subTab === "candidatos" && (
        <>
          {!selectedParty && (
            <div className="r-subtab-bar">
              {partyKeys.map(pk => {
                const info = byParty[pk][0];
                const pm = partyMeta[pk];
                const color = pm?.color || info.color;
                const name = pm?.name || info.display_name;
                const logo = pm?.logo || info.logo_url;
                const tot = (prefByParty[pk] || []).reduce((a, b) => a + b.votos, 0);
                return (
                  <button key={pk} className="r-subtab-btn" onClick={() => setSelectedParty(pk)}
                    style={{ borderColor: `${color}40`, color, background: `${color}0d` }}>
                    {logo && <img src={logo} alt={name} style={{ width: 13, height: 13, objectFit: "contain" }} onError={e => (e.currentTarget.style.display = "none")} />}
                    {name}
                    {tot > 0 && <span style={{ fontSize: 10, opacity: 0.6 }}>· {tot}v</span>}
                  </button>
                );
              })}
            </div>
          )}
          {(selectedParty ? [selectedParty] : partyKeys).map(partyKey => {
            const partyLeaders = byParty[partyKey] || [];
            const partyPrefs = prefByParty[partyKey] || [];
            const info = partyLeaders[0]; if (!info) return null;
            const pm = partyMeta[partyKey];
            const color = pm?.color || info.color;
            const name = pm?.name || info.display_name;
            const logo = pm?.logo || info.logo_url;
            const tot = partyPrefs.reduce((a, b) => a + b.votos, 0);
            const leadersWithVotes = partyLeaders.map(l => {
              const pref = partyPrefs.find(p => p.lider_preferido === l.leader_name);
              return { ...l, votos: pref?.votos ?? 0, porcentaje: pref?.porcentaje ?? 0 };
            }).sort((a, b) => b.votos - a.votos);
            const extraPrefs = partyPrefs.filter(p => !partyLeaders.some(l => l.leader_name === p.lider_preferido));
            const chartData = [...leadersWithVotes.filter(l => l.votos > 0).map(l => ({ name: l.leader_name, votos: l.votos, porcentaje: l.porcentaje })), ...extraPrefs.map(e => ({ name: e.lider_preferido, votos: e.votos, porcentaje: e.porcentaje }))].sort((a, b) => b.votos - a.votos).slice(0, 10);

            return (
              <div key={partyKey} className="r-section" style={{ borderColor: `${color}25` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <PartyLogoImg src={logo} name={name} color={color} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, color }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#7a7990" }}>{partyLeaders.length} candidato{partyLeaders.length !== 1 ? "s" : ""} · {tot > 0 ? `${tot} votos` : "Sin votos aún"}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 14, marginBottom: 16 }}>
                  {leadersWithVotes.map(leader => (
                    <div key={leader.id} style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `2px solid ${color}`, margin: "0 auto 8px" }}>
                        {leader.photo_url ? <img src={leader.photo_url} alt={leader.leader_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff" }}>{leader.leader_name.charAt(0)}</div>}
                        {leader.votos > 0 && <div style={{ position: "absolute", bottom: 0, right: 0, background: color, color: "#fff", fontSize: 8, fontWeight: 800, padding: "1px 3px", borderRadius: 100 }}>{leader.votos}</div>}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#f0eff8", marginBottom: 4, lineHeight: 1.3 }}>{leader.leader_name}</div>
                      {leader.votos > 0 ? (
                        <>
                          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                            <div style={{ height: "100%", width: `${leader.porcentaje}%`, background: color, borderRadius: 2 }} />
                          </div>
                          <div style={{ fontSize: 10, color: "#7a7990" }}>{leader.porcentaje.toFixed(1)}%</div>
                        </>
                      ) : <div style={{ fontSize: 10, color: "#5a596a" }}>Sin votos</div>}
                    </div>
                  ))}
                </div>
                {chartData.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f0eff8", marginBottom: 10 }}>Distribución de preferencias</div>
                    <ResponsiveContainer width="100%" height={Math.max(80, chartData.length * 32)}>
                      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 44, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" stroke="rgba(255,255,255,0.15)" fontSize={10} tick={{ fill: "#7a7990" }} />
                        <YAxis type="category" dataKey="name" stroke="transparent" fontSize={10} width={110} tick={{ fill: "#c0bfd8" }} />
                        <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(v: any, _: any, p: any) => [`${v} votos (${p.payload.porcentaje?.toFixed(1)}%)`, "Preferencia"]} />
                        <Bar dataKey="votos" radius={[0, 5, 5, 0]} label={{ position: "right", fontSize: 10, fill: "#7a7990", formatter: (v: number) => v > 0 ? v : "" }}>
                          {chartData.map((_, i) => <Cell key={i} fill={color} fillOpacity={Math.max(0.4, 0.9 - i * 0.07)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {extraPrefs.length > 0 && (
                      <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9 }}>
                        <div style={{ fontSize: 10, color: "#5a596a", fontWeight: 700, marginBottom: 6 }}>Otros mencionados:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {extraPrefs.map(ep => (
                            <span key={ep.lider_preferido} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 100, background: `${color}12`, border: `1px solid ${color}35`, color }}>
                              {ep.lider_preferido} · {ep.votos}v
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {showGobModal && (
        <GobiernoModal
          onClose={() => setShowGobModal(false)}
          leaders={allLeadersForGov}
          partyMeta={partyMeta}
          logoPresidenciaB64={logoB64}
        />
      )}
    </div>
  );
}

// ─── LeadersByPartyAvg ────────────────────────────────────────────────────────
function LeadersByPartyAvg({ leaderRatings, generalStats, generalPartyMap }: {
  leaderRatings: LeaderRating[];
  generalStats: PartyStats[];
  generalPartyMap: Record<string, PartyMeta>;
}) {
  const [partyAvgs, setPartyAvgs] = useState<{ partyName: string; color: string; logo: string; ratings: { name: string; avg: number }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const { data } = await supabase
          .from("respuestas")
          .select("voto_generales, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade")
          .not("voto_generales", "is", null);
        if (!data?.length) { setLoading(false); return; }
        const byP: Record<string, { sums: Record<string, number>; counts: Record<string, number> }> = {};
        const fields = ["val_feijoo", "val_sanchez", "val_abascal", "val_alvise", "val_yolanda_diaz", "val_irene_montero", "val_ayuso", "val_buxade"];
        data.forEach((row: any) => {
          const p = row.voto_generales; if (!p) return;
          if (!byP[p]) byP[p] = { sums: {}, counts: {} };
          fields.forEach(f => { if (row[f] != null) { byP[p].sums[f] = (byP[p].sums[f] || 0) + row[f]; byP[p].counts[f] = (byP[p].counts[f] || 0) + 1; } });
        });
        const result = Object.entries(byP).filter(([, d]) => Object.keys(d.sums).length > 0).map(([partyName, d]) => {
          const pm = Object.values(generalPartyMap).find(p => p.name === partyName || p.key === partyName);
          return { partyName, color: pm?.color || "#e8465a", logo: pm?.logo || "", ratings: fields.map(f => ({ name: LEADER_MAP[f]?.name || f, avg: d.counts[f] > 0 ? Math.round((d.sums[f] / d.counts[f]) * 10) / 10 : 0 })).sort((a, b) => b.avg - a.avg) };
        }).sort((a, b) => { const as_ = generalStats.find(s => s.nombre === a.partyName); const bs_ = generalStats.find(s => s.nombre === b.partyName); return (bs_?.votos || 0) - (as_?.votos || 0); }).slice(0, 8);
        setPartyAvgs(result);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch_();
  }, [generalStats, generalPartyMap]);

  if (loading) return <div className="r-loader"><div className="r-spin" /></div>;
  if (!partyAvgs.length) return null;
  const fieldOrder = ["val_feijoo", "val_sanchez", "val_abascal", "val_alvise", "val_yolanda_diaz", "val_irene_montero", "val_ayuso", "val_buxade"];
  const shortNames = ["Feijóo", "Sánchez", "Abascal", "Alvise", "Y. Díaz", "I. Montero", "Ayuso", "Buxadé"];

  return (
    <div className="r-section">
      <div className="r-section-title">Media valoraciones por partido</div>
      <p className="r-section-sub">¿Cómo valoran los votantes de cada partido a los líderes?</p>
      <div style={{ overflowX: "auto" }}>
        <table className="r-lxp-table">
          <thead>
            <tr>
              <th style={{ minWidth: 110 }}>Partido</th>
              {shortNames.map(n => <th key={n} style={{ textAlign: "center", minWidth: 60 }}>{n}</th>)}
            </tr>
          </thead>
          <tbody>
            {partyAvgs.map(p => (
              <tr key={p.partyName}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <PartyLogoImg src={p.logo} name={p.partyName} color={p.color} size={18} />
                    <span style={{ fontWeight: 700, color: p.color, fontSize: 11 }}>{p.partyName}</span>
                  </div>
                </td>
                {fieldOrder.map(f => {
                  const r = p.ratings.find(r => r.name === LEADER_MAP[f]?.name);
                  const avg = r?.avg ?? 0;
                  const color = avg >= 7 ? "#22c55e" : avg >= 4 ? "#f59e0b" : avg >= 1 ? "#e8465a" : "#5a596a";
                  return <td key={f} style={{ textAlign: "center" }}><span style={{ fontSize: 13, fontWeight: 700, color }}>{avg > 0 ? avg.toFixed(1) : "—"}</span></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
