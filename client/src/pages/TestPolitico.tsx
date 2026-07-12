import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Gavel,
  Users,
  Compass,
  CheckCircle2,
  Filter,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";

/* ============================================================
   TIPOS
   ============================================================ */

interface Weights {
  progressive: number;
  conservative: number;
  identity: number;
  disruptive: number;
}

interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
  weights: Weights;
  parties: string[];
}

interface Question {
  id: number;
  block: string;
  question: string;
  options: QuestionOption[];
}

interface Party {
  name: string;
  color: string;
  desc: string;
  primaryAxis: keyof Weights;
}

interface Leader {
  name: string;
  party: string;
  role: string;
  desc: string;
  type: "national" | "regional" | "global";
  weights: Weights;
}

/* ============================================================
   DATOS: PREGUNTAS (30)
   ============================================================ */

const QUESTIONS: Question[] = [
  // BLOQUE I: ECONOMÍA Y ESTADO
  {
    id: 1,
    block: "BLOQUE I: ECONOMÍA Y ESTADO",
    question: "¿Cómo debería ser la presión fiscal en España?",
    options: [
      { key: "A", text: "Altamente progresiva: justicia fiscal donde las grandes rentas y empresas aporten mucho más para blindar los servicios públicos.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.1 }, parties: ["PSOE", "Sumar", "Podemos", "ERC", "Bildu", "BNG", "Adelante"] },
      { key: "B", text: "Moderada y eficiente: reducción selectiva de impuestos a la clase media y pymes para favorecer el consumo y la inversión sin desmantelar el Estado.", weights: { progressive: 0.3, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Baja y competitiva: simplificación de tramos, reducción drástica del IRPF y eliminación de impuestos como Patrimonio y Sucesiones.", weights: { progressive: 0.0, conservative: 0.8, identity: 1.0, disruptive: 0.4 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Mínima o nula: el Estado no debe confiscar el fruto del trabajo; los impuestos deben reducirse al mínimo existencial.", weights: { progressive: 0.0, conservative: 0.2, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 2,
    block: "BLOQUE I: ECONOMÍA Y ESTADO",
    question: "¿Cuál debe ser el papel del Estado en el mercado del alquiler y la vivienda?",
    options: [
      { key: "A", text: "Intervención directa: topes de precios en zonas tensionadas, prohibición de desahucios sin alternativa y parque de vivienda pública masivo.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.1 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Estímulo y seguridad: incentivos fiscales a propietarios que alquilen a precios razonables, ayudas a jóvenes y agilización de licencias.", weights: { progressive: 0.6, conservative: 0.8, identity: 0.4, disruptive: 0.1 }, parties: ["PSOE", "PNV", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Liberalización del suelo: eliminación de trabas urbanísticas para aumentar la oferta y endurecimiento penal inmediato contra la ocupación.", weights: { progressive: 0.0, conservative: 1.0, identity: 0.8, disruptive: 0.3 }, parties: ["PP", "Vox", "Junts", "Aliança"] },
      { key: "D", text: "Desregulación absoluta: libre acuerdo entre las partes sin interferencia del Estado y protección total a la propiedad privada.", weights: { progressive: 0.0, conservative: 0.3, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 3,
    block: "BLOQUE I: ECONOMÍA Y ESTADO",
    question: "¿Qué modelo defiendes para el sistema de pensiones?",
    options: [
      { key: "A", text: "Blindaje público: revalorización garantizada por ley según el IPC e ingresos extra mediante impuestos a la banca y transacciones financieras.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.2, disruptive: 0.1 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Sostenibilidad mixta: incentivar la prolongación voluntaria de la vida laboral combinada con planes de pensiones colectivos de empresa.", weights: { progressive: 0.4, conservative: 1.0, identity: 0.4, disruptive: 0.2 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Capitalización individual opcional: fomentar planes privados individuales mediante desgravaciones fiscales, manteniendo una pensión pública mínima.", weights: { progressive: 0.0, conservative: 0.8, identity: 0.9, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Capitalización privada total: privatización del sistema para que cada ciudadano gestione sus propios ahorros de jubilación sin tutela estatal.", weights: { progressive: 0.0, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 4,
    block: "BLOQUE I: ECONOMÍA Y ESTADO",
    question: "¿Cómo valoras el Salario Mínimo Interprofesional (SMI)?",
    options: [
      { key: "A", text: "Debe seguir subiendo de forma decidida para garantizar un nivel de vida digno frente a la inflación.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.2, disruptive: 0.0 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Debe actualizarse únicamente mediante pactos de diálogo social entre patronal y sindicatos para no destruir empleo.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Debe congelarse o moderarse para mantener la competitividad de las pequeñas empresas y autónomos.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "No debería existir un SMI fijado por ley; los salarios deben pactarse libremente entre el empleador y el empleado.", weights: { progressive: 0.0, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 5,
    block: "BLOQUE I: ECONOMÍA Y ESTADO",
    question: "Sobre las empresas de sectores estratégicos (energía, telecomunicaciones, transporte):",
    options: [
      { key: "A", text: "Recuperar el control público o crear empresas estatales en sectores estratégicos para evitar el oligopolio y la especulación.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.2 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Mantener el modelo de gestión privada actual bajo una fuerte y rigurosa supervisión de los organismos reguladores del Estado.", weights: { progressive: 0.7, conservative: 0.9, identity: 0.4, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Privatizar los últimos reductos de participación estatal y liberalizar los sectores para fomentar la competencia real.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.6 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Liquidar o vender cualquier activo público y suprimir los organismos reguladores por distorsionar el libre mercado.", weights: { progressive: 0.0, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  // BLOQUE II: MODELO TERRITORIAL Y ESTADO
  {
    id: 6,
    block: "BLOQUE II: MODELO TERRITORIAL Y ESTADO",
    question: "¿Cuál es tu postura sobre el encaje territorial y el derecho de autodeterminación?",
    options: [
      { key: "A", text: "Plurinacionalidad: reconocimiento de las distintas realidades nacionales mediante referéndums pactados y vías de consulta legal.", weights: { progressive: 0.9, conservative: 0.1, identity: 0.3, disruptive: 0.5 }, parties: ["Sumar", "Podemos", "ERC", "Bildu", "BNG", "Adelante", "PNV", "Junts"] },
      { key: "B", text: "Autonomismo constitucional: defensa de la Constitución de 1978 y diálogo institucional, rechazando cualquier referéndum de secesión.", weights: { progressive: 0.7, conservative: 1.0, identity: 0.2, disruptive: 0.1 }, parties: ["PSOE", "PP", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Estado unitario y centralizado: devolución inmediata de competencias clave (Educación, Sanidad y Justicia) para garantizar la igualdad.", weights: { progressive: 0.0, conservative: 0.8, identity: 1.0, disruptive: 0.4 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "Ruptura o independencia unilateral: separación definitiva del Estado español si existe mayoría social en la región, sin pedir permiso.", weights: { progressive: 0.5, conservative: 0.0, identity: 0.4, disruptive: 1.0 }, parties: ["Aliança"] },
    ],
  },
  {
    id: 7,
    block: "BLOQUE II: MODELO TERRITORIAL Y ESTADO",
    question: "¿Qué opinas sobre la jefatura del Estado y la Monarquía?",
    options: [
      { key: "A", text: "Es una institución obsoleta y carente de legitimidad democrática; debe convocarse un referéndum para instaurar la República.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.4 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Es una figura clave que aporta neutralidad, arbitraje institucional y excelente representación internacional al país.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.6, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Debe defenderse firmemente como símbolo incuestionable de la unidad histórica de España frente a los nacionalismos.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.3 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "La forma del Estado es secundaria; lo que importa es quién ostenta el poder real y la efectividad del control ejecutivo.", weights: { progressive: 0.2, conservative: 0.3, identity: 0.4, disruptive: 1.0 }, parties: ["Aliança", "Democracia21"] },
    ],
  },
  {
    id: 8,
    block: "BLOQUE II: MODELO TERRITORIAL Y ESTADO",
    question: "Respecto a la financiación autonómica y el desarrollo de la \"España Vaciada\":",
    options: [
      { key: "A", text: "Descentralización institucional: trasladar organismos estatales a provincias despobladas y aumentar la inversión rural de forma prioritaria.", weights: { progressive: 0.9, conservative: 0.5, identity: 0.3, disruptive: 0.2 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "Nueve"] },
      { key: "B", text: "Equilibrio y corresponsabilidad: un nuevo pacto de financiación autonómica multilateral que asegure la igualdad de servicios territoriales.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PP", "CC", "UPN", "PNV"] },
      { key: "C", text: "Beneficios fiscales rurales: exenciones y rebajas de impuestos drásticas para empresas e individuos que se asienten en zonas despobladas.", weights: { progressive: 0.1, conservative: 0.7, identity: 1.0, disruptive: 0.6 }, parties: ["Vox", "SALF", "Junts", "Aliança"] },
      { key: "D", text: "Desmantelamiento de duplicidades: suprimir las diputaciones y entes autonómicos innecesarios, canalizando los recursos a los municipios.", weights: { progressive: 0.0, conservative: 0.4, identity: 0.5, disruptive: 1.0 }, parties: ["Democracia21"] },
    ],
  },
  {
    id: 9,
    block: "BLOQUE II: MODELO TERRITORIAL Y ESTADO",
    question: "¿Cómo debería estructurarse el mapa administrativo del país?",
    options: [
      { key: "A", text: "Un modelo federal o confederal que otorgue el máximo nivel de soberanía fiscal y competencial a las comunidades y municipios.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.4, disruptive: 0.4 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG", "PNV", "Junts"] },
      { key: "B", text: "Mantener la estructura actual del Estado de las Autonomías, corrigiendo ineficiencias puntuales sin alterar la Constitución.", weights: { progressive: 0.7, conservative: 1.0, identity: 0.2, disruptive: 0.1 }, parties: ["PSOE", "PP", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Supresión progresiva de las autonomías y las cámaras regionales para volver a un modelo de administración central única.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.3 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "Un sistema descentralizado basado únicamente en distritos locales fuertes o cantones independientes, vaciando de poder al gobierno central.", weights: { progressive: 0.2, conservative: 0.2, identity: 0.3, disruptive: 1.0 }, parties: ["Aliança", "Democracia21"] },
    ],
  },
  {
    id: 10,
    block: "BLOQUE II: MODELO TERRITORIAL Y ESTADO",
    question: "Sobre el uso de las lenguas cooficiales en la administración del Estado y el Congreso:",
    options: [
      { key: "A", text: "Plena cooficialidad: uso libre, traducción garantizada y fomento activo de todas las lenguas como patrimonio común.", weights: { progressive: 1.0, conservative: 0.2, identity: 0.3, disruptive: 0.3 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG", "PNV", "Junts"] },
      { key: "B", text: "Coexistencia equilibrada: respeto a las lenguas autonómicas garantizando siempre que el castellano sea la lengua vehicular común.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Primacía del castellano: el español debe ser la única lengua obligatoria y vehicular en la administración y la educación pública nacional.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.4 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "Monolingüismo identitario regional: exclusividad de la lengua propia del territorio en la administración local para salvaguardar la identidad.", weights: { progressive: 0.4, conservative: 0.0, identity: 0.5, disruptive: 1.0 }, parties: ["Aliança"] },
    ],
  },
  // BLOQUE III: POLÍTICAS SOCIALES Y VALORES
  {
    id: 11,
    block: "BLOQUE III: POLÍTICAS SOCIALES Y VALORES",
    question: "¿Cuál es tu postura sobre la Ley de Bienestar Animal y festejos como la tauromaquia?",
    options: [
      { key: "A", text: "Protección máxima: prohibición absoluta de la tauromaquia, fin de la caza deportiva y endurecimiento de penas por maltrato.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.3 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Regulación tradicional equilibrada: proteger a los animales domésticos pero respetando las tradiciones y la actividad cinegética.", weights: { progressive: 0.7, conservative: 0.9, identity: 0.4, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Exclusión del mundo rural: derogación de normativas restrictivas que asfixian a ganaderos y cazadores, defendiendo los toros.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.4 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "Desregulación de actividades tradicionales: el bienestar animal no debe limitar la libertad de propiedad ni la explotación ganadera.", weights: { progressive: 0.1, conservative: 0.3, identity: 0.5, disruptive: 1.0 }, parties: ["Aliança", "Democracia21"] },
    ],
  },
  {
    id: 12,
    block: "BLOQUE III: POLÍTICAS SOCIALES Y VALORES",
    question: "Sobre los derechos LGTBI+ y la autodeterminación de género (Ley Trans):",
    options: [
      { key: "A", text: "Apoyo absoluto: ampliación de derechos de autodeterminación, despatologización de los procesos y diversidad en las aulas.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.1 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Respeto con cautela: garantizar la no discriminación pero revisando aspectos médicos e intervenciones, especialmente en menores.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.2 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Derogación de leyes de género: sustitución por leyes de igualdad basadas estrictamente en el sexo biológico y eliminación del concepto.", weights: { progressive: 0.0, conservative: 0.8, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Rechazo a la intervención estatal: el Estado no debe legislar ni financiar agendas de identidad de género ni promoverlas.", weights: { progressive: 0.0, conservative: 0.2, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 13,
    block: "BLOQUE III: POLÍTICAS SOCIALES Y VALORES",
    question: "¿Qué directrices deben regir la política migratoria y el control de fronteras?",
    options: [
      { key: "A", text: "Enfoque humanitario: regularización de personas migrantes en situación administrativa irregular y fomento de vías de integración.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.1, disruptive: 0.1 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Migración ordenada: vinculación estricta de flujos a las necesidades del mercado laboral y control fronterizo riguroso.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.2 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Control de fronteras y repatriación: expulsión inmediata de irregulares, especialmente con antecedentes delictivos, y cierre de menas.", weights: { progressive: 0.0, conservative: 0.8, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "Fronteras militarizadas y preferencia nacional: prioridad absoluta para los nacidos en el territorio en el acceso a ayudas y sanidad.", weights: { progressive: 0.0, conservative: 0.3, identity: 0.6, disruptive: 1.0 }, parties: ["Aliança", "Democracia21"] },
    ],
  },
  {
    id: 14,
    block: "BLOQUE III: POLÍTICAS SOCIALES Y VALORES",
    question: "Educación, libertad de elección y asignaturas de valores/religión:",
    options: [
      { key: "A", text: "Pública, laica y diversa: fin de la financiación a la escuela concertada y fomento de valores cívicos y educación afectivo-sexual.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.2 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Sistema educativo mixto: mantenimiento de la escuela concertada respetando la libertad de elección de los padres y opción de religión.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Educación tradicional y patriótica: fomento de la historia nacional, raíces cristianas y rechazo a contenidos de sesgo ideológico.", weights: { progressive: 0.0, conservative: 0.8, identity: 1.0, disruptive: 0.4 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Cheque escolar y PIN parental: los padres deciden y pagan directamente la educación; el Estado no interviene en el ideario.", weights: { progressive: 0.0, conservative: 0.3, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 15,
    block: "BLOQUE III: POLÍTICAS SOCIALES Y VALORES",
    question: "Ley de Memoria Democrática y reparación histórica:",
    options: [
      { key: "A", text: "Necesaria y justa: exhumación de fosas comunes, reparación de todas las víctimas del franquismo y retirada de simbología.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.2 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Superación de trincheras: enfoque en la concordia histórica y la reconciliación nacional sin reabrir heridas políticas.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Ley de Concordia unificada: protección de todas las víctimas de la violencia política a lo largo de la historia, sin visiones sesgadas.", weights: { progressive: 0.0, conservative: 0.8, identity: 1.0, disruptive: 0.4 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Derogación absoluta: la historia debe quedar para los historiadores; las leyes de memoria son adoctrinamiento político.", weights: { progressive: 0.0, conservative: 0.2, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  // BLOQUE IV: REFORMAS INSTITUCIONALES Y GOBERNANZA
  {
    id: 16,
    block: "BLOQUE IV: REFORMAS INSTITUCIONALES Y GOBERNANZA",
    question: "¿Qué opinas sobre el uso de la democracia directa mediante referéndums ciudadanos?",
    options: [
      { key: "A", text: "Imprescindible: la ciudadanía debe poder convocar y votar en referéndums vinculantes sobre leyes importantes (modelo suizo).", weights: { progressive: 1.0, conservative: 0.1, identity: 0.5, disruptive: 0.6 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Innecesaria: la democracia representativa garantiza la estabilidad; los referéndums polarizan debates complejos.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.2, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Herramienta excepcional: útil en momentos muy puntuales para refrendar grandes decisiones nacionales o cambios constitucionales.", weights: { progressive: 0.2, conservative: 0.8, identity: 1.0, disruptive: 0.3 }, parties: ["Vox", "Aliança", "Junts"] },
      { key: "D", text: "Democracia digital líquida: superación de los partidos mediante voto digital directo a través de plataformas seguras (blockchain).", weights: { progressive: 0.4, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 17,
    block: "BLOQUE IV: REFORMAS INSTITUCIONALES Y GOBERNANZA",
    question: "Sobre la transición ecológica, las emisiones y la Agenda 2030:",
    options: [
      { key: "A", text: "Emergencia climática: descarbonización rápida, fuerte inversión en renovables, impuestos verdes y fin del motor de combustión.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.1 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Transición progresiva: compatibilizar la sostenibilidad ambiental con el crecimiento económico y la competitividad industrial.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Crítica a la Agenda 2030: flexibilización de exigencias ecológicas que ahogan a agricultores y ganaderos frente a importaciones.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Soberanía energética total: rechazo a la Agenda 2030 por considerarla una imposición globalista que atenta contra la economía nacional.", weights: { progressive: 0.0, conservative: 0.2, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 18,
    block: "BLOQUE IV: REFORMAS INSTITUCIONALES Y GOBERNANZA",
    question: "Elección de los órganos de la Justicia (CGPJ, Fiscal General):",
    options: [
      { key: "A", text: "Legitimidad parlamentaria: elección directa por parte de los representantes del pueblo en el Congreso para evitar corporativismos.", weights: { progressive: 1.0, conservative: 0.3, identity: 0.3, disruptive: 0.2 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Independencia pactada: consenso entre las grandes fuerzas del país para garantizar perfiles profesionales técnicos de prestigio.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Elección corporativa pura: que los propios jueces elijan democráticamente a sus representantes en el CGPJ, sin partidos.", weights: { progressive: 0.1, conservative: 0.8, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Junts", "Aliança"] },
      { key: "D", text: "Reforma total judicial: renovación radical de la cúpula para acabar con la prevaricación sistémica al servicio del poder establecido.", weights: { progressive: 0.3, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 19,
    block: "BLOQUE IV: REFORMAS INSTITUCIONALES Y GOBERNANZA",
    question: "Libertad de expresión, bulos (fake news) y redes sociales:",
    options: [
      { key: "A", text: "Regulación estatal: intervención de las instituciones contra la desinformación organizada, discursos de odio y difamaciones online.", weights: { progressive: 1.0, conservative: 0.2, identity: 0.1, disruptive: 0.1 }, parties: ["PSOE", "Sumar", "Podemos", "ERC", "Bildu", "BNG", "Adelante"] },
      { key: "B", text: "Límites estándar: mantenimiento de las normativas vigentes en el Código Penal y protección del honor por vía judicial ordinaria.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Libertad de expresión digital: protección total de la opinión en internet, combatiendo la censura bajo pretexto de lo correcto.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.6 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Fiscalización independiente: uso libre de redes sociales para exponer y denunciar corrupción mediante activismo digital directo y filtraciones.", weights: { progressive: 0.1, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 20,
    block: "BLOQUE IV: REFORMAS INSTITUCIONALES Y GOBERNANZA",
    question: "Política de Defensa, soberanía militar y la OTAN:",
    options: [
      { key: "A", text: "Pacifismo y autonomía: reducción de inversión militar, fomento del desarme y menor dependencia de alianzas belicistas.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.2 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Compromisos internacionales: aumento del presupuesto de Defensa nacional hasta metas OTAN y fortalecimiento de misiones europeas.", weights: { progressive: 0.7, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Defensa nacional soberana: priorizar el gasto militar en la protección directa de fronteras (como Ceuta y Melilla) y soberanía territorial.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Disuasión tecnológica avanzada: fuerzas armadas profesionales de alto nivel tecnológico y reclutamiento voluntario ágil para autodefensa.", weights: { progressive: 0.2, conservative: 0.3, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  // BLOQUE V: REGIONALISMO Y PARTIDOS ESPECÍFICOS
  {
    id: 21,
    block: "BLOQUE V: REGIONALISMO Y PARTIDOS ESPECÍFICOS",
    question: "¿Qué prioridad consideras vital para autonomías tradicionalmente olvidadas como Castilla y León?",
    options: [
      { key: "A", text: "Inversión pública masiva: conectividad digital, transporte ferroviario y mantenimiento de escuelas rurales frente al abandono.", weights: { progressive: 1.0, conservative: 0.4, identity: 0.3, disruptive: 0.2 }, parties: ["PSOE", "Sumar", "Podemos", "Adelante", "BNG", "Nueve"] },
      { key: "B", text: "Desarrollo agroindustrial y fondos europeos: canalización eficaz de subvenciones para consolidar la competitividad del campo.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.1 }, parties: ["PP", "PNV", "CC", "UPN", "Junts"] },
      { key: "C", text: "Incentivos fiscales rurales: exenciones y simplificación de licencias para que jóvenes y empresas agropecuarias se asienten en el territorio.", weights: { progressive: 0.1, conservative: 0.7, identity: 1.0, disruptive: 0.6 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Descentralización fiscal: que los impuestos se queden en un 90% para desarrollo directo rural, eliminando burocracia central.", weights: { progressive: 0.3, conservative: 0.2, identity: 0.5, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 22,
    block: "BLOQUE V: REGIONALISMO Y PARTIDOS ESPECÍFICOS",
    question: "¿Cómo valoras la actuación de la clase política y los partidos tradicionales?",
    options: [
      { key: "A", text: "Reforma del sistema: democratizar los partidos por dentro, garantizar listas abiertas y reformar la ley electoral sin destruir el modelo.", weights: { progressive: 1.0, conservative: 0.4, identity: 0.3, disruptive: 0.3 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG", "Nueve"] },
      { key: "B", text: "Garantía de estabilidad: los partidos tradicionales son la columna constitucional; la crispación se combate con gestión técnica sólida.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.2, disruptive: 0.0 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts"] },
      { key: "C", text: "Casta corporativa: los partidos actuales son organizaciones de intereses privados que hay que fiscalizar y desmontar con denuncias públicas.", weights: { progressive: 0.0, conservative: 0.6, identity: 1.0, disruptive: 0.7 }, parties: ["Vox", "SALF"] },
      { key: "D", text: "Estructuras obsoletas: deben ser sustituidas por plataformas de toma de decisiones directa, asambleas digitales y voto algorítmico.", weights: { progressive: 0.3, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["Democracia21"] },
    ],
  },
  {
    id: 23,
    block: "BLOQUE V: REGIONALISMO Y PARTIDOS ESPECÍFICOS",
    question: "¿Qué visión defiendes sobre la identidad cultural y económica andaluza?",
    options: [
      { key: "A", text: "Soberanismo social andaluz: Andalucía como realidad nacional histórica que debe autogestionar sus recursos para no ser periferia explotada.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.3, disruptive: 0.3 }, parties: ["Adelante", "Podemos", "Sumar"] },
      { key: "B", text: "Autonomía e igualdad: un andalucismo integrador dentro de España que potencie la cultura local sin confrontar con el resto del territorio.", weights: { progressive: 0.7, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PSOE", "PP", "CC", "UPN", "Nueve"] },
      { key: "C", text: "Foco en la inversión: rebajar impuestos autonómicos drásticamente y simplificar trabas para atraer turismo y potenciar la agricultura.", weights: { progressive: 0.1, conservative: 0.7, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Junts", "PNV"] },
      { key: "D", text: "Unidad nacional indiscutible: las identidades regionales no deben ser utilizadas políticamente para fragmentar la soberanía del pueblo español.", weights: { progressive: 0.0, conservative: 0.4, identity: 0.6, disruptive: 1.0 }, parties: ["SALF", "Aliança"] },
    ],
  },
  {
    id: 24,
    block: "BLOQUE V: REGIONALISMO Y PARTIDOS ESPECÍFICOS",
    question: "Sobre la identidad catalana y la gestión de la inmigración en Cataluña:",
    options: [
      { key: "A", text: "Independencia social y acogida: república catalana laica, progresista e integradora que asuma la multiculturalidad como pilar.", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.4 }, parties: ["ERC", "Sumar", "Podemos"] },
      { key: "B", text: "Estatuto constitucional: diálogo bilateral para optimizar el autogobierno financiero y competencial dentro del marco legal vigente.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts"] },
      { key: "C", text: "Nacionalismo identitario protector: independencia inmediata de Cataluña protegiendo la lengua y limitando flujos migratorios externos.", weights: { progressive: 0.2, conservative: 0.4, identity: 1.0, disruptive: 0.7 }, parties: ["Aliança"] },
      { key: "D", text: "Recentralización firme: combate riguroso a la fragmentación del separatismo catalán, con aplicación de la ley y control de fronteras estatal.", weights: { progressive: 0.0, conservative: 0.6, identity: 0.8, disruptive: 1.0 }, parties: ["Vox", "SALF"] },
    ],
  },
  {
    id: 25,
    block: "BLOQUE V: REGIONALISMO Y PARTIDOS ESPECÍFICOS",
    question: "Ante el fenómeno sistémico de la corrupción política:",
    options: [
      { key: "A", text: "Auditoría pública y fiscalías: dotar de recursos extraordinarios a la justicia anticorrupción, transparencia activa y auditorías ciudadanas.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.2, disruptive: 0.3 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Refuerzo institucional: blindar los mecanismos estatales de control ya existentes como el Tribunal de Cuentas o la intervención general.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Reducción del Estado: achicar la administración y privatizar áreas propensas a contratos públicos sospechosos para erradicar el desvío de dinero.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.6 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Exposición masiva digital: hackear, auditar de forma independiente y publicar toda la información sensible de contratos de las administraciones.", weights: { progressive: 0.2, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  // BLOQUE VI: LIDERAZGO Y PERSONALIDAD
  {
    id: 26,
    block: "BLOQUE VI: LIDERAZGO Y PERSONALIDAD",
    question: "¿Cuál es la cualidad indispensable en un gobernante?",
    options: [
      { key: "A", text: "Empatía y vocación de justicia social: una inquebrantable capacidad de diálogo constructivo con colectivos sociales vulnerables.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.2, disruptive: 0.1 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Sentido de Estado y rigor técnico: la serenidad de quien gestiona con seriedad, respetando el ordenamiento y garantizando estabilidad.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.4, disruptive: 0.0 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Determinación patriótica: el carisma innegociable de quien confronta al sistema de valores establecido y defiende la soberanía nacional.", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Independencia disruptiva: la astucia pragmática y la agilidad tecnológica de quien rompe las reglas tradicionales para desmantelar la burocracia.", weights: { progressive: 0.2, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 27,
    block: "BLOQUE VI: LIDERAZGO Y PERSONALIDAD",
    question: "Ante una crisis institucional o revuelta social grave, el líder debe:",
    options: [
      { key: "A", text: "Convocar una asamblea ciudadana y una mesa de diálogo social amplia con todos los agentes representativos.", weights: { progressive: 1.0, conservative: 0.1, identity: 0.2, disruptive: 0.2 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Aplicar la ley vigente con firmeza garantizando el restablecimiento del orden público y la seguridad del Estado.", weights: { progressive: 0.5, conservative: 1.0, identity: 0.5, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Movilizar activamente a las bases ciudadanas en defensa de la identidad nacional, señalando a los enemigos de la soberanía.", weights: { progressive: 0.0, conservative: 0.6, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Utilizar canales y plataformas digitales para esquivar las instituciones, promoviendo el autocontrol y la descentralización de las decisiones.", weights: { progressive: 0.2, conservative: 0.1, identity: 0.3, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 28,
    block: "BLOQUE VI: LIDERAZGO Y PERSONALIDAD",
    question: "¿Cómo debe ser el estilo y canal de comunicación del líder?",
    options: [
      { key: "A", text: "Pedagógico y cercano: con un fuerte enfoque explicativo y participativo a través de comparecencias de debate abierto.", weights: { progressive: 1.0, conservative: 0.2, identity: 0.2, disruptive: 0.1 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Solemne e institucional: prudente, sobrio y enfocado en proyectar la solidez e integridad de la presidencia.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.0 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Combativo y disruptivo: directo, emocional y sin filtros, utilizando internet para confrontar las narrativas de los grandes medios.", weights: { progressive: 0.0, conservative: 0.6, identity: 1.0, disruptive: 0.6 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Descentralizado y líquido: interactuando de forma horizontal y digital con la ciudadanía mediante encuestas en tiempo real para co-crear propuestas.", weights: { progressive: 0.3, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 29,
    block: "BLOQUE VI: LIDERAZGO Y PERSONALIDAD",
    question: "¿Qué relación debe mantener el líder con la verdad en la comunicación política?",
    options: [
      { key: "A", text: "Transparencia rigurosa: honestidad innegociable con el ciudadano, incluso cuando los datos perjudican el interés electoral.", weights: { progressive: 1.0, conservative: 0.2, identity: 0.3, disruptive: 0.3 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "Responsabilidad institucional: priorizar la veracidad sin comprometer la seguridad nacional o la estabilidad de los mercados.", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.1 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "Relato estratégico: la verdad se disputa comunicativamente; hay que enfocar los hechos con la fuerza ideológica del proyecto nacional.", weights: { progressive: 0.1, conservative: 0.6, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "Desmitificación implacable: desmontar las narrativas de conveniencia de las élites revelando datos crudos sin corrección política.", weights: { progressive: 0.2, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
  {
    id: 30,
    block: "BLOQUE VI: LIDERAZGO Y PERSONALIDAD",
    question: "Selecciona el lema político que más resuena contigo:",
    options: [
      { key: "A", text: "\"Donde hay una necesidad, nace un derecho.\" (Justicia social y ampliación del bienestar público)", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.1 }, parties: ["Sumar", "Podemos", "Adelante", "ERC", "Bildu", "BNG"] },
      { key: "B", text: "\"Gobernar es gestionar con responsabilidad, orden y sentido de Estado.\"", weights: { progressive: 0.6, conservative: 1.0, identity: 0.3, disruptive: 0.0 }, parties: ["PSOE", "PP", "PNV", "CC", "UPN", "Junts", "Nueve"] },
      { key: "C", text: "\"Recuperar la soberanía del pueblo y salvaguardar nuestra identidad histórica.\"", weights: { progressive: 0.0, conservative: 0.6, identity: 1.0, disruptive: 0.5 }, parties: ["Vox", "Aliança"] },
      { key: "D", text: "\"El poder reside en la soberanía individual, libre del yugo y el control del Estado.\"", weights: { progressive: 0.1, conservative: 0.1, identity: 0.4, disruptive: 1.0 }, parties: ["SALF", "Democracia21"] },
    ],
  },
];

/* ============================================================
   DATOS: PARTIDOS
   ============================================================ */

const PARTIES: Record<string, Party> = {
  PSOE: { name: "PSOE", color: "#E30613", desc: "Socialdemocracia, federalismo moderado y progresismo institucional.", primaryAxis: "progressive" },
  PP: { name: "PP", color: "#00A4E4", desc: "Conservadurismo liberal, autonomismo constitucional y centroderecha.", primaryAxis: "conservative" },
  Vox: { name: "Vox", color: "#52C41A", desc: "Derecha identitaria, nacional-patriotismo, centralización fiscal y social.", primaryAxis: "identity" },
  Sumar: { name: "Sumar", color: "#E5007E", desc: "Plataforma ecosocialista, feminista, progresista y laborista plurinacional.", primaryAxis: "progressive" },
  Podemos: { name: "Podemos", color: "#612D62", desc: "Izquierda transformadora, republicanismo y asamblearismo social directo.", primaryAxis: "progressive" },
  ERC: { name: "ERC", color: "#FFB200", desc: "Soberanismo e independentismo de izquierdas, republicano y socialdemócrata.", primaryAxis: "progressive" },
  Bildu: { name: "EH Bildu", color: "#00BFA5", desc: "Izquierda soberanista vasca, antifascismo y transformaciones sociales.", primaryAxis: "progressive" },
  PNV: { name: "EAJ-PNV", color: "#008000", desc: "Nacionalismo vasco institucional, demócrata-cristiano y gestión económica eficiente.", primaryAxis: "conservative" },
  Junts: { name: "Junts per Catalunya", color: "#00C2E0", desc: "Soberanismo catalán transversal con un fuerte enfoque liberal económico.", primaryAxis: "conservative" },
  CC: { name: "Coalición Canaria", color: "#009B77", desc: "Nacionalismo canario moderado, centrismo e interés insular.", primaryAxis: "conservative" },
  BNG: { name: "BNG", color: "#50B3E6", desc: "Nacionalismo gallego transformador, ecologista y plurinacional de izquierdas.", primaryAxis: "progressive" },
  UPN: { name: "UPN", color: "#013A81", desc: "Regionalismo navarro conservador, foralismo constitucional e identidad propia.", primaryAxis: "conservative" },
  Adelante: { name: "Adelante Andalucía", color: "#006241", desc: "Andalucismo de izquierdas, soberanista, anticapitalista y ecologista.", primaryAxis: "progressive" },
  Aliança: { name: "Aliança Catalana", color: "#C5A059", desc: "Independentismo identitario catalán con enfoque conservador e inmigración controlada.", primaryAxis: "identity" },
  SALF: { name: "SALF (Se Acabó la Fiesta)", color: "#FF6F00", desc: "Plataforma antisistema, combate judicial-digital y antipolítica tradicional.", primaryAxis: "disruptive" },
  Nueve: { name: "Nueve CYL", color: "#7B1FA2", desc: "Regionalismo y ruralismo de Castilla y León enfocado en combatir la despoblación.", primaryAxis: "conservative" },
  Democracia21: { name: "Democracia 21", color: "#00E5FF", desc: "Iniciativa de democracia digital directa, líquida y tecnología de consenso.", primaryAxis: "disruptive" },
};

/* ============================================================
   DATOS: LÍDERES
   ============================================================ */

const LEADERS: Leader[] = [
  { name: "Pedro Sánchez", party: "PSOE", role: "Presidente del Gobierno", desc: "Pragmatismo, táctica política ágil y resiliencia institucional.", type: "national", weights: { progressive: 0.8, conservative: 0.4, identity: 0.2, disruptive: 0.5 } },
  { name: "María Jesús Montero", party: "PSOE", role: "Ministra de Hacienda", desc: "Consistencia fiscal socialdemócrata y negociación territorial de recursos.", type: "national", weights: { progressive: 0.9, conservative: 0.3, identity: 0.2, disruptive: 0.2 } },
  { name: "Alberto Núñez Feijóo", party: "PP", role: "Presidente del Partido Popular", desc: "Gobernanza institucional previsoria, sobriedad y control presupuestario.", type: "national", weights: { progressive: 0.3, conservative: 0.9, identity: 0.4, disruptive: 0.1 } },
  { name: "Isabel Díaz Ayuso", party: "PP", role: "Presidenta de la Comunidad de Madrid", desc: "Liberalismo fiscal agresivo, batalla cultural contra la izquierda y estilo directo.", type: "national", weights: { progressive: 0.1, conservative: 0.8, identity: 0.8, disruptive: 0.7 } },
  { name: "Santiago Abascal", party: "Vox", role: "Presidente de Vox", desc: "Nacionalismo soberano español, conservadurismo moral y valores tradicionales.", type: "national", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.4 } },
  { name: "Pepa Millán", party: "Vox", role: "Portavoz en el Congreso", desc: "Oratoria combativa, firme fiscalización jurídica e identidad cultural férrea.", type: "national", weights: { progressive: 0.0, conservative: 0.8, identity: 0.9, disruptive: 0.3 } },
  { name: "Yolanda Díaz", party: "Sumar", role: "Vicepresidenta Segunda", desc: "Diálogo social activo, ampliación laboral de derechos y socialdemocracia.", type: "national", weights: { progressive: 1.0, conservative: 0.2, identity: 0.1, disruptive: 0.1 } },
  { name: "Ernest Urtasun", party: "Sumar", role: "Ministro de Cultura / Portavoz", desc: "Ecologismo, progresismo institucional europeo y políticas de diversidad.", type: "national", weights: { progressive: 0.95, conservative: 0.1, identity: 0.1, disruptive: 0.2 } },
  { name: "Ione Belarra", party: "Podemos", role: "Secretaria General", desc: "Pacifismo activo, coherencia ideológica de izquierdas y republicanismo.", type: "national", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.3 } },
  { name: "Irene Montero", party: "Podemos", role: "Eurodiputada", desc: "Feminismo interseccional, leyes de autodeterminación y lucha social directa.", type: "national", weights: { progressive: 1.0, conservative: 0.0, identity: 0.1, disruptive: 0.4 } },
  { name: "Gabriel Rufián", party: "ERC", role: "Portavoz en el Congreso", desc: "Soberanismo catalán progresista de fuerte corte discursivo popular.", type: "regional", weights: { progressive: 0.9, conservative: 0.1, identity: 0.3, disruptive: 0.5 } },
  { name: "Marta Rovira", party: "ERC", role: "Secretaria General", desc: "Estrategia organizativa independentista, republicanismo y diálogo institucional.", type: "regional", weights: { progressive: 0.9, conservative: 0.2, identity: 0.4, disruptive: 0.3 } },
  { name: "Arnaldo Otegi", party: "Bildu", role: "Coordinador General", desc: "Estrategia nacionalista vasca de izquierdas y pacifismo soberanista.", type: "regional", weights: { progressive: 0.9, conservative: 0.1, identity: 0.4, disruptive: 0.3 } },
  { name: "Oskar Matute", party: "Bildu", role: "Portavoz en el Congreso", desc: "Discurso obrero socialista, anticapitalismo y sólida dialéctica institucional.", type: "regional", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.4 } },
  { name: "Imanol Pradales", party: "PNV", role: "Lehendakari", desc: "Tecnocracia de gestión vasca, fomento industrial e institucionalismo estable.", type: "regional", weights: { progressive: 0.4, conservative: 0.9, identity: 0.4, disruptive: 0.1 } },
  { name: "Aitor Esteban", party: "PNV", role: "Portavoz en el Congreso", desc: "Parlamentarismo parlamentario, defensa del fuero navarro-vasco y pacto técnico.", type: "regional", weights: { progressive: 0.5, conservative: 0.9, identity: 0.3, disruptive: 0.1 } },
  { name: "Carles Puigdemont", party: "Junts", role: "President en el exilio", desc: "Liderazgo personalista enfocado en la legitimidad de la declaración del 1-O.", type: "regional", weights: { progressive: 0.4, conservative: 0.6, identity: 0.5, disruptive: 0.9 } },
  { name: "Míriam Nogueras", party: "Junts", role: "Portavoz en el Congreso", desc: "Soberanismo estricto, presión fiscal catalana propia y negociación dura.", type: "regional", weights: { progressive: 0.3, conservative: 0.7, identity: 0.6, disruptive: 0.7 } },
  { name: "Fernando Clavijo", party: "CC", role: "Presidente de Canarias", desc: "Defensa del fuero canario, estabilidad presupuestaria e intereses isleños.", type: "regional", weights: { progressive: 0.5, conservative: 0.8, identity: 0.3, disruptive: 0.1 } },
  { name: "Cristina Valido", party: "CC", role: "Diputada en el Congreso", desc: "Políticas activas de equilibrio interinsular y pactismo moderado.", type: "regional", weights: { progressive: 0.5, conservative: 0.7, identity: 0.4, disruptive: 0.1 } },
  { name: "Ana Pontón", party: "BNG", role: "Líder de la Oposición Gallega", desc: "Nacionalismo transformador, cercanía social gallega y ecologismo rural.", type: "regional", weights: { progressive: 0.9, conservative: 0.2, identity: 0.4, disruptive: 0.2 } },
  { name: "Néstor Rego", party: "BNG", role: "Diputado en el Congreso", desc: "Reivindicación de infraestructuras plurinacionales de izquierda gallega.", type: "regional", weights: { progressive: 0.95, conservative: 0.1, identity: 0.4, disruptive: 0.3 } },
  { name: "Cristina Ibarrola", party: "UPN", role: "Presidenta de UPN", desc: "Defensa del régimen foral de Navarra e identidad unida a España.", type: "regional", weights: { progressive: 0.2, conservative: 0.9, identity: 0.5, disruptive: 0.1 } },
  { name: "Alberto Catalán", party: "UPN", role: "Diputado en el Congreso", desc: "Firmeza institucional constitucionalista contra el nacionalismo vasco.", type: "regional", weights: { progressive: 0.1, conservative: 0.9, identity: 0.6, disruptive: 0.1 } },
  { name: "José Ignacio García", party: "Adelante", role: "Portavoz Andaluz", desc: "Defensa soberanista andaluza de izquierdas frente al abandono industrial.", type: "regional", weights: { progressive: 1.0, conservative: 0.0, identity: 0.3, disruptive: 0.3 } },
  { name: "Teresa Rodríguez", party: "Adelante", role: "Líder fundadora", desc: "Activismo ecosocialista, republicanismo plurinacional y soberanía del sur.", type: "regional", weights: { progressive: 1.0, conservative: 0.0, identity: 0.2, disruptive: 0.4 } },
  { name: "Sílvia Orriols", party: "Aliança", role: "Alcaldesa de Ripoll", desc: "Independentismo de corte identitario, control férreo de la inmigración.", type: "regional", weights: { progressive: 0.1, conservative: 0.5, identity: 1.0, disruptive: 0.8 } },
  { name: "Lluís Areny", party: "Aliança", role: "Coordinador Ejecutivo", desc: "Estructura organizativa enfocada en la preservación identitaria catalana.", type: "regional", weights: { progressive: 0.1, conservative: 0.6, identity: 0.9, disruptive: 0.7 } },
  { name: "Alvise Pérez", party: "SALF", role: "Eurodiputado", desc: "Activismo digital, denuncias anticorrupción y estilo disyuntivo y punzante.", type: "national", weights: { progressive: 0.1, conservative: 0.3, identity: 0.6, disruptive: 1.0 } },
  { name: "Vito Quiles", party: "SALF", role: "Portavoz de Prensa", desc: "Periodismo confrontativo directo y cuestionamiento a las ruedas de prensa gubernamentales.", type: "national", weights: { progressive: 0.1, conservative: 0.3, identity: 0.6, disruptive: 0.9 } },
  { name: "Carlos Javier Salgado", party: "Nueve", role: "Defensor Rural", desc: "Foco identitario y económico leonés-castellano contra la despoblación.", type: "regional", weights: { progressive: 0.5, conservative: 0.8, identity: 0.5, disruptive: 0.2 } },
  { name: "Celedonio Pérez", party: "Nueve", role: "Portavoz de Desarrollo", desc: "Inversión pública agraria, reequilibrio territorial y dotación tecnológica.", type: "regional", weights: { progressive: 0.6, conservative: 0.7, identity: 0.4, disruptive: 0.2 } },
  { name: "Sonia Delgado", party: "Democracia21", role: "Coordinadora Digital", desc: "Democracia líquida y automatización de la toma de decisiones por consenso.", type: "national", weights: { progressive: 0.4, conservative: 0.1, identity: 0.4, disruptive: 1.0 } },
  { name: "Hugo Sotomayor", party: "Democracia21", role: "Desarrollador de Protocolo", desc: "Soberanía ciudadana basada en criptografía y auditoría directa del Estado.", type: "national", weights: { progressive: 0.3, conservative: 0.1, identity: 0.4, disruptive: 1.0 } },
  { name: "Frank Underwood", party: "Ficticio (House of Cards)", role: "Maquiavelismo Puro", desc: "El poder y la amoralidad estratégica absoluta. El fin justifica los medios.", type: "global", weights: { progressive: 0.3, conservative: 0.3, identity: 0.3, disruptive: 1.0 } },
  { name: "Javier Milei", party: "La Libertad Avanza (Arg)", role: "Presidente de Argentina", desc: "Libertarismo y minarquismo radical. Batalla frontal contra la intervención del Estado.", type: "global", weights: { progressive: 0.0, conservative: 0.4, identity: 0.6, disruptive: 1.0 } },
  { name: "Nayib Bukele", party: "Nuevas Ideas (El Salv)", role: "Presidente de El Salvador", desc: "Eficacia pragmática, seguridad severa de mano dura y control institucional total.", type: "global", weights: { progressive: 0.1, conservative: 0.6, identity: 0.8, disruptive: 0.9 } },
  { name: "Donald Trump", party: "Republicano (EEUU)", role: "Presidente de EEUU", desc: "Nacional-populismo, conservadurismo arancelario y comunicación altamente disruptiva.", type: "global", weights: { progressive: 0.0, conservative: 0.7, identity: 1.0, disruptive: 0.8 } },
  { name: "Emmanuel Macron", party: "Renaissance (Francia)", role: "Presidente de Francia", desc: "Socioliberalismo tecnocrático, globalización integrada y pragmatismo de centro.", type: "global", weights: { progressive: 0.5, conservative: 0.8, identity: 0.2, disruptive: 0.2 } },
];

const AXIS_LABELS: { key: keyof Weights; name: string; desc: string; barClass: string }[] = [
  { key: "progressive", name: "Progresismo e Igualdad", desc: "Fuerte énfasis en la justicia social, los servicios públicos financiados mediante fiscalidad progresiva y la ampliación de libertades civiles y transiciones verdes.", barClass: "from-indigo-500 to-indigo-600" },
  { key: "conservative", name: "Conservadurismo y Orden", desc: "Garantía de la estabilidad institucional y económica, moderación del gasto, respeto a la propiedad, seguridad jurídica y marco constitucional sólido.", barClass: "from-blue-500 to-blue-600" },
  { key: "identity", name: "Identidad, Fronteras y Soberanía", desc: "Enfoque identitario riguroso sobre la cultura tradicional, límites firmes de fronteras y migración controlada, y preferencia nacional o regional.", barClass: "from-emerald-500 to-emerald-600" },
  { key: "disruptive", name: "Disrupción, Libertad e Individualismo", desc: "Minimización del papel intervencionista del Estado en favor del libre mercado, desregulación digital y rechazo a las estructuras políticas tradicionales.", barClass: "from-rose-500 to-rose-600" },
];

const LEADER_FILTERS: { key: "all" | "national" | "regional" | "global"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "national", label: "Nacionales" },
  { key: "regional", label: "Regionales" },
  { key: "global", label: "Internacionales / Especiales" },
];

/* ============================================================
   FAVICON (SVG brújula en base64-free data URI)
   ============================================================ */

const FAVICON_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f0f17"/><circle cx="32" cy="32" r="22" fill="none" stroke="#6366F1" stroke-width="3"/><polygon points="32,14 38,32 32,50 26,32" fill="#F43F5E"/></svg>`
  );

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

type Screen = "welcome" | "quiz" | "results";
type ResultsTab = "parties" | "leaders" | "axes";
type LeaderFilter = "all" | "national" | "regional" | "global";

export default function TestPoliticoBC() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [activeTab, setActiveTab] = useState<ResultsTab>("parties");
  const [leaderFilter, setLeaderFilter] = useState<LeaderFilter>("all");

  // Título y favicon dinámicos
  useEffect(() => {
    document.title = "Test Político BC";

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = FAVICON_SVG;
  }, []);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const startTest = () => {
    setScreen("quiz");
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const resetTest = () => {
    setScreen("welcome");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setActiveTab("parties");
    setLeaderFilter("all");
  };

  const selectOption = (questionId: number, key: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setScreen("results");
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((i) => i - 1);
  };

  /* ---------- Cálculo de resultados ---------- */
  const { axesResults, partyAffinity, leaderAffinity } = useMemo(() => {
    // Ejes ideológicos
    const totals: Weights = { progressive: 0, conservative: 0, identity: 0, disruptive: 0 };
    QUESTIONS.forEach((q) => {
      const option = q.options.find((o) => o.key === answers[q.id]);
      if (option) {
        (Object.keys(totals) as (keyof Weights)[]).forEach((axis) => {
          totals[axis] += option.weights[axis];
        });
      }
    });
    const maxScorePerAxis = QUESTIONS.length * 1.0;
    const axesResults: Weights = {
      progressive: Math.round((totals.progressive / maxScorePerAxis) * 100),
      conservative: Math.round((totals.conservative / maxScorePerAxis) * 100),
      identity: Math.round((totals.identity / maxScorePerAxis) * 100),
      disruptive: Math.round((totals.disruptive / maxScorePerAxis) * 100),
    };

    // Afinidad de partidos
    const partyScores: Record<string, number> = {};
    const partyMaxOccurrences: Record<string, number> = {};
    Object.keys(PARTIES).forEach((p) => {
      partyScores[p] = 0;
      partyMaxOccurrences[p] = 0;
    });

    QUESTIONS.forEach((q) => {
      const option = q.options.find((o) => o.key === answers[q.id]);
      if (option) {
        option.parties.forEach((p) => {
          if (partyScores[p] !== undefined) partyScores[p]++;
        });
      }
      const seen = new Set<string>();
      q.options.forEach((o) => o.parties.forEach((p) => seen.add(p)));
      seen.forEach((p) => {
        if (partyMaxOccurrences[p] !== undefined) partyMaxOccurrences[p]++;
      });
    });

    const partyAffinity = Object.keys(PARTIES)
      .map((key) => {
        const max = partyMaxOccurrences[key] || 1;
        const percentage = Math.round((partyScores[key] / max) * 100);
        return { key, ...PARTIES[key], percentage };
      })
      .sort((a, b) => b.percentage - a.percentage);

    // Afinidad de líderes (producto escalar normalizado con los ejes calculados)
    const leaderAffinity = LEADERS.map((leader) => {
      let score = 0;
      let maxPossible = 0;
      (Object.keys(axesResults) as (keyof Weights)[]).forEach((axis) => {
        score += axesResults[axis] * leader.weights[axis];
        maxPossible += 100 * leader.weights[axis];
      });
      const percentage = maxPossible > 0 ? Math.max(0, Math.min(100, Math.round((score / maxPossible) * 100))) : 0;
      const color = PARTIES[leader.party]?.color ?? "#4A5568";
      return { ...leader, percentage, color };
    }).sort((a, b) => b.percentage - a.percentage);

    return { axesResults, partyAffinity, leaderAffinity };
  }, [answers]);

  const filteredLeaders = useMemo(() => {
    if (leaderFilter === "all") return leaderAffinity;
    return leaderAffinity.filter((l) => l.type === leaderFilter);
  }, [leaderAffinity, leaderFilter]);

  const progressPercent = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b12] via-[#0a0a10] to-[#12081a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-rose-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Test Político BC
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">España 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Anónimo y sin registro
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTest}
              className="gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/resultados")}
              className="gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* ---------------- WELCOME ---------------- */}
        {screen === "welcome" && (
          <section className="space-y-8 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Versión Ampliada de Afinidad y Liderazgo
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Descubre tu verdadera{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                afinidad política y de liderazgo
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Un análisis exhaustivo de <strong>30 preguntas</strong> que evalúa tu compatibilidad con las fuerzas del
              Congreso, plataformas específicas como <em>Nueve CYL, SALF, Adelante Andalucía, Aliança Catalana y
              Democracia 21</em>, y calcula tu porcentaje de sintonía con <strong>más de 30 líderes políticos
              nacionales e internacionales</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <Card className="bg-white/5 border-white/10 p-5 space-y-2">
                <Gavel className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">17 Fuerzas Políticas</h3>
                <p className="text-xs text-slate-400">
                  Desde partidos mayoritarios hasta identitarios, regionalistas y plataformas digitales.
                </p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-5 space-y-2">
                <Users className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-sm">30+ Líderes Analizados</h3>
                <p className="text-xs text-slate-400">
                  2 referentes clave por formación, además de perfiles globales e históricos como Underwood.
                </p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-5 space-y-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Algoritmo de Precisión</h3>
                <p className="text-xs text-slate-400">
                  Ponderaciones cruzadas por bloque temático para una exactitud sin precedentes.
                </p>
              </Card>
            </div>

            <div className="pt-4">
              <Button
                onClick={startTest}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold px-8 py-6 rounded-2xl text-lg"
              >
                Comenzar Test <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Tiempo estimado: 6 - 8 minutos
              </p>
            </div>
          </section>
        )}

        {/* ---------------- QUIZ ---------------- */}
        {screen === "quiz" && (
          <section className="max-w-3xl mx-auto w-full space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-indigo-400">
                  {currentQuestion.block}
                </span>
                <span>
                  Pregunta {currentQuestionIndex + 1} de {QUESTIONS.length}
                </span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 p-6 sm:p-8 relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                <h3 className="text-xl sm:text-2xl font-extrabold leading-snug">{currentQuestion.question}</h3>

                <div className="space-y-3.5 pt-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => selectOption(currentQuestion.id, option.key)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 hover:bg-white/5 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10"
                            : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {option.key}
                        </div>
                        <div className="text-sm sm:text-base font-semibold leading-relaxed pt-0.5">{option.text}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                onClick={prevQuestion}
                className={`gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white ${
                  currentQuestionIndex === 0 ? "invisible" : ""
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </Button>
              <div className="text-xs text-slate-500 italic hidden sm:block">
                Las respuestas se guardan automáticamente
              </div>
              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion.id]}
                className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        )}

        {/* ---------------- RESULTS ---------------- */}
        {screen === "results" && (
          <section className="space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Test Completado con éxito
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold">Tu Informe de Afinidad Política</h2>
              <p className="text-slate-400 text-sm">
                A continuación se muestran tus coincidencias calculadas de acuerdo a tu posicionamiento ideológico,
                socioeconómico e institucional.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex max-w-md mx-auto justify-center bg-white/5 p-1 rounded-xl border border-white/10">
              {(
                [
                  { key: "parties", label: "Partidos", icon: Gavel },
                  { key: "leaders", label: "Líderes (30+)", icon: Users },
                  { key: "axes", label: "Ejes", icon: Compass },
                ] as { key: ResultsTab; label: string; icon: typeof Gavel }[]
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === key ? "text-white bg-indigo-600 shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Partidos */}
            {activeTab === "parties" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partyAffinity.map((item, index) => (
                  <Card key={item.key} className="bg-white/5 border-white/10 p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-extrabold text-lg">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                          Posición #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="pt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Afinidad ideológica</span>
                        <span style={{ color: item.color }}>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Líderes */}
            {activeTab === "leaders" && (
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10 p-4 flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filtrar líderes por tipo:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LEADER_FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setLeaderFilter(f.key)}
                        className={`text-[10px] sm:text-xs px-3 py-1 rounded-md font-bold transition ${
                          leaderFilter === f.key
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLeaders.map((item) => (
                    <Card key={item.name} className="bg-white/5 border-white/10 p-5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-base">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                              {item.role}
                              {item.party !== "Ficticio (House of Cards)" ? ` • ${item.party}` : ""}
                            </p>
                          </div>
                          <span className="text-xl font-black" style={{ color: item.color }}>
                            {item.percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="pt-4">
                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/10">
                          <div
                            className="h-full transition-all duration-1000"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Ejes */}
            {activeTab === "axes" && (
              <Card className="max-w-2xl mx-auto bg-white/5 border-white/10 p-6 sm:p-8 space-y-8">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                  <Compass className="w-5 h-5 text-indigo-400" /> Distribución del Espectro Ideológico
                </h3>
                <div className="space-y-5">
                  {AXIS_LABELS.map((axis) => (
                    <div key={axis.key} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">{axis.name}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{axis.desc}</p>
                        </div>
                        <span className="text-base font-extrabold pl-4">{axesResults[axis.key]}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/10">
                        <div
                          className={`bg-gradient-to-r ${axis.barClass} h-full transition-all duration-1000`}
                          style={{ width: `${axesResults[axis.key]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={resetTest}
                className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold"
              >
                <RotateCcw className="w-4 h-4" /> Volver a realizar el test
              </Button>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 mt-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p>© 2026 Test Político BC. Todos los derechos reservados.</p>
          <p className="max-w-2xl mx-auto leading-relaxed">
            Este cuestionario es un ejercicio interactivo estructurado con fines lúdicos y de análisis de afinidad
            discursiva. Las respuestas son procesadas localmente en tu navegador para proteger tu privacidad.
          </p>
        </div>
      </footer>
    </div>
  );
}
