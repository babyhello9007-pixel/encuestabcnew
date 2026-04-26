import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import { calcularEscanosGeneralesPorProvincia, obtenerEstadisticas } from "@/lib/dhondt";

interface SimulatorProps {
  generalStats: any[];
  generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }>;
  votosPorProvincia: Record<string, Record<string, number>>;
}

interface CustomParty {
  key: string;
  name: string;
  color: string;
}

export default function ElectoralSimulator({ generalStats, generalPartyMap, votosPorProvincia }: SimulatorProps) {
  const [mode, setMode] = useState<"nacional" | "circunscripcion">("nacional");
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [provinciaVotes, setProvinciaVotes] = useState<Record<string, Record<string, number>>>({});
  const [selectedCirc, setSelectedCirc] = useState("");
  const [customParties, setCustomParties] = useState<CustomParty[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState("#7c3aed");
  const [initialized, setInitialized] = useState(false);

  // Inicializar con datos reales
  useEffect(() => {
    if (generalStats.length > 0 && !initialized) {
      const base: Record<string, number> = {};
      generalStats.forEach(p => {
        base[p.id] = p.votos;
      });
      setSimulatorVotes(base);

      const provBase: Record<string, Record<string, number>> = {};
      Object.entries(votosPorProvincia).forEach(([prov, data]) => {
        provBase[prov] = { ...data };
      });
      setProvinciaVotes(provBase);
      setInitialized(true);
    }
  }, [generalStats, votosPorProvincia, initialized]);

  const simulatorPartyMap = useMemo(() => {
    const m = { ...generalPartyMap };
    customParties.forEach(p => {
      m[p.key] = { key: p.key, name: p.name, color: p.color, logo: "" };
    });
    return m;
  }, [generalPartyMap, customParties]);

  // Calcular votos efectivos por provincia
  const effectiveVotesByProvince = useMemo(() => {
    if (!Object.keys(votosPorProvincia).length) return {};
    
    const totalNac = Object.values(simulatorVotes).reduce((a, v) => a + Math.max(0, v || 0), 0);
    if (totalNac === 0) return {};

    const shares = Object.entries(simulatorVotes).reduce<Record<string, number>>((acc, [p, v]) => {
      acc[p] = Math.max(0, v || 0) / totalNac;
      return acc;
    }, {});

    const result: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([prov, realVotes]) => {
      if (provinciaVotes[prov]) {
        result[prov] = { ...provinciaVotes[prov] };
        customParties.forEach(cp => {
          if (result[prov][cp.key] === undefined) result[prov][cp.key] = 0;
        });
      } else {
        const provTotal = Object.values(realVotes).reduce((a, v) => a + v, 0);
        const sim: Record<string, number> = {};
        Object.entries(shares).forEach(([p, share]) => {
          sim[p] = Math.round(provTotal * share);
        });
        result[prov] = sim;
      }
    });
    return result;
  }, [votosPorProvincia, simulatorVotes, provinciaVotes, customParties]);

  // Calcular escaños por provincia
  const simulatorEscanosByProvince = useMemo(() => {
    if (!Object.keys(effectiveVotesByProvince).length) return {};
    return calcularEscanosGeneralesPorProvincia(effectiveVotesByProvince);
  }, [effectiveVotesByProvince]);

  // Calcular estadísticas finales
  const simulatorStats = useMemo(() => {
    const escanosTotales: Record<string, number> = {};
    Object.values(simulatorEscanosByProvince).forEach(pe => {
      Object.entries(pe).forEach(([p, e]: [string, any]) => {
        escanosTotales[p] = (escanosTotales[p] || 0) + (e as number);
      });
    });

    const nv: Record<string, number> = {};
    Object.entries(simulatorVotes).forEach(([k, v]) => {
      nv[k] = Math.max(0, Math.floor(v || 0));
    });

    const nombres: Record<string, string> = {};
    const logos: Record<string, string> = {};
    Object.entries(simulatorPartyMap).forEach(([k, p]) => {
      nombres[k] = p.name;
      logos[k] = p.logo;
    });

    return obtenerEstadisticas(nv, escanosTotales, nombres, logos).map(s => ({
      ...s,
      color: simulatorPartyMap[s.id]?.color || "#e8465a"
    }));
  }, [simulatorEscanosByProvince, simulatorVotes, simulatorPartyMap]);

  const addCustomParty = () => {
    const name = newPartyName.trim();
    if (!name) return;

    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();

    const baseKey = slug || `PARTY_${Date.now()}`;
    const key = simulatorPartyMap[baseKey] ? `${baseKey}_${Date.now()}` : baseKey;

    setCustomParties(prev => [...prev, { key, name, color: newPartyColor }]);
    setSimulatorVotes(prev => ({ ...prev, [key]: 0 }));
    setNewPartyName("");
  };

  const removeCustomParty = (key: string) => {
    setCustomParties(prev => prev.filter(p => p.key !== key));
    setSimulatorVotes(prev => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const resetToOriginal = () => {
    const base: Record<string, number> = {};
    generalStats.forEach(p => {
      base[p.id] = p.votos;
    });
    setSimulatorVotes(base);

    const provBase: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([prov, data]) => {
      provBase[prov] = { ...data };
    });
    setProvinciaVotes(provBase);
    setCustomParties([]);
  };

  const totalSimVotes = Object.values(simulatorVotes).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const basePartyEntries = Object.entries(simulatorPartyMap).filter(
    ([k]) => !customParties.find(cp => cp.key === k)
  );
  const availableCircs = Object.keys(votosPorProvincia).sort();
  const circVotos = selectedCirc ? (provinciaVotes[selectedCirc] || {}) : {};
  const circTotal = Object.values(circVotos).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const totalEscanos = simulatorStats.reduce((a, s) => a + s.escanos, 0);
  const mayoriaAbs = Math.floor(totalEscanos / 2) + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Control Panel */}
      <div style={{
        background: "#0d0d14",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden"
      }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 800,
              color: "#f0eff8",
              margin: "0 0 2px"
            }}>
              Simulador Electoral
            </h2>
            <p style={{ fontSize: 12, color: "#7a7990", margin: 0 }}>
              Modifica los votos y observa cómo cambia el reparto de escaños en tiempo real
            </p>
          </div>
          <button
            onClick={resetToOriginal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#7a7990",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f0eff8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#7a7990";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <RefreshCw size={13} />
            Restaurar datos reales
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Mode Tabs */}
          <div style={{
            display: "flex",
            gap: 2,
            padding: 3,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
            width: "fit-content",
            marginBottom: 20
          }}>
            {(["nacional", "circunscripcion"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  background: mode === m ? "#e8465a" : "transparent",
                  color: mode === m ? "#fff" : "#7a7990",
                  cursor: "pointer",
                  transition: "all 0.18s"
                }}
              >
                {m === "nacional" ? "Nacional" : "Por Circunscripción"}
              </button>
            ))}
          </div>

          {mode === "nacional" && (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 16,
                fontSize: 13,
                color: "#7a7990"
              }}>
                <span>Total votos:</span>
                <strong style={{ color: "#e8465a", fontSize: 16 }}>
                  {totalSimVotes.toLocaleString("es-ES")}
                </strong>
                <span style={{ marginLeft: "auto", fontSize: 11 }}>
                  Los cambios se proyectan proporcionalmente a todas las provincias
                </span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                marginBottom: 20
              }}>
                {basePartyEntries.map(([partyKey, party]) => {
                  const votes = simulatorVotes[partyKey] ?? 0;
                  const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      key={partyKey}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        transition: "border-color 0.18s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                      }}
                    >
                      {party.logo ? (
                        <img src={party.logo} alt={party.name} style={{
                          width: 24,
                          height: 24,
                          objectFit: "contain",
                          borderRadius: 4,
                          flexShrink: 0
                        }} />
                      ) : (
                        <span style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: party.color,
                          flexShrink: 0,
                          display: "inline-block"
                        }} />
                      )}
                      <span style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#f0eff8",
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {party.name}
                      </span>
                      <div style={{
                        width: 50,
                        height: 3,
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 2,
                        overflow: "hidden",
                        flexShrink: 0
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.min(100, parseFloat(pct) * 3)}%`,
                          background: party.color,
                          borderRadius: 2
                        }} />
                      </div>
                      <span style={{
                        fontSize: 11,
                        color: "#7a7990",
                        minWidth: 32,
                        textAlign: "right"
                      }}>
                        {pct}%
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={votes}
                        onChange={e => setSimulatorVotes(prev => ({
                          ...prev,
                          [partyKey]: Math.max(0, Number(e.target.value) || 0)
                        }))}
                        style={{
                          width: 80,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 7,
                          padding: "5px 8px",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#f0eff8",
                          fontFamily: "inherit",
                          outline: "none",
                          flexShrink: 0,
                          transition: "border-color 0.18s",
                          cursor: "text"
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#e8465a";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      />
                    </div>
                  );
                })}

                {customParties.map(party => {
                  const votes = simulatorVotes[party.key] ?? 0;
                  const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      key={party.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px dashed rgba(255,255,255,0.07)",
                        borderRadius: 10,
                        padding: "10px 14px"
                      }}
                    >
                      <span style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: party.color,
                        flexShrink: 0,
                        display: "inline-block"
                      }} />
                      <span style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#f0eff8"
                      }}>
                        {party.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#7a7990", minWidth: 32, textAlign: "right" }}>
                        {pct}%
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={votes}
                        onChange={e => setSimulatorVotes(prev => ({
                          ...prev,
                          [party.key]: Math.max(0, Number(e.target.value) || 0)
                        }))}
                        style={{
                          width: 80,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 7,
                          padding: "5px 8px",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#f0eff8",
                          fontFamily: "inherit",
                          outline: "none",
                          flexShrink: 0
                        }}
                      />
                      <button
                        onClick={() => removeCustomParty(party.key)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#5a596a",
                          cursor: "pointer",
                          padding: 4,
                          transition: "color 0.18s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#e8465a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#5a596a";
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Party */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "16px 20px",
                marginTop: 16
              }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#5a596a",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <Plus size={14} />
                  Añadir partido personalizado
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Nombre del partido"
                    value={newPartyName}
                    onChange={e => setNewPartyName(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 13,
                      color: "#f0eff8",
                      fontFamily: "inherit",
                      outline: "none"
                    }}
                  />
                  <input
                    type="color"
                    value={newPartyColor}
                    onChange={e => setNewPartyColor(e.target.value)}
                    style={{
                      width: 40,
                      height: 36,
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      cursor: "pointer"
                    }}
                  />
                  <button
                    onClick={addCustomParty}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "8px 16px",
                      background: "#e8465a",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "background 0.18s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ff6b7a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#e8465a";
                    }}
                  >
                    <Plus size={14} />
                    Añadir
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === "circunscripcion" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <select
                  value={selectedCirc}
                  onChange={e => setSelectedCirc(e.target.value)}
                  style={{
                    maxWidth: 300,
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: "#f0eff8",
                    fontFamily: "inherit",
                    outline: "none",
                    appearance: "none"
                  }}
                >
                  <option value="">— Selecciona una provincia —</option>
                  {availableCircs.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {selectedCirc ? (
                <div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    fontSize: 13,
                    color: "#f59e0b",
                    marginBottom: 14
                  }}>
                    Editando <strong style={{ margin: "0 4px" }}>{selectedCirc}</strong> · Total: <strong style={{ marginLeft: 4 }}>{circTotal.toLocaleString()} votos</strong>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8
                  }}>
                    {Object.entries(simulatorPartyMap).map(([partyKey, party]) => {
                      const votes = provinciaVotes[selectedCirc]?.[partyKey] ?? 0;
                      const pct = circTotal > 0 ? ((votes / circTotal) * 100).toFixed(1) : "0.0";
                      return (
                        <div
                          key={partyKey}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 10,
                            padding: "10px 14px"
                          }}
                        >
                          {party.logo ? (
                            <img src={party.logo} alt={party.name} style={{
                              width: 14,
                              height: 14,
                              objectFit: "contain",
                              borderRadius: 4,
                              flexShrink: 0
                            }} />
                          ) : (
                            <span style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: party.color,
                              flexShrink: 0,
                              display: "inline-block"
                            }} />
                          )}
                          <span style={{
                            flex: 1,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f0eff8"
                          }}>
                            {party.name}
                          </span>
                          <span style={{ fontSize: 11, color: "#7a7990", minWidth: 32, textAlign: "right" }}>
                            {pct}%
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={votes}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value) || 0);
                              setProvinciaVotes(prev => ({
                                ...prev,
                                [selectedCirc]: { ...(prev[selectedCirc] || {}), [partyKey]: val }
                              }));
                            }}
                            style={{
                              width: 80,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 7,
                              padding: "5px 8px",
                              textAlign: "right",
                              fontSize: 12,
                              color: "#f0eff8",
                              fontFamily: "inherit",
                              outline: "none",
                              flexShrink: 0
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#5a596a" }}>
                  Selecciona una provincia para editar
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results */}
      {simulatorStats.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 20
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f0eff8", marginBottom: 4 }}>
            Resultados simulados
          </div>
          <div style={{ fontSize: 12, color: "#7a7990", marginBottom: 16 }}>
            Mayoría absoluta: {mayoriaAbs} escaños
          </div>

          {simulatorStats.map(party => {
            const pct = totalSimVotes > 0 ? ((party.votos / totalSimVotes) * 100).toFixed(1) : "0.0";
            const majorityPos = (mayoriaAbs / totalEscanos) * 100;
            return (
              <div key={party.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: party.color,
                  flexShrink: 0
                }} />
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f0eff8",
                  width: 120,
                  flexShrink: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {party.nombre}
                </span>
                <div style={{
                  flex: 1,
                  height: 6,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, (party.escanos / totalEscanos) * 100)}%`,
                    background: party.color,
                    borderRadius: 3,
                    transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)"
                  }} />
                  <div style={{
                    position: "absolute",
                    top: 0,
                    height: "100%",
                    width: 1,
                    background: "rgba(245,158,11,0.6)",
                    left: `${majorityPos}%`
                  }} />
                </div>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 800,
                  minWidth: 32,
                  textAlign: "right",
                  color: "#f0eff8"
                }}>
                  {party.escanos}
                </span>
                <span style={{ fontSize: 11, color: "#5a596a", minWidth: 38, textAlign: "right" }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
