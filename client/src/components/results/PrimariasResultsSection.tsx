import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface PrimariaResult {
  primaria_id: number;
  primaria_nombre: string;
  partido: string;
  color_primario?: string;
  logo_url?: string;
  candidato_id: number;
  candidato_nombre: string;
  foto_url: string;
  imagen_url?: string;
  total_votos: number;
  porcentaje: number;
}

interface PrimariaGrouped {
  primaria_nombre: string;
  partido: string;
  color_primario?: string;
  logo_url?: string;
  candidatos: PrimariaResult[];
  total_votos: number;
}

export function PrimariasResultsSection() {
  const [primarias, setPrimarias] = useState<PrimariaGrouped[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrimarias = async () => {
      try {
        const { data, error } = await supabase
          .from("resultados_primaria_detalle")
          .select("*")
          .order("primaria_id", { ascending: true })
          .order("total_votos", { ascending: false });

        if (error) throw error;

        // Agrupar por primaria
        const grouped: Record<number, PrimariaGrouped> = {};
        data?.forEach((row: PrimariaResult) => {
          if (!grouped[row.primaria_id]) {
            grouped[row.primaria_id] = {
              primaria_nombre: row.primaria_nombre,
              partido: row.partido,
              candidatos: [],
              total_votos: 0,
            };
          }
          grouped[row.primaria_id].candidatos.push(row);
          grouped[row.primaria_id].total_votos += row.total_votos;
        });

        setPrimarias(Object.values(grouped));
      } catch (error) {
        console.error("Error fetching primarias results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrimarias();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("resultados_primaria")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votaciones_primaria" },
        () => {
          fetchPrimarias();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#7a7990", padding: "40px 20px" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41E3A] mx-auto mb-4"></div>
        Cargando resultados de primarias...
      </div>
    );
  }

  if (primarias.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#7a7990", padding: "40px 20px" }}>
        No hay primarias activas en este momento.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {primarias.map((primaria) => (
        <div key={primaria.primaria_nombre} className="r-section">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 700, color: "#f0eff8", margin: "0 0 10px 0" }}>
              {primaria.primaria_nombre}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{
                display: "inline-block",
                padding: "6px 12px",
                backgroundColor: primaria.color_primario || "#C41E3A",
                color: "white",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
              }}>
                {primaria.partido}
              </span>
              <span style={{
                display: "inline-block",
                padding: "6px 12px",
                backgroundColor: "rgba(196, 30, 58, 0.1)",
                color: "#C41E3A",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
              }}>
                {primaria.total_votos} votos totales
              </span>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div style={{ marginBottom: "20px", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={primaria.candidatos}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="candidato_nombre"
                  stroke="#7a7990"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#7a7990" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #C41E3A",
                    borderRadius: "6px",
                    color: "#f0eff8",
                  }}
                  formatter={(value) => [`${value} votos`, "Votos"]}
                />
                <Bar dataKey="total_votos" fill={primaria.color_primario || "#C41E3A"} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de candidatos */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
          }}>
            {primaria.candidatos.map((candidato) => (
              <div
                key={candidato.candidato_id}
                style={{
                  padding: "15px",
                  backgroundColor: `${primaria.color_primario || "#C41E3A"}0d`,
                  border: `1px solid ${primaria.color_primario || "#C41E3A"}33`,
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {(candidato.imagen_url || candidato.foto_url) && (
                  <img
                    src={candidato.imagen_url || candidato.foto_url}
                    alt={candidato.candidato_nombre}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                )}
                <div>
                  <h4 style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#f0eff8",
                    margin: "0 0 5px 0",
                  }}>
                    {candidato.candidato_nombre}
                  </h4>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#7a7990",
                  }}>
                    <span>{candidato.total_votos} votos</span>
                    <span style={{ color: "#C41E3A", fontWeight: "600" }}>
                      {candidato.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${candidato.porcentaje}%`,
                      backgroundColor: "#C41E3A",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
