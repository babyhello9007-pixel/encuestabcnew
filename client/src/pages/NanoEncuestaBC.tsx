import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { PROVINCES, CCAA } from "@/lib/surveyData";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, X, Check, AlertTriangle, Clock } from "lucide-react";
import { normalizeProvinceName } from "@/lib/provinceNormalizer";
import { getCCAAFromProvince, isProvinceInCCAA, getProvincesInCCAA } from "@/lib/provinceToCAA";
import ReviewNanoEncuesta from "@/components/ReviewNanoEncuesta";
import { checkVotingCooldown, recordVote, getUserIP } from "@/lib/votingCooldown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NanoSurveyResponse {
  edad?: string;
  provincia?: string;
  comunidad_autonoma?: string;
  nacionalidad?: string;
  voto_generales?: string;
  voto_autonomicas?: string;
  voto_municipales?: string;
  voto_europeas?: string;
  nota_ejecutivo?: number;
  valoracion_feijoo?: number;
  valoracion_sanchez?: number;
  valoracion_abascal?: number;
  valoracion_alvise?: number;
  valoracion_yolanda?: number;
  valoracion_irene?: number;
  valoracion_ayuso?: number;
  valoracion_buxade?: number;
  posicion_ideologica?: number;
  asociacion_juvenil?: string;
  lider_partido?: string;
  monarquia_republica?: string;
  division_territorial?: string;
  sistema_pensiones?: string;
}

interface PartyConfig {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  party_type: string;
}

interface PartyLeader {
  id: number;
  party_key: string;
  leader_name: string;
  photo_url: string;
}

// ─── Cooldown Screen ──────────────────────────────────────────────────────────

function CooldownScreen({ remainingMinutes, onBack }: { remainingMinutes: number; onBack: () => void }) {
  const [timeLeft, setTimeLeft] = useState(remainingMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const progressPercent = (1 - (timeLeft / (remainingMinutes * 60))) * 100;

  return (
    <div className="nc-cooldown-screen" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,10,30,0.95) 100%)" }}>
      <div className="nc-cooldown-card" style={{ maxWidth: "500px", textAlign: "center", padding: "40px 30px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div className="nc-cooldown-icon" style={{ marginBottom: "20px", animation: "pulse 2s infinite" }}>
          <Clock size={48} color="#C41E3A" strokeWidth={1.5} />
        </div>
        <h2 className="nc-cooldown-title" style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px", color: "#fff" }}>Ya has participado</h2>
        <p className="nc-cooldown-sub" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginBottom: "30px" }}>Podrás volver a votar cuando expire el período de espera</p>
        
        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginBottom: "30px", overflow: "hidden" }}>
          <div style={{ width: `${progressPercent}%`, height: "100%", background: "linear-gradient(90deg, #C41E3A, #ff6b6b)", transition: "width 0.3s ease" }} />
        </div>
        
        <div className="nc-cooldown-timer" style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "30px" }}>
          <div className="nc-timer-block" style={{ background: "rgba(196,30,58,0.2)", padding: "15px 12px", borderRadius: "10px", minWidth: "60px" }}>
            <span className="nc-timer-num" style={{ fontSize: "28px", fontWeight: "700", color: "#C41E3A", display: "block" }}>{pad(hours)}</span>
            <span className="nc-timer-label" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>horas</span>
          </div>
          <span className="nc-timer-sep" style={{ fontSize: "20px", color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>:</span>
          <div className="nc-timer-block" style={{ background: "rgba(196,30,58,0.2)", padding: "15px 12px", borderRadius: "10px", minWidth: "60px" }}>
            <span className="nc-timer-num" style={{ fontSize: "28px", fontWeight: "700", color: "#C41E3A", display: "block" }}>{pad(mins)}</span>
            <span className="nc-timer-label" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>min</span>
          </div>
          <span className="nc-timer-sep" style={{ fontSize: "20px", color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>:</span>
          <div className="nc-timer-block" style={{ background: "rgba(196,30,58,0.2)", padding: "15px 12px", borderRadius: "10px", minWidth: "60px" }}>
            <span className="nc-timer-num" style={{ fontSize: "28px", fontWeight: "700", color: "#C41E3A", display: "block" }}>{pad(secs)}</span>
            <span className="nc-timer-label" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>seg</span>
          </div>
        </div>
        
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "25px" }}>Vuelve en {remainingMinutes} minuto{remainingMinutes !== 1 ? 's' : ''}</p>
        <button className="nc-btn-outline" onClick={onBack} style={{ width: "100%", padding: "12px 20px", background: "rgba(196,30,58,0.15)", border: "1px solid #C41E3A", color: "#C41E3A", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "rgba(196,30,58,0.3)"; }} onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "rgba(196,30,58,0.15)"; }}>← Volver al inicio</button>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// ─── Thank You Screen ─────────────────────────────────────────────────────────

function ThankYouScreen({ onResults, onHome }: { onResults: () => void; onHome: () => void }) {
  return (
    <div className="nc-thankyou-screen">
      <div className="nc-thankyou-card">
        <div className="nc-thankyou-check">
          <Check size={36} strokeWidth={2.5} />
        </div>
        <h2 className="nc-thankyou-title">¡Gracias!</h2>
        <p className="nc-thankyou-sub">Tu respuesta ha sido registrada. Tu opinión construye el mapa real de la opinión española.</p>
        <div className="nc-thankyou-btns">
          <button className="nc-btn-primary" onClick={onResults}>Ver Resultados</button>
          <button className="nc-btn-outline" onClick={onHome}>Volver al Inicio</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NanoEncuestaBC() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<NanoSurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showOtroInput, setShowOtroInput] = useState(false);
  const [showCustomLeaderInput, setShowCustomLeaderInput] = useState(false);
  const [ccaaWarning, setCCAAWarning] = useState<string | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const [showCooldown, setShowCooldown] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);

  // Party data from Supabase
  const [parties, setParties] = useState<PartyConfig[]>([]);
  const [youthParties, setYouthParties] = useState<PartyConfig[]>([]);
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [loadingParties, setLoadingParties] = useState(true);

  // Fetch party configuration and leaders from Supabase
  useEffect(() => {
    const fetchPartyData = async () => {
      try {
        const [partiesRes, leadersRes] = await Promise.all([
          supabase.from("party_configuration").select("*").eq("is_active", true).order("display_name"),
          supabase.from("party_leaders").select("*").eq("is_active", true),
        ]);

        if (partiesRes.data) {
          setParties(partiesRes.data.filter((p: PartyConfig) => p.party_type === "general"));
          setYouthParties(partiesRes.data.filter((p: PartyConfig) => p.party_type === "youth"));
        }
        if (leadersRes.data) setLeaders(leadersRes.data);
      } catch (err) {
        console.error("Error fetching party data:", err);
      } finally {
        setLoadingParties(false);
      }
    };
    fetchPartyData();
  }, []);

  // Check cooldown on mount
  useEffect(() => {
    const checkCooldown = async () => {
      try {
        const userIP = await getUserIP();
        const { canVote, remainingMinutes } = await checkVotingCooldown(userIP);
        if (!canVote) {
          setShowCooldown(true);
          setCooldownMinutes(remainingMinutes);
        }
      } catch (error) {
        console.error("Error checking cooldown:", error);
      }
    };
    checkCooldown();
  }, []);

  const steps = [
    { title: "¿Cuántos años tienes?", subtitle: "Tu edad nos ayuda a entender mejor la distribución demográfica", key: "edad", type: "text", inputType: "number" },
    { title: "Comunidad Autónoma", subtitle: "Selecciona tu comunidad autónoma de residencia", key: "comunidad_autonoma", type: "select" },
    { title: "Provincia", subtitle: "Selecciona tu provincia de residencia", key: "provincia", type: "select" },
    { title: "Nacionalidad", subtitle: "¿Cuál es tu nacionalidad?", key: "nacionalidad", type: "text", inputType: "text" },
    { title: "Elecciones Generales", subtitle: "¿A qué partido votarías en las próximas elecciones generales?", key: "voto_generales", type: "party" },
    { title: "Elecciones Autonómicas", subtitle: "¿A qué partido votarías en las próximas elecciones autonómicas?", key: "voto_autonomicas", type: "party" },
    { title: "Elecciones Municipales", subtitle: "¿A qué partido votarías en las próximas elecciones municipales?", key: "voto_municipales", type: "party" },
    { title: "Elecciones Europeas", subtitle: "¿A qué partido votarías en las próximas elecciones europeas?", key: "voto_europeas", type: "party" },
    { title: "Nota al Ejecutivo", subtitle: "¿Qué nota le pondrías al Gobierno actual? (0 = muy malo, 10 = muy bueno)", key: "nota_ejecutivo", type: "slider" },
    { title: "Alberto Núñez Feijóo", subtitle: "Valora del 0 al 10 al líder del Partido Popular", key: "valoracion_feijoo", type: "slider" },
    { title: "Pedro Sánchez", subtitle: "Valora del 0 al 10 al Presidente del Gobierno", key: "valoracion_sanchez", type: "slider" },
    { title: "Santiago Abascal", subtitle: "Valora del 0 al 10 al líder de Vox", key: "valoracion_abascal", type: "slider" },
    { title: "Alvise Pérez", subtitle: "Valora del 0 al 10 al líder de Se Acabó La Fiesta", key: "valoracion_alvise", type: "slider" },
    { title: "Yolanda Díaz", subtitle: "Valora del 0 al 10 a la líder de Sumar", key: "valoracion_yolanda", type: "slider" },
    { title: "Irene Montero", subtitle: "Valora del 0 al 10 a la líder de Podemos", key: "valoracion_irene", type: "slider" },
    { title: "Isabel Díaz Ayuso", subtitle: "Valora del 0 al 10 a la Presidenta de la Comunidad de Madrid", key: "valoracion_ayuso", type: "slider" },
    { title: "Jorge Buxadé", subtitle: "Valora del 0 al 10 al europarlamentario de Vox", key: "valoracion_buxade", type: "slider" },
    { title: "Tu posición ideológica", subtitle: "¿Dónde te sitúas en el espectro político? (1 = extrema izquierda, 10 = extrema derecha)", key: "posicion_ideologica", type: "ideology" },
    { title: "Asociación Juvenil", subtitle: "¿A qué asociación juvenil votarías?", key: "asociacion_juvenil", type: "youth_party" },
    { title: "Líder de tu partido", subtitle: "¿Quién prefieres como líder de tu partido en las generales?", key: "lider_partido", type: "leader" },
    { title: "Forma del Estado", subtitle: "¿Qué forma del Estado prefieres para España?", key: "monarquia_republica", type: "cards" },
    { title: "División Territorial", subtitle: "¿Qué modelo territorial prefieres para España?", key: "division_territorial", type: "cards" },
    { title: "Sistema de Pensiones", subtitle: "¿Qué modelo de pensiones prefieres?", key: "sistema_pensiones", type: "cards" },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep) / steps.length) * 100;

  const getFilteredProvinces = () => {
    if (currentStepData.key === "provincia" && responses.comunidad_autonoma) {
      const filtered = getProvincesInCCAA(responses.comunidad_autonoma as string);
      return filtered.length > 0 ? filtered : PROVINCES;
    }
    return PROVINCES;
  };

  const isCurrentFieldComplete = () => {
    const val = responses[currentStepData.key as keyof NanoSurveyResponse];
    if (currentStepData.type === "text") return val && String(val).trim().length > 0;
    if (currentStepData.type === "select") return val && String(val).length > 0;
    if (currentStepData.type === "party" || currentStepData.type === "youth_party") return val && String(val).length > 0;
    if (currentStepData.type === "cards") return val && String(val).length > 0;
    if (currentStepData.type === "slider" || currentStepData.type === "ideology") return val !== undefined && val !== null && val !== "";
    if (currentStepData.type === "leader") return val && String(val).length > 0 && responses.voto_generales;
    return false;
  };

  const handleAnswer = (value: any) => {
    setResponses(prev => ({ ...prev, [currentStepData.key]: value }));
    if (currentStepData.key === "provincia") {
      const ccaa = getCCAAFromProvince(value);
      if (ccaa) { setResponses(prev => ({ ...prev, comunidad_autonoma: ccaa })); setCCAAWarning(null); }
    }
    if (currentStepData.key === "comunidad_autonoma") {
      const prov = responses.provincia as string;
      if (prov && !isProvinceInCCAA(prov, value)) setCCAAWarning(`${prov} no pertenece a ${value}`);
      else setCCAAWarning(null);
    }
  };

  const navigate = (dir: "next" | "prev") => {
    setDirection(dir);
    setAnimKey(k => k + 1);
    setShowOtroInput(false);
    setTimeout(() => {
      if (dir === "next") {
        if (currentStep < steps.length - 1) { setCurrentStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
        else { setShowReview(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
      } else {
        if (currentStep > 0) { setCurrentStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
      }
    }, 180);
  };

  const handleSubmit = async () => {
    try {
      const userIP = await getUserIP();
      const { canVote, remainingMinutes } = await checkVotingCooldown(userIP);
      if (!canVote) {
        setShowCooldown(true);
        setCooldownMinutes(remainingMinutes);
        return;
      }
    } catch (error) { console.error("Cooldown check error:", error); }

    const requiredFields = ["edad","provincia","comunidad_autonoma","nacionalidad","voto_generales","voto_autonomicas","voto_municipales","voto_europeas","nota_ejecutivo","valoracion_feijoo","valoracion_sanchez","valoracion_abascal","valoracion_alvise","valoracion_yolanda","valoracion_irene","valoracion_ayuso","valoracion_buxade","posicion_ideologica","asociacion_juvenil","lider_partido","monarquia_republica","division_territorial","sistema_pensiones"];
    const missing = requiredFields.filter(f => { const v = responses[f as keyof NanoSurveyResponse]; return v === undefined || v === null || v === "" || (typeof v === "number" && isNaN(v)); });
    if (missing.length > 0) { toast.error(`Faltan ${missing.length} respuestas por completar`); return; }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        edad: responses.edad ? parseInt(responses.edad) : 18,
        provincia: normalizeProvinceName(responses.provincia) || null,
        ccaa: responses.comunidad_autonoma || null,
        nacionalidad: responses.nacionalidad || null,
        voto_generales: responses.voto_generales || null,
        voto_autonomicas: responses.voto_autonomicas || null,
        voto_municipales: responses.voto_municipales || null,
        voto_europeas: responses.voto_europeas || null,
        nota_ejecutivo: responses.nota_ejecutivo || null,
        val_feijoo: responses.valoracion_feijoo ?? 0,
        val_sanchez: responses.valoracion_sanchez ?? 0,
        val_abascal: responses.valoracion_abascal ?? 0,
        val_alvise: responses.valoracion_alvise ?? 0,
        val_yolanda_diaz: responses.valoracion_yolanda ?? 0,
        val_irene_montero: responses.valoracion_irene ?? 0,
        val_ayuso: responses.valoracion_ayuso ?? 0,
        val_buxade: responses.valoracion_buxade ?? 0,
        posicion_ideologica: responses.posicion_ideologica || null,
        voto_asociacion_juvenil: responses.asociacion_juvenil || null,
        monarquia_republica: responses.monarquia_republica || null,
        division_territorial: responses.division_territorial || null,
        sistema_pensiones: responses.sistema_pensiones || null,
      };
      const { error } = await supabase.from("respuestas").insert([dataToSubmit]);
      if (error) { 
        const errorMsg = error.message || "Error desconocido al enviar la encuesta";
        toast.error(`Error: ${errorMsg}`); 
        console.error("Supabase error:", error); 
        setIsSubmitting(false); 
        return; 
      }

      try {
        const userIP = await getUserIP();
        await recordVote(userIP);
      } catch (e) { console.error("Error recording cooldown:", e); }

      if (responses.lider_partido) {
        const selectedParty = parties.find(p => p.display_name === responses.voto_generales);
        const partyLeaders = leaders.filter(l => l.party_key === selectedParty?.party_key);
        const isCustom = !partyLeaders.some(l => l.leader_name === responses.lider_partido);
        await supabase.from("lideres_preferidos").insert({
          partido: responses.voto_generales || null,
          lider_preferido: responses.lider_partido,
          es_personalizado: isCustom,
        }).catch(console.error);
      }

      setShowThankYou(true);
      toast.success("¡Gracias por participar!");
    } catch (error) { 
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error: ${errorMsg}`); 
      console.error("Submit error:", error); 
    }
    finally { setIsSubmitting(false); }
  };

  // ─── Screens ──────────────────────────────────────────────────────────────

  if (showCooldown) return <CooldownScreen remainingMinutes={cooldownMinutes} onBack={() => setLocation("/")} />;
  if (showThankYou) return <ThankYouScreen onResults={() => setLocation("/resultados")} onHome={() => setLocation("/")} />;
  if (showReview) return (
    <ReviewNanoEncuesta
      responses={responses}
      onEdit={() => { setShowReview(false); setCurrentStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      onConfirm={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );

  // Helpers
  const selectedParty = parties.find(p => p.display_name === responses.voto_generales);
  const partyLeaders = leaders.filter(l => l.party_key === selectedParty?.party_key);
  const accentColor = selectedParty?.color || "#e8465a";
  const stepVal = responses[currentStepData.key as keyof NanoSurveyResponse];

  // Cards options
  const cardOptions: Record<string, { value: string; label: string; desc?: string }[]> = {
    monarquia_republica: [
      { value: "Monarquía Parlamentaria", label: "Monarquía Parlamentaria", desc: "Sistema actual, Rey como jefe de Estado" },
      { value: "República", label: "República", desc: "Jefe de Estado elegido democráticamente" },
      { value: "Otro", label: "Otro modelo", desc: "Una alternativa diferente" },
    ],
    division_territorial: [
      { value: "Sistema actual de Autonomías", label: "Estado Autonómico", desc: "El sistema actual de comunidades autónomas" },
      { value: "Sistema Federal", label: "Estado Federal", desc: "Mayor autonomía y competencias para las regiones" },
      { value: "Sistema Provincial (Sin Autonomías)", label: "Estado Unitario", desc: "Centralización sin comunidades autónomas" },
      { value: "Otro", label: "Otro modelo", desc: "Una alternativa diferente" },
    ],
    sistema_pensiones: [
      { value: "Público (Actual)", label: "Sistema Público", desc: "Pensiones gestionadas por el Estado" },
      { value: "Privado", label: "Sistema Privado", desc: "Pensiones gestionadas por fondos privados" },
      { value: "Mixto", label: "Sistema Mixto", desc: "Combinación de público y privado" },
      { value: "Otro", label: "Otro modelo", desc: "Una alternativa diferente" },
    ],
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@700;800&display=swap');

        :root {
          --nc-bg: #0a0a0f;
          --nc-surface: #111118;
          --nc-surface2: #18181f;
          --nc-surface3: #1e1e28;
          --nc-border: rgba(255,255,255,0.07);
          --nc-border2: rgba(255,255,255,0.13);
          --nc-text: #f0eff8;
          --nc-muted: #7a7990;
          --nc-muted2: #5a596a;
          --nc-accent: #e8465a;
          --nc-accent2: #ff6b7a;
          --nc-accent-dim: rgba(232,70,90,0.1);
          --nc-green: #22c55e;
          --nc-gold: #c9a96e;
          --nc-radius: 14px;
          --nc-radius-sm: 10px;
        }

        .nc-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--nc-bg);
          font-family: 'DM Sans', sans-serif;
          color: var(--nc-text);
        }

        /* Header */
        .nc-header {
          position: sticky; top: 0; z-index: 50;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
          background: rgba(10,10,15,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--nc-border);
        }
        .nc-header-brand { display: flex; align-items: center; gap: 10px; }
        .nc-header-brand img { height: 28px; width: 28px; }
        .nc-header-brand span { font-size: 15px; font-weight: 600; color: var(--nc-text); }
        .nc-header-progress-text { font-size: 13px; color: var(--nc-muted); }
        .nc-header-progress-text strong { color: var(--nc-accent); font-weight: 600; }
        .nc-close-btn {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--nc-surface2);
          border: 1px solid var(--nc-border2);
          color: var(--nc-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nc-close-btn:hover { background: var(--nc-surface3); color: var(--nc-text); }

        /* Progress bar */
        .nc-progress-wrap {
          padding: 0 24px;
          background: var(--nc-bg);
          border-bottom: 1px solid var(--nc-border);
        }
        .nc-progress-dots {
          display: flex; gap: 3px;
          padding: 10px 0;
          overflow: hidden;
        }
        .nc-progress-dot {
          flex: 1; height: 3px; border-radius: 2px;
          transition: background 0.3s;
        }
        .nc-progress-dot.done { background: var(--nc-green); }
        .nc-progress-dot.current { background: var(--nc-accent); }
        .nc-progress-dot.pending { background: var(--nc-surface3); }

        /* Main content */
        .nc-main { flex: 1; padding: 32px 16px 60px; }
        .nc-container { max-width: 680px; margin: 0 auto; }

        /* Step header */
        .nc-step-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .nc-step-badge {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--nc-accent);
          background: var(--nc-accent-dim);
          border: 1px solid rgba(232,70,90,0.2);
          border-radius: 100px;
          padding: 4px 10px;
        }
        .nc-step-pct { font-size: 13px; color: var(--nc-muted); font-weight: 500; }

        .nc-step-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--nc-text);
          margin: 0 0 8px;
        }
        .nc-step-sub {
          font-size: 15px;
          color: var(--nc-muted);
          line-height: 1.6;
          margin: 0 0 28px;
        }

        /* Card container */
        .nc-card {
          background: var(--nc-surface);
          border: 1px solid var(--nc-border2);
          border-radius: var(--nc-radius);
          padding: 28px;
          animation: nc-slide-in 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes nc-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Text input */
        .nc-input {
          width: 100%; box-sizing: border-box;
          background: var(--nc-surface2);
          border: 1.5px solid var(--nc-border2);
          border-radius: var(--nc-radius-sm);
          padding: 14px 16px;
          font-size: 16px; font-family: inherit;
          color: var(--nc-text);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .nc-input:focus {
          border-color: var(--nc-accent);
          box-shadow: 0 0 0 3px rgba(232,70,90,0.1);
        }
        .nc-input::placeholder { color: var(--nc-muted2); }
        .nc-select {
          width: 100%; box-sizing: border-box;
          background: var(--nc-surface2);
          border: 1.5px solid var(--nc-border2);
          border-radius: var(--nc-radius-sm);
          padding: 14px 16px;
          font-size: 15px; font-family: inherit;
          color: var(--nc-text);
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%237a7990' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }
        .nc-select:focus { border-color: var(--nc-accent); }
        .nc-select option { background: #18181f; }

        /* Party grid */
        .nc-party-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }
        .nc-party-btn {
          position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px;
          padding: 16px 10px;
          border-radius: var(--nc-radius-sm);
          border: 1.5px solid var(--nc-border);
          background: var(--nc-surface2);
          cursor: pointer;
          transition: all 0.18s;
          min-height: 110px;
        }
        .nc-party-btn:hover {
          border-color: var(--nc-border2);
          background: var(--nc-surface3);
          transform: translateY(-1px);
        }
        .nc-party-btn.selected {
          border-width: 2px;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .nc-party-btn.selected .nc-party-check {
          opacity: 1; transform: scale(1);
        }
        .nc-party-logo {
          width: 52px; height: 52px;
          object-fit: contain;
          border-radius: 6px;
        }
        .nc-party-logo-placeholder {
          width: 52px; height: 52px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }
        .nc-party-name {
          font-size: 12px; font-weight: 600;
          text-align: center; line-height: 1.3;
          color: var(--nc-text);
        }
        .nc-party-check {
          position: absolute; top: 8px; right: 8px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--nc-green);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.5);
          transition: all 0.2s;
        }
        .nc-party-otro {
          border-style: dashed;
          opacity: 0.7;
        }
        .nc-party-otro:hover { opacity: 1; }

        /* Slider (valoraciones) */
        .nc-slider-grid {
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          gap: 6px;
          margin-bottom: 16px;
        }
        @media (max-width: 480px) {
          .nc-slider-grid { grid-template-columns: repeat(6, 1fr); gap: 5px; }
          .nc-party-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
        }
        .nc-num-btn {
          aspect-ratio: 1;
          border-radius: 8px;
          border: 1.5px solid var(--nc-border);
          background: var(--nc-surface2);
          color: var(--nc-muted);
          font-size: 14px; font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .nc-num-btn:hover { border-color: var(--nc-border2); color: var(--nc-text); background: var(--nc-surface3); }
        .nc-num-btn.selected {
          color: #fff;
          border-color: transparent;
          transform: scale(1.08);
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }
        .nc-slider-labels {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 8px;
        }
        .nc-slider-label { font-size: 12px; color: var(--nc-muted); }
        .nc-slider-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 800;
          color: var(--nc-accent);
        }

        /* Ideology bar */
        .nc-ideology-grid {
          display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px;
          margin-bottom: 16px;
        }
        .nc-ideology-btn {
          aspect-ratio: 1;
          border-radius: 8px; border: 1.5px solid var(--nc-border);
          background: var(--nc-surface2);
          font-size: 14px; font-weight: 700;
          font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; color: var(--nc-muted);
        }
        .nc-ideology-btn:hover { border-color: var(--nc-border2); color: var(--nc-text); }
        .nc-ideology-btn.selected { color: #fff; border-color: transparent; transform: scale(1.1); box-shadow: 0 4px 14px rgba(0,0,0,0.3); }
        .nc-ideology-labels { display: flex; justify-content: space-between; margin-top: 10px; }
        .nc-ideology-label { font-size: 12px; color: var(--nc-muted); }

        /* Leader cards */
        .nc-leader-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .nc-leader-grid::-webkit-scrollbar { width: 4px; }
        .nc-leader-grid::-webkit-scrollbar-track { background: var(--nc-surface2); border-radius: 2px; }
        .nc-leader-grid::-webkit-scrollbar-thumb { background: var(--nc-border2); border-radius: 2px; }
        .nc-leader-btn {
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 16px 12px;
          border-radius: var(--nc-radius-sm);
          border: 1.5px solid var(--nc-border);
          background: var(--nc-surface2);
          cursor: pointer; transition: all 0.18s;
          text-align: center;
        }
        .nc-leader-btn:hover { border-color: var(--nc-border2); background: var(--nc-surface3); transform: translateY(-1px); }
        .nc-leader-btn.selected { border-width: 2px; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .nc-leader-photo {
          width: 64px; height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--nc-border2);
        }
        .nc-leader-photo-placeholder {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--nc-surface3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: var(--nc-muted);
        }
        .nc-leader-name {
          font-size: 12px; font-weight: 600;
          color: var(--nc-text); line-height: 1.3;
        }
        .nc-leader-check {
          position: absolute; top: 8px; right: 8px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--nc-green);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.5); transition: all 0.2s;
        }
        .nc-leader-btn.selected .nc-leader-check { opacity: 1; transform: scale(1); }

        /* Cards (monarquia/etc) */
        .nc-cards-grid { display: flex; flex-direction: column; gap: 10px; }
        .nc-option-card {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 20px;
          border-radius: var(--nc-radius-sm);
          border: 1.5px solid var(--nc-border);
          background: var(--nc-surface2);
          cursor: pointer; transition: all 0.18s;
          text-align: left;
        }
        .nc-option-card:hover { border-color: var(--nc-border2); background: var(--nc-surface3); }
        .nc-option-card.selected { border-width: 2px; }
        .nc-option-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--nc-border2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.18s;
        }
        .nc-option-card.selected .nc-option-radio { border-color: var(--nc-accent); }
        .nc-option-radio-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--nc-accent);
          transform: scale(0); transition: transform 0.18s;
        }
        .nc-option-card.selected .nc-option-radio-dot { transform: scale(1); }
        .nc-option-label { font-size: 15px; font-weight: 600; color: var(--nc-text); margin-bottom: 2px; }
        .nc-option-desc { font-size: 13px; color: var(--nc-muted); }

        /* Warning */
        .nc-warning {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(234,179,8,0.08);
          border: 1px solid rgba(234,179,8,0.25);
          border-radius: 10px; padding: 12px 16px;
          margin-bottom: 16px;
          color: #fbbf24; font-size: 13px;
        }

        /* Nav */
        .nc-nav { display: flex; gap: 12px; margin-top: 20px; }
        .nc-btn-prev {
          display: flex; align-items: center; gap: 6px;
          padding: 14px 20px;
          border-radius: var(--nc-radius-sm);
          border: 1.5px solid var(--nc-border2);
          background: transparent;
          color: var(--nc-muted); font-size: 14px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          transition: all 0.18s;
        }
        .nc-btn-prev:hover { color: var(--nc-text); border-color: rgba(255,255,255,0.2); }
        .nc-btn-prev:disabled { opacity: 0.3; cursor: not-allowed; }
        .nc-btn-next {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 24px;
          border-radius: var(--nc-radius-sm);
          border: none;
          background: var(--nc-accent);
          color: #fff; font-size: 15px; font-weight: 700;
          font-family: inherit; cursor: pointer;
          transition: all 0.18s;
        }
        .nc-btn-next:hover { background: var(--nc-accent2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,70,90,0.35); }
        .nc-btn-next:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Buttons: buttons */
        .nc-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 28px;
          border-radius: var(--nc-radius-sm);
          background: var(--nc-accent); color: #fff;
          border: none; font-size: 15px; font-weight: 700;
          font-family: inherit; cursor: pointer;
          transition: all 0.18s; width: 100%;
        }
        .nc-btn-primary:hover { background: var(--nc-accent2); }
        .nc-btn-outline {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 28px;
          border-radius: var(--nc-radius-sm);
          background: transparent; color: var(--nc-muted);
          border: 1.5px solid var(--nc-border2);
          font-size: 15px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          transition: all 0.18s; width: 100%;
        }
        .nc-btn-outline:hover { color: var(--nc-text); border-color: rgba(255,255,255,0.2); }

        /* Cooldown */
        .nc-cooldown-screen, .nc-thankyou-screen {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: var(--nc-bg); font-family: 'DM Sans', sans-serif; padding: 24px;
        }
        .nc-cooldown-card, .nc-thankyou-card {
          background: var(--nc-surface);
          border: 1px solid var(--nc-border2);
          border-radius: 20px;
          padding: 48px 36px;
          max-width: 420px; width: 100%;
          text-align: center;
        }
        .nc-cooldown-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(232,70,90,0.1);
          border: 1px solid rgba(232,70,90,0.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--nc-accent); margin: 0 auto 20px;
        }
        .nc-cooldown-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 800;
          color: var(--nc-text); margin: 0 0 8px;
        }
        .nc-cooldown-sub { font-size: 15px; color: var(--nc-muted); margin: 0 0 32px; line-height: 1.6; }
        .nc-cooldown-timer {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 32px;
        }
        .nc-timer-block { text-align: center; }
        .nc-timer-num {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 42px; font-weight: 800;
          color: var(--nc-accent); line-height: 1;
        }
        .nc-timer-label { font-size: 12px; color: var(--nc-muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .nc-timer-sep { font-size: 32px; font-weight: 800; color: var(--nc-muted2); align-self: flex-start; margin-top: 4px; }
        .nc-thankyou-check {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          display: flex; align-items: center; justify-content: center;
          color: var(--nc-green); margin: 0 auto 20px;
        }
        .nc-thankyou-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; color: var(--nc-text); margin: 0 0 8px; }
        .nc-thankyou-sub { font-size: 15px; color: var(--nc-muted); margin: 0 0 32px; line-height: 1.7; }
        .nc-thankyou-btns { display: flex; flex-direction: column; gap: 10px; }

        /* Loading */
        .nc-loading-spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--nc-border2);
          border-top-color: var(--nc-accent);
          animation: nc-spin 0.7s linear infinite;
          margin: 0 auto;
        }
        @keyframes nc-spin { to { transform: rotate(360deg); } }
        .nc-loading-msg { text-align: center; padding: 24px; color: var(--nc-muted); font-size: 14px; }

        /* Custom leader input */
        .nc-custom-input-wrap { margin-top: 10px; }
      `}</style>

      <div className="nc-wrap">
        {/* Header */}
        <header className="nc-header">
          <div className="nc-header-brand">
            <img src="/favicon.png" alt="BC" />
            <span>NanoEncuestaBC</span>
          </div>
          <div className="nc-header-progress-text">
            Pregunta <strong>{currentStep + 1}</strong> de {steps.length}
          </div>
          <button className="nc-close-btn" onClick={() => setLocation("/")}>
            <X size={14} />
          </button>
        </header>

        {/* Progress dots */}
        <div className="nc-progress-wrap">
          <div className="nc-progress-dots">
            {steps.map((_, i) => {
              const val = responses[steps[i].key as keyof NanoSurveyResponse];
              const done = val !== undefined && val !== null && val !== "";
              const current = i === currentStep;
              return <div key={i} className={`nc-progress-dot ${current ? "current" : done ? "done" : "pending"}`} />;
            })}
          </div>
        </div>

        {/* Main */}
        <main className="nc-main">
          <div className="nc-container">
            {/* Step meta */}
            <div className="nc-step-meta" style={{ marginBottom: 10 }}>
              <span className="nc-step-badge">{currentStep + 1} / {steps.length}</span>
              <span className="nc-step-pct">{Math.round(progress)}% completado</span>
            </div>

            <h2 className="nc-step-title">{currentStepData.title}</h2>
            <p className="nc-step-sub">{currentStepData.subtitle}</p>

            {/* Warning */}
            {ccaaWarning && (
              <div className="nc-warning">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{ccaaWarning}</span>
              </div>
            )}

            <div key={animKey} className="nc-card">

              {/* TEXT */}
              {currentStepData.type === "text" && (
                <input
                  className="nc-input"
                  type={(currentStepData as any).inputType || "text"}
                  value={String(responses[currentStepData.key as keyof NanoSurveyResponse] || "")}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder={currentStepData.key === "edad" ? "Ej: 34" : "Escribe tu respuesta..."}
                  min={currentStepData.key === "edad" ? 16 : undefined}
                  max={currentStepData.key === "edad" ? 99 : undefined}
                  autoFocus
                />
              )}

              {/* SELECT */}
              {currentStepData.type === "select" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <select
                    className="nc-select"
                    value={String(responses[currentStepData.key as keyof NanoSurveyResponse] || "")}
                    onChange={e => handleAnswer(e.target.value)}
                  >
                    <option value="">Selecciona una opción...</option>
                    {currentStepData.key === "comunidad_autonoma" && CCAA.map(c => <option key={c} value={c}>{c}</option>)}
                    {currentStepData.key === "provincia" && getFilteredProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}

              {/* PARTY SELECTOR */}
              {(currentStepData.type === "party" || currentStepData.type === "youth_party") && (
                <div>
                  {loadingParties ? (
                    <div className="nc-loading-msg"><div className="nc-loading-spinner" style={{ marginBottom: 10 }} />Cargando partidos...</div>
                  ) : (
                    <>
                      <div className="nc-party-grid">
                        {(currentStepData.type === "youth_party" ? youthParties : parties).map(party => {
                          const isSelected = responses[currentStepData.key as keyof NanoSurveyResponse] === party.display_name;
                          return (
                            <button
                              key={party.party_key}
                              className={`nc-party-btn${isSelected ? " selected" : ""}`}
                              style={isSelected ? { borderColor: party.color, boxShadow: `0 8px 24px ${party.color}25` } : {}}
                              onClick={() => handleAnswer(party.display_name)}
                            >
                              <div className="nc-party-check">
                                <Check size={11} color="#fff" strokeWidth={3} />
                              </div>
                              {party.logo_url ? (
                                <img src={party.logo_url} alt={party.display_name} className="nc-party-logo" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <div className="nc-party-logo-placeholder" style={{ background: party.color }}>
                                  {party.display_name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="nc-party-name">{party.display_name}</span>
                            </button>
                          );
                        })}
                        {/* Otro */}
                        <button
                          className={`nc-party-btn nc-party-otro${showOtroInput ? " selected" : ""}`}
                          style={showOtroInput ? { borderColor: "var(--nc-muted)", borderStyle: "solid" } : {}}
                          onClick={() => setShowOtroInput(!showOtroInput)}
                        >
                          <div style={{ fontSize: 24, color: "var(--nc-muted)" }}>+</div>
                          <span className="nc-party-name" style={{ color: "var(--nc-muted)" }}>Otro</span>
                        </button>
                      </div>
                      {showOtroInput && (
                        <div style={{ marginTop: 14 }}>
                          <input
                            className="nc-input"
                            type="text"
                            placeholder="Escribe el nombre del partido..."
                            value={
                              (() => {
                                const val = responses[currentStepData.key as keyof NanoSurveyResponse];
                                const knownParty = (currentStepData.type === "youth_party" ? youthParties : parties).find(p => p.display_name === val);
                                return knownParty ? "" : (String(val || ""));
                              })()
                            }
                            onChange={e => handleAnswer(e.target.value)}
                            autoFocus
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SLIDER (valoraciones 0-10) */}
              {currentStepData.type === "slider" && (
                <div>
                  <div className="nc-slider-grid">
                    {Array.from({ length: 11 }, (_, i) => i).map(num => {
                      const isSelected = responses[currentStepData.key as keyof NanoSurveyResponse] === num;
                      const pct = num / 10;
                      // Color from red→yellow→green
                      const r = Math.round(pct < 0.5 ? 232 : 232 - (pct - 0.5) * 2 * 180);
                      const g = Math.round(pct < 0.5 ? pct * 2 * 190 : 190);
                      const bg = `rgb(${r},${g},50)`;
                      return (
                        <button
                          key={num}
                          className={`nc-num-btn${isSelected ? " selected" : ""}`}
                          style={isSelected ? { background: bg, borderColor: bg } : {}}
                          onClick={() => handleAnswer(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="nc-slider-labels">
                    <span className="nc-slider-label">0 — Muy malo</span>
                    <span className="nc-slider-value">
                      {responses[currentStepData.key as keyof NanoSurveyResponse] !== undefined
                        ? String(responses[currentStepData.key as keyof NanoSurveyResponse])
                        : "—"}
                    </span>
                    <span className="nc-slider-label">10 — Muy bueno</span>
                  </div>
                </div>
              )}

              {/* IDEOLOGY (1-10) */}
              {currentStepData.type === "ideology" && (
                <div>
                  <div className="nc-ideology-grid">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                      const isSelected = responses[currentStepData.key as keyof NanoSurveyResponse] === num;
                      // Left=red, center=purple, right=blue
                      const colors = ["#dc2626","#ea580c","#d97706","#84cc16","#22c55e","#14b8a6","#3b82f6","#6366f1","#8b5cf6","#a855f7"];
                      return (
                        <button
                          key={num}
                          className={`nc-ideology-btn${isSelected ? " selected" : ""}`}
                          style={isSelected ? { background: colors[num - 1], borderColor: colors[num - 1] } : {}}
                          onClick={() => handleAnswer(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="nc-ideology-labels">
                    <span className="nc-ideology-label">◀ Izquierda</span>
                    <span style={{ fontSize: 13, color: "var(--nc-muted)" }}>
                      {responses.posicion_ideologica
                        ? `Posición: ${responses.posicion_ideologica}`
                        : "Selecciona tu posición"}
                    </span>
                    <span className="nc-ideology-label">Derecha ▶</span>
                  </div>
                </div>
              )}

              {/* LEADER */}
              {currentStepData.type === "leader" && (
                <div>
                  {!responses.voto_generales ? (
                    <div className="nc-warning">
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>Primero debes seleccionar tu partido en Elecciones Generales para ver los líderes disponibles.</span>
                    </div>
                  ) : (
                    <>
                      {selectedParty && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: "var(--nc-surface2)", borderRadius: 10, border: "1px solid var(--nc-border2)" }}>
                          {selectedParty.logo_url && <img src={selectedParty.logo_url} alt={selectedParty.display_name} style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 4 }} />}
                          <div>
                            <div style={{ fontSize: 11, color: "var(--nc-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Tu partido</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--nc-text)" }}>{selectedParty.display_name}</div>
                          </div>
                        </div>
                      )}
                      {loadingParties ? (
                        <div className="nc-loading-msg"><div className="nc-loading-spinner" style={{ marginBottom: 10 }} />Cargando líderes...</div>
                      ) : (
                        <div className="nc-leader-grid">
                          {partyLeaders.map(leader => {
                            const isSelected = responses.lider_partido === leader.leader_name;
                            return (
                              <button
                                key={leader.id}
                                className={`nc-leader-btn${isSelected ? " selected" : ""}`}
                                style={isSelected && selectedParty ? { borderColor: selectedParty.color, boxShadow: `0 8px 24px ${selectedParty.color}20` } : {}}
                                onClick={() => { handleAnswer(leader.leader_name); setShowCustomLeaderInput(false); }}
                              >
                                <div className="nc-leader-check">
                                  <Check size={10} color="#fff" strokeWidth={3} />
                                </div>
                                {leader.photo_url ? (
                                  <img
                                    src={leader.photo_url}
                                    alt={leader.leader_name}
                                    className="nc-leader-photo"
                                    style={isSelected && selectedParty ? { borderColor: selectedParty.color } : {}}
                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                ) : (
                                  <div className="nc-leader-photo-placeholder">
                                    {leader.leader_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                                  </div>
                                )}
                                <span className="nc-leader-name">{leader.leader_name}</span>
                              </button>
                            );
                          })}
                          {/* Otro líder */}
                          <button
                            className={`nc-leader-btn${showCustomLeaderInput ? " selected" : ""}`}
                            style={showCustomLeaderInput ? { borderColor: "var(--nc-muted)" } : {}}
                            onClick={() => setShowCustomLeaderInput(!showCustomLeaderInput)}
                          >
                            <div className="nc-leader-photo-placeholder" style={{ fontSize: 28 }}>+</div>
                            <span className="nc-leader-name" style={{ color: "var(--nc-muted)" }}>Otro</span>
                          </button>
                        </div>
                      )}
                      {showCustomLeaderInput && (
                        <div className="nc-custom-input-wrap">
                          <input
                            className="nc-input"
                            type="text"
                            placeholder="Nombre del líder..."
                            value={
                              (() => {
                                const val = responses.lider_partido;
                                return partyLeaders.some(l => l.leader_name === val) ? "" : (val || "");
                              })()
                            }
                            onChange={e => handleAnswer(e.target.value)}
                            autoFocus
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* CARDS (monarquia, territorio, pensiones) */}
              {currentStepData.type === "cards" && (
                <div className="nc-cards-grid">
                  {(cardOptions[currentStepData.key] || []).map(opt => {
                    const isSelected = responses[currentStepData.key as keyof NanoSurveyResponse] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        className={`nc-option-card${isSelected ? " selected" : ""}`}
                        style={isSelected ? { borderColor: "var(--nc-accent)", background: "rgba(232,70,90,0.05)" } : {}}
                        onClick={() => handleAnswer(opt.value)}
                      >
                        <div className="nc-option-radio">
                          <div className="nc-option-radio-dot" />
                        </div>
                        <div>
                          <div className="nc-option-label">{opt.label}</div>
                          {opt.desc && <div className="nc-option-desc">{opt.desc}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Navigation */}
            <div className="nc-nav">
              <button className="nc-btn-prev" onClick={() => navigate("prev")} disabled={currentStep === 0}>
                <ChevronLeft size={16} />
                Anterior
              </button>
              {currentStep === steps.length - 1 ? (
                <button
                  className="nc-btn-next"
                  onClick={() => { setShowReview(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={!isCurrentFieldComplete()}
                >
                  Revisar y enviar
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="nc-btn-next"
                  onClick={() => navigate("next")}
                  disabled={!isCurrentFieldComplete()}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
