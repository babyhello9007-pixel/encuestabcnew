import { useState, useRef } from "react";
import { Upload, Download, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImportRecord {
  encuestadora: string;
  fecha: string;
  partido: string;
  votos: number;
  porcentaje: number;
  escanosEstimados: number;
}

export default function TopSecretImportass() {
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      
      // Parse CSV/TSV
      const parsed: ImportRecord[] = [];
      const headers = lines[0].split(/[,\t]/).map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,\t]/).map(v => v.trim());
        if (values.length < 5) continue;

        const record: ImportRecord = {
          encuestadora: values[headers.indexOf("encuestadora")] || "Importass",
          fecha: values[headers.indexOf("fecha")] || new Date().toISOString().split("T")[0],
          partido: values[headers.indexOf("partido")] || "",
          votos: parseInt(values[headers.indexOf("votos")]) || 0,
          porcentaje: parseFloat(values[headers.indexOf("porcentaje")]) || 0,
          escanosEstimados: parseInt(values[headers.indexOf("escanos")]) || 0,
        };

        if (record.partido) parsed.push(record);
      }

      setRecords(parsed);
      setMessage({ type: "success", text: `${parsed.length} registros cargados correctamente` });
    } catch (err) {
      setMessage({ type: "error", text: "Error al procesar el archivo" });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (records.length === 0) {
      setMessage({ type: "error", text: "No hay registros para importar" });
      return;
    }

    setLoading(true);
    try {
      // Aquí se integraría con la API de Supabase para guardar los datos
      // Por ahora, simularemos la importación
      
      for (const record of records) {
        // Ejemplo de inserción en tabla votos_encuestadoras
        const { error } = await supabase
          .from("votos_encuestadoras")
          .insert({
            encuestadora: record.encuestadora,
            fecha: record.fecha,
            partido: record.partido,
            votos: record.votos,
            porcentaje: record.porcentaje,
            escanos_estimados: record.escanosEstimados,
          });

        if (error) throw error;
      }

      setMessage({ type: "success", text: `${records.length} registros importados exitosamente` });
      setRecords([]);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error al importar datos" });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRecords([]);
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const template = `encuestadora\tfecha\tpartido\tvotos\tporcentaje\tescanos
Importass\t2025-01-15\tPP\t5000\t25.5\t85
Importass\t2025-01-15\tPSOE\t4500\t23.0\t78
Importass\t2025-01-15\tVOX\t2000\t10.2\t35`;

    const blob = new Blob([template], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "importass_template.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.1))",
      border: "2px solid rgba(168,85,247,0.3)",
      borderRadius: 20,
      padding: 32,
      maxWidth: 900,
      margin: "0 auto",
    }}>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 28,
        fontWeight: 800,
        color: "#a855f7",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        🔐 IMPORTASS - Sistema de Importación de Datos
      </h1>

      <p style={{ fontSize: 14, color: "#7a7990", marginBottom: 24 }}>
        Carga datos de encuestadoras externas en formato CSV o TSV
      </p>

      {message && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 12,
          borderRadius: 10,
          marginBottom: 20,
          background: message.type === "success"
            ? "rgba(34,197,94,0.1)"
            : "rgba(239,68,68,0.1)",
          border: `1px solid ${message.type === "success"
            ? "rgba(34,197,94,0.3)"
            : "rgba(239,68,68,0.3)"}`,
          color: message.type === "success" ? "#bbf7d0" : "#fecaca",
          fontSize: 13,
        }}>
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Upload Section */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "2px dashed rgba(168,85,247,0.3)",
          borderRadius: 14,
          padding: 24,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "rgba(168,85,247,0.6)";
            e.currentTarget.style.background = "rgba(168,85,247,0.05)";
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              const event = { target: { files } } as any;
              handleFileUpload(event);
            }
          }}
        >
          <Upload size={32} style={{ margin: "0 auto 12px", color: "#a855f7", opacity: 0.6 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f0eff8", marginBottom: 4 }}>
            Arrastra archivo aquí o haz clic
          </p>
          <p style={{ fontSize: 12, color: "#7a7990" }}>CSV o TSV (máx. 10MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "rgba(168,85,247,0.2)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: 8,
              color: "#a855f7",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(168,85,247,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(168,85,247,0.2)";
            }}
          >
            Seleccionar archivo
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <button
            onClick={handleDownloadTemplate}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 12,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 10,
              color: "#818cf8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.15)";
            }}
          >
            <Download size={16} />
            Descargar Plantilla
          </button>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            color: "#7a7990",
            lineHeight: 1.6,
          }}>
            <p style={{ fontWeight: 600, color: "#f0eff8", marginBottom: 6 }}>Formato esperado:</p>
            <p>• Encuestadora</p>
            <p>• Fecha (YYYY-MM-DD)</p>
            <p>• Partido (clave)</p>
            <p>• Votos (número)</p>
            <p>• Porcentaje (%)</p>
            <p>• Escaños estimados</p>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {records.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f0eff8", marginBottom: 12 }}>
            Vista previa ({records.length} registros)
          </h3>
          <div style={{
            overflowX: "auto",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th style={{ padding: 10, textAlign: "left", color: "#7a7990", fontWeight: 600 }}>Encuestadora</th>
                  <th style={{ padding: 10, textAlign: "left", color: "#7a7990", fontWeight: 600 }}>Fecha</th>
                  <th style={{ padding: 10, textAlign: "left", color: "#7a7990", fontWeight: 600 }}>Partido</th>
                  <th style={{ padding: 10, textAlign: "right", color: "#7a7990", fontWeight: 600 }}>Votos</th>
                  <th style={{ padding: 10, textAlign: "right", color: "#7a7990", fontWeight: 600 }}>%</th>
                  <th style={{ padding: 10, textAlign: "right", color: "#7a7990", fontWeight: 600 }}>Escaños</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 10).map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: 10, color: "#f0eff8" }}>{r.encuestadora}</td>
                    <td style={{ padding: 10, color: "#f0eff8" }}>{r.fecha}</td>
                    <td style={{ padding: 10, color: "#f0eff8" }}>{r.partido}</td>
                    <td style={{ padding: 10, textAlign: "right", color: "#f0eff8" }}>{r.votos.toLocaleString()}</td>
                    <td style={{ padding: 10, textAlign: "right", color: "#f0eff8" }}>{r.porcentaje.toFixed(2)}%</td>
                    <td style={{ padding: 10, textAlign: "right", color: "#f0eff8" }}>{r.escanosEstimados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length > 10 && (
            <p style={{ fontSize: 11, color: "#7a7990", marginTop: 8 }}>
              ... y {records.length - 10} registros más
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        {records.length > 0 && (
          <button
            onClick={handleClear}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            <Trash2 size={14} />
            Limpiar
          </button>
        )}

        <button
          onClick={handleImport}
          disabled={loading || records.length === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 24px",
            background: records.length > 0 ? "#a855f7" : "rgba(168,85,247,0.3)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: records.length > 0 && !loading ? "pointer" : "not-allowed",
            opacity: records.length > 0 && !loading ? 1 : 0.5,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (records.length > 0 && !loading) {
              e.currentTarget.style.background = "#c084fc";
            }
          }}
          onMouseLeave={(e) => {
            if (records.length > 0 && !loading) {
              e.currentTarget.style.background = "#a855f7";
            }
          }}
        >
          <Upload size={14} />
          {loading ? "Importando..." : "Importar Datos"}
        </button>
      </div>
    </div>
  );
}
