import { useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { normalizeProvinceName } from "@/lib/provinceNormalizer";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

type RawRow = Record<string, unknown>;

type ImportStatus = "idle" | "ready" | "importing" | "success" | "error";

interface ParsedSurveyRow {
  rowNumber: number;

  edad: number | null;
  provincia: string | null;
  ccaa: string | null;
  nacionalidad: string | null;

  anteriores_eegg: string | null;
  voto_generales: string | null;
  voto_autonomicas: string | null;
  voto_municipales: string | null;
  voto_europeas: string | null;

  nota_ejecutivo: number | null;

  val_feijoo: number | null;
  val_sanchez: number | null;
  val_abascal: number | null;
  val_alvise: number | null;
  val_yolanda_diaz: number | null;
  val_irene_montero: number | null;
  val_ayuso: number | null;
  val_buxade: number | null;

  posicion_ideologica: number | null;

  voto_asociacion_juvenil: string | null;
  lider_partido: string | null;

  monarquia_republica: string | null;
  division_territorial: string | null;
  sistema_pensiones: string | null;
  opinion_crisismigratoria: string | null;

  errors: string[];
  warnings: string[];
}

interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  imported: number;
  failed: number;
}

/* -------------------------------------------------------------------------- */
/*                                CONFIGURACIÓN                               */
/* -------------------------------------------------------------------------- */

const REQUIRED_FIELDS = [
  "edad",
  "provincia",
  "ccaa",
  "nacionalidad",
  "anteriores_eegg",
  "voto_generales",
  "voto_autonomicas",
  "voto_municipales",
  "voto_europeas",
  "nota_ejecutivo",
  "val_feijoo",
  "val_sanchez",
  "val_abascal",
  "val_alvise",
  "val_yolanda_diaz",
  "val_irene_montero",
  "val_ayuso",
  "val_buxade",
  "posicion_ideologica",
  "voto_asociacion_juvenil",
  "lider_partido",
  "monarquia_republica",
  "division_territorial",
  "sistema_pensiones",
  "opinion_crisismigratoria",
] as const;

/**
 * Cada campo puede ser reconocido tanto por:
 * - nombre interno
 * - nombre de Supabase
 * - título corto
 * - pregunta completa exportada desde formularios
 *
 * normalizeHeader() elimina tildes, signos y diferencias de mayúsculas.
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  edad: [
    "edad",
    "cuantos anos tienes",
    "cuántos años tienes",
    "que edad tienes",
  ],

  ccaa: [
    "ccaa",
    "comunidad autonoma",
    "comunidad autónoma",
    "comunidad_autonoma",
    "comunidad de residencia",
  ],

  provincia: [
    "provincia",
    "provincia de residencia",
    "en que provincia resides",
  ],

  nacionalidad: [
    "nacionalidad",
    "cual es tu nacionalidad",
    "cuál es tu nacionalidad",
  ],

  anteriores_eegg: [
    "anteriores_eegg",
    "elecciones anteriores",
    "voto anterior",
    "recuerdo de voto",
    "a que partido voto ud en las anteriores elecciones",
    "a qué partido votó ud. en las anteriores elecciones",
  ],

  voto_generales: [
    "voto_generales",
    "elecciones generales",
    "voto generales",
    "intencion de voto generales",
    "intención de voto generales",
    "a que partido votarias en las proximas elecciones generales",
    "a qué partido votarías en las próximas elecciones generales",
  ],

  voto_autonomicas: [
    "voto_autonomicas",
    "elecciones autonomicas",
    "elecciones autonómicas",
    "voto autonomicas",
    "voto autonómicas",
    "a que partido votarias en las proximas elecciones autonomicas",
    "a qué partido votarías en las próximas elecciones autonómicas",
  ],

  voto_municipales: [
    "voto_municipales",
    "elecciones municipales",
    "voto municipales",
    "a que partido votarias en las proximas elecciones municipales",
    "a qué partido votarías en las próximas elecciones municipales",
  ],

  voto_europeas: [
    "voto_europeas",
    "elecciones europeas",
    "voto europeas",
    "a que partido votarias en las proximas elecciones europeas",
    "a qué partido votarías en las próximas elecciones europeas",
  ],

  nota_ejecutivo: [
    "nota_ejecutivo",
    "nota al ejecutivo",
    "nota gobierno",
    "valoracion gobierno",
    "valoración gobierno",
    "que nota le pondrias al gobierno actual",
    "qué nota le pondrías al gobierno actual",
  ],

  val_feijoo: [
    "val_feijoo",
    "valoracion_feijoo",
    "valoracion feijoo",
    "valoración feijóo",
    "alberto nunez feijoo",
    "alberto núñez feijóo",
  ],

  val_sanchez: [
    "val_sanchez",
    "valoracion_sanchez",
    "valoracion sanchez",
    "valoración sánchez",
    "pedro sanchez",
    "pedro sánchez",
  ],

  val_abascal: [
    "val_abascal",
    "valoracion_abascal",
    "valoracion abascal",
    "valoración abascal",
    "santiago abascal",
  ],

  val_alvise: [
    "val_alvise",
    "valoracion_alvise",
    "valoracion alvise",
    "valoración alvise",
    "alvise perez",
    "alvise pérez",
  ],

  val_yolanda_diaz: [
    "val_yolanda_diaz",
    "valoracion_yolanda",
    "valoracion yolanda",
    "valoración yolanda",
    "yolanda diaz",
    "yolanda díaz",
  ],

  val_irene_montero: [
    "val_irene_montero",
    "valoracion_irene",
    "valoracion irene",
    "valoración irene",
    "irene montero",
  ],

  val_ayuso: [
    "val_ayuso",
    "valoracion_ayuso",
    "valoracion ayuso",
    "valoración ayuso",
    "isabel diaz ayuso",
    "isabel díaz ayuso",
  ],

  val_buxade: [
    "val_buxade",
    "valoracion_buxade",
    "valoracion buxade",
    "valoración buxadé",
    "jorge buxade",
    "jorge buxadé",
  ],

  posicion_ideologica: [
    "posicion_ideologica",
    "posicion ideologica",
    "posición ideológica",
    "tu posicion ideologica",
    "tu posición ideológica",
    "donde te situas en el espectro politico",
    "dónde te sitúas en el espectro político",
  ],

  voto_asociacion_juvenil: [
    "voto_asociacion_juvenil",
    "asociacion_juvenil",
    "asociacion juvenil",
    "asociación juvenil",
    "a que asociacion juvenil votarias",
    "a qué asociación juvenil votarías",
  ],

  lider_partido: [
    "lider_partido",
    "lider de tu partido",
    "líder de tu partido",
    "lider preferido",
    "líder preferido",
    "quien prefieres como lider de tu partido en las generales",
    "quién prefieres como líder de tu partido en las generales",
  ],

  monarquia_republica: [
    "monarquia_republica",
    "forma del estado",
    "monarquia republica",
    "monarquía república",
    "que forma del estado prefieres para espana",
    "qué forma del estado prefieres para españa",
  ],

  division_territorial: [
    "division_territorial",
    "division territorial",
    "división territorial",
    "modelo territorial",
    "que modelo territorial prefieres para espana",
    "qué modelo territorial prefieres para españa",
  ],

  sistema_pensiones: [
    "sistema_pensiones",
    "sistema de pensiones",
    "pensiones",
    "que modelo de pensiones prefieres",
    "qué modelo de pensiones prefieres",
  ],

  opinion_crisismigratoria: [
    "opinion_crisismigratoria",
    "opinion crisis migratoria",
    "opinión crisis migratoria",
    "crisis migratoria",
    "crisis migratoria en ceuta",
    "que opina de la crisis ocurrida en ceuta",
    "qué opina de la crisis ocurrida en ceuta",
  ],
};

const FIELD_LABELS: Record<string, string> = {
  edad: "Edad",
  ccaa: "Comunidad Autónoma",
  provincia: "Provincia",
  nacionalidad: "Nacionalidad",
  anteriores_eegg: "Elecciones anteriores",
  voto_generales: "Elecciones Generales",
  voto_autonomicas: "Elecciones Autonómicas",
  voto_municipales: "Elecciones Municipales",
  voto_europeas: "Elecciones Europeas",
  nota_ejecutivo: "Nota al Ejecutivo",
  val_feijoo: "Alberto Núñez Feijóo",
  val_sanchez: "Pedro Sánchez",
  val_abascal: "Santiago Abascal",
  val_alvise: "Alvise Pérez",
  val_yolanda_diaz: "Yolanda Díaz",
  val_irene_montero: "Irene Montero",
  val_ayuso: "Isabel Díaz Ayuso",
  val_buxade: "Jorge Buxadé",
  posicion_ideologica: "Posición ideológica",
  voto_asociacion_juvenil: "Asociación Juvenil",
  lider_partido: "Líder del partido",
  monarquia_republica: "Forma del Estado",
  division_territorial: "División Territorial",
  sistema_pensiones: "Sistema de Pensiones",
  opinion_crisismigratoria: "Crisis Migratoria",
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[¿?¡!.,:;()[\]{}"'´`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNullableString(value: unknown): string | null {
  const result = normalizeText(value);
  return result.length ? result : null;
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .trim()
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  if (!cleaned) return null;

  const result = Number(cleaned);
  return Number.isFinite(result) ? result : null;
}

function parseInteger(value: unknown): number | null {
  const number = parseNumber(value);
  if (number === null) return null;
  return Math.trunc(number);
}

function detectColumn(
  headers: string[],
  field: string,
): string | undefined {
  const aliases = [
    field,
    ...(COLUMN_ALIASES[field] || []),
  ].map(normalizeHeader);

  // Coincidencia exacta.
  const exact = headers.find((header) =>
    aliases.includes(normalizeHeader(header)),
  );

  if (exact) return exact;

  // Coincidencia flexible para preguntas completas.
  return headers.find((header) => {
    const normalizedHeader = normalizeHeader(header);

    return aliases.some((alias) => {
      if (alias.length < 5) return false;

      return (
        normalizedHeader.includes(alias) ||
        alias.includes(normalizedHeader)
      );
    });
  });
}

function buildColumnMap(headers: string[]): Record<string, string | undefined> {
  return Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [
      field,
      detectColumn(headers, field),
    ]),
  );
}

function getMappedValue(
  row: RawRow,
  columnMap: Record<string, string | undefined>,
  field: string,
): unknown {
  const column = columnMap[field];
  if (!column) return undefined;
  return row[column];
}

function validateRange(
  value: number | null,
  min: number,
  max: number,
  label: string,
  errors: string[],
) {
  if (value === null) {
    errors.push(`${label}: valor ausente`);
    return;
  }

  if (value < min || value > max) {
    errors.push(`${label}: debe estar entre ${min} y ${max}`);
  }
}

function parseSurveyRow(
  raw: RawRow,
  index: number,
  columnMap: Record<string, string | undefined>,
): ParsedSurveyRow {
  const errors: string[] = [];
  const warnings: string[] = [];

  const edad = parseInteger(getMappedValue(raw, columnMap, "edad"));

  const provinciaRaw = toNullableString(
    getMappedValue(raw, columnMap, "provincia"),
  );

  const provincia = provinciaRaw
    ? normalizeProvinceName(provinciaRaw) || provinciaRaw
    : null;

  const ccaa = toNullableString(
    getMappedValue(raw, columnMap, "ccaa"),
  );

  const nacionalidad = toNullableString(
    getMappedValue(raw, columnMap, "nacionalidad"),
  );

  const anteriores_eegg = toNullableString(
    getMappedValue(raw, columnMap, "anteriores_eegg"),
  );

  const voto_generales = toNullableString(
    getMappedValue(raw, columnMap, "voto_generales"),
  );

  const voto_autonomicas = toNullableString(
    getMappedValue(raw, columnMap, "voto_autonomicas"),
  );

  const voto_municipales = toNullableString(
    getMappedValue(raw, columnMap, "voto_municipales"),
  );

  const voto_europeas = toNullableString(
    getMappedValue(raw, columnMap, "voto_europeas"),
  );

  const nota_ejecutivo = parseNumber(
    getMappedValue(raw, columnMap, "nota_ejecutivo"),
  );

  const val_feijoo = parseNumber(
    getMappedValue(raw, columnMap, "val_feijoo"),
  );

  const val_sanchez = parseNumber(
    getMappedValue(raw, columnMap, "val_sanchez"),
  );

  const val_abascal = parseNumber(
    getMappedValue(raw, columnMap, "val_abascal"),
  );

  const val_alvise = parseNumber(
    getMappedValue(raw, columnMap, "val_alvise"),
  );

  const val_yolanda_diaz = parseNumber(
    getMappedValue(raw, columnMap, "val_yolanda_diaz"),
  );

  const val_irene_montero = parseNumber(
    getMappedValue(raw, columnMap, "val_irene_montero"),
  );

  const val_ayuso = parseNumber(
    getMappedValue(raw, columnMap, "val_ayuso"),
  );

  const val_buxade = parseNumber(
    getMappedValue(raw, columnMap, "val_buxade"),
  );

  const posicion_ideologica = parseNumber(
    getMappedValue(raw, columnMap, "posicion_ideologica"),
  );

  const voto_asociacion_juvenil = toNullableString(
    getMappedValue(raw, columnMap, "voto_asociacion_juvenil"),
  );

  const lider_partido = toNullableString(
    getMappedValue(raw, columnMap, "lider_partido"),
  );

  const monarquia_republica = toNullableString(
    getMappedValue(raw, columnMap, "monarquia_republica"),
  );

  const division_territorial = toNullableString(
    getMappedValue(raw, columnMap, "division_territorial"),
  );

  const sistema_pensiones = toNullableString(
    getMappedValue(raw, columnMap, "sistema_pensiones"),
  );

  const opinion_crisismigratoria = toNullableString(
    getMappedValue(raw, columnMap, "opinion_crisismigratoria"),
  );

  if (edad === null) {
    errors.push("Edad: valor ausente");
  } else if (edad < 16 || edad > 99) {
    errors.push("Edad: debe estar entre 16 y 99");
  }

  if (!provincia) errors.push("Provincia: valor ausente");
  if (!ccaa) errors.push("Comunidad Autónoma: valor ausente");
  if (!nacionalidad) errors.push("Nacionalidad: valor ausente");

  if (!anteriores_eegg) {
    errors.push("Elecciones anteriores: valor ausente");
  }

  if (!voto_generales) {
    errors.push("Elecciones Generales: valor ausente");
  }

  if (!voto_autonomicas) {
    errors.push("Elecciones Autonómicas: valor ausente");
  }

  if (!voto_municipales) {
    errors.push("Elecciones Municipales: valor ausente");
  }

  if (!voto_europeas) {
    errors.push("Elecciones Europeas: valor ausente");
  }

  validateRange(
    nota_ejecutivo,
    0,
    10,
    "Nota al Ejecutivo",
    errors,
  );

  validateRange(val_feijoo, 0, 10, "Feijóo", errors);
  validateRange(val_sanchez, 0, 10, "Sánchez", errors);
  validateRange(val_abascal, 0, 10, "Abascal", errors);
  validateRange(val_alvise, 0, 10, "Alvise", errors);
  validateRange(val_yolanda_diaz, 0, 10, "Yolanda Díaz", errors);
  validateRange(val_irene_montero, 0, 10, "Irene Montero", errors);
  validateRange(val_ayuso, 0, 10, "Ayuso", errors);
  validateRange(val_buxade, 0, 10, "Buxadé", errors);

  validateRange(
    posicion_ideologica,
    1,
    10,
    "Posición ideológica",
    errors,
  );

  if (!voto_asociacion_juvenil) {
    errors.push("Asociación Juvenil: valor ausente");
  }

  if (!lider_partido) {
    errors.push("Líder del partido: valor ausente");
  }

  if (!monarquia_republica) {
    errors.push("Forma del Estado: valor ausente");
  }

  if (!division_territorial) {
    errors.push("División Territorial: valor ausente");
  }

  if (!sistema_pensiones) {
    errors.push("Sistema de Pensiones: valor ausente");
  }

  if (!opinion_crisismigratoria) {
    errors.push("Crisis Migratoria: valor ausente");
  }

  if (
    provinciaRaw &&
    provincia &&
    normalizeHeader(provinciaRaw) !== normalizeHeader(provincia)
  ) {
    warnings.push(
      `Provincia normalizada: "${provinciaRaw}" → "${provincia}"`,
    );
  }

  return {
    rowNumber: index + 2,

    edad,
    provincia,
    ccaa,
    nacionalidad,

    anteriores_eegg,
    voto_generales,
    voto_autonomicas,
    voto_municipales,
    voto_europeas,

    nota_ejecutivo,

    val_feijoo,
    val_sanchez,
    val_abascal,
    val_alvise,
    val_yolanda_diaz,
    val_irene_montero,
    val_ayuso,
    val_buxade,

    posicion_ideologica,

    voto_asociacion_juvenil,
    lider_partido,

    monarquia_republica,
    division_territorial,
    sistema_pensiones,
    opinion_crisismigratoria,

    errors,
    warnings,
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/* -------------------------------------------------------------------------- */
/*                              COMPONENTE PRINCIPAL                           */
/* -------------------------------------------------------------------------- */

export default function SimuladorBCGuide() {
  const [, setLocation] = useLocation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState("");
  const [sheetName, setSheetName] = useState("");

  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const [columnMap, setColumnMap] = useState<
    Record<string, string | undefined>
  >({});

  const [parsedRows, setParsedRows] = useState<ParsedSurveyRow[]>([]);

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const [dragging, setDragging] = useState(false);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  const validRows = useMemo(
    () => parsedRows.filter((row) => row.errors.length === 0),
    [parsedRows],
  );

  const invalidRows = useMemo(
    () => parsedRows.filter((row) => row.errors.length > 0),
    [parsedRows],
  );

  const visibleRows = useMemo(
    () => (showOnlyErrors ? invalidRows : parsedRows),
    [showOnlyErrors, invalidRows, parsedRows],
  );

  const missingColumns = useMemo(
    () =>
      REQUIRED_FIELDS.filter(
        (field) => !columnMap[field],
      ),
    [columnMap],
  );

  const summary: ImportSummary = {
    total: parsedRows.length,
    valid: validRows.length,
    invalid: invalidRows.length,
    imported: importedCount,
    failed: failedCount,
  };

  const resetImport = () => {
    setFileName("");
    setSheetName("");
    setRawRows([]);
    setHeaders([]);
    setColumnMap({});
    setParsedRows([]);
    setStatus("idle");
    setErrorMessage("");
    setImportProgress(0);
    setImportedCount(0);
    setFailedCount(0);
    setShowOnlyErrors(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const rebuildRows = (
    rows: RawRow[],
    map: Record<string, string | undefined>,
  ) => {
    const parsed = rows.map((row, index) =>
      parseSurveyRow(row, index, map),
    );

    setParsedRows(parsed);
  };

  const processFile = async (file: File) => {
    setErrorMessage("");
    setStatus("idle");

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!extension || !["csv", "xls", "xlsx"].includes(extension)) {
      setErrorMessage(
        "Formato no compatible. Utiliza un archivo CSV, XLS o XLSX.",
      );
      setStatus("error");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error("El archivo no contiene ninguna hoja.");
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<RawRow>(worksheet, {
        defval: "",
        raw: false,
      });

      if (!rows.length) {
        throw new Error(
          "El archivo no contiene respuestas para importar.",
        );
      }

      const detectedHeaders = Array.from(
        new Set(
          rows.flatMap((row) => Object.keys(row)),
        ),
      );

      if (!detectedHeaders.length) {
        throw new Error(
          "No se han encontrado columnas en el archivo.",
        );
      }

      const detectedMap = buildColumnMap(detectedHeaders);

      setFileName(file.name);
      setSheetName(firstSheetName);

      setRawRows(rows);
      setHeaders(detectedHeaders);
      setColumnMap(detectedMap);

      rebuildRows(rows, detectedMap);

      setStatus("ready");
    } catch (error) {
      console.error("Error leyendo archivo:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se ha podido procesar el archivo.",
      );

      setStatus("error");
    }
  };

  const handleFileInput = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const updateMapping = (
    field: string,
    sourceColumn: string,
  ) => {
    const nextMap = {
      ...columnMap,
      [field]: sourceColumn || undefined,
    };

    setColumnMap(nextMap);
    rebuildRows(rawRows, nextMap);
  };

  const importToSupabase = async () => {
    if (!validRows.length) return;

    if (missingColumns.length > 0) {
      setErrorMessage(
        `Faltan ${missingColumns.length} columnas por relacionar antes de importar.`,
      );
      setStatus("error");
      return;
    }

    const confirmed = window.confirm(
      `Vas a importar ${validRows.length.toLocaleString(
        "es-ES",
      )} respuestas válidas a Supabase.\n\n` +
        `${invalidRows.length.toLocaleString(
          "es-ES",
        )} filas con errores serán ignoradas.\n\n` +
        "Esta operación añadirá registros reales a la base de datos.\n\n¿Continuar?",
    );

    if (!confirmed) return;

    setStatus("importing");
    setErrorMessage("");
    setImportProgress(0);
    setImportedCount(0);
    setFailedCount(0);

    let imported = 0;
    let failed = 0;

    const batches = chunkArray(validRows, 100);

    try {
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        const responsePayload = batch.map((row) => ({
          edad: row.edad,
          provincia: row.provincia,
          ccaa: row.ccaa,
          nacionalidad: row.nacionalidad,

          anteriores_eegg: row.anteriores_eegg,

          voto_generales: row.voto_generales,
          voto_autonomicas: row.voto_autonomicas,
          voto_municipales: row.voto_municipales,
          voto_europeas: row.voto_europeas,

          nota_ejecutivo: row.nota_ejecutivo,

          val_feijoo: row.val_feijoo,
          val_sanchez: row.val_sanchez,
          val_abascal: row.val_abascal,
          val_alvise: row.val_alvise,
          val_yolanda_diaz: row.val_yolanda_diaz,
          val_irene_montero: row.val_irene_montero,
          val_ayuso: row.val_ayuso,
          val_buxade: row.val_buxade,

          posicion_ideologica: row.posicion_ideologica,

          voto_asociacion_juvenil:
            row.voto_asociacion_juvenil,

          monarquia_republica: row.monarquia_republica,
          division_territorial: row.division_territorial,
          sistema_pensiones: row.sistema_pensiones,
          opinion_crisismigratoria:
            row.opinion_crisismigratoria,
        }));

        const { error: responsesError } = await supabase
          .from("respuestas")
          .insert(responsePayload);

        if (responsesError) {
          console.error(
            `Error importando lote ${batchIndex + 1}:`,
            responsesError,
          );

          failed += batch.length;
          setFailedCount(failed);

          continue;
        }

        imported += batch.length;
        setImportedCount(imported);

        /**
         * lider_partido no forma parte de "respuestas".
         * Se replica el comportamiento de NanoEncuestaBC y se
         * almacena en lideres_preferidos.
         */
        const leaderPayload = batch
          .filter(
            (row) =>
              row.lider_partido &&
              row.voto_generales,
          )
          .map((row) => ({
            partido: row.voto_generales,
            lider_preferido: row.lider_partido,
            es_personalizado: false,
          }));

        if (leaderPayload.length) {
          const { error: leadersError } = await supabase
            .from("lideres_preferidos")
            .insert(leaderPayload);

          if (leadersError) {
            console.error(
              "Las respuestas se importaron, pero hubo un error importando líderes:",
              leadersError,
            );
          }
        }

        const progress = Math.round(
          ((batchIndex + 1) / batches.length) * 100,
        );

        setImportProgress(progress);
      }

      if (failed > 0) {
        setStatus("error");

        setErrorMessage(
          `La importación terminó parcialmente. ${imported} respuestas importadas y ${failed} no pudieron importarse.`,
        );
      } else {
        setImportProgress(100);
        setStatus("success");
      }
    } catch (error) {
      console.error("Error general de importación:", error);

      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Se produjo un error inesperado durante la importación.",
      );
    }
  };

  return (
    <div className="bc-importer">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .bc-importer {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 0%, rgba(75,0,130,.20), transparent 32%),
            radial-gradient(circle at 90% 10%, rgba(37,99,235,.13), transparent 30%),
            linear-gradient(145deg, #060914 0%, #0b1020 55%, #070a14 100%);
          color: #f4f4f5;
          font-family: 'TVP', 'DM Sans', system-ui, sans-serif;
        }

        .bc-header {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: rgba(7,10,20,.78);
          backdrop-filter: blur(24px) saturate(160%);
          border-bottom: 1px solid rgba(255,255,255,.10);
        }

        .bc-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bc-brand img {
          width: 30px;
          height: 30px;
          border-radius: 8px;
        }

        .bc-brand-title {
          font-weight: 800;
          font-size: 15px;
        }

        .bc-brand-sub {
          color: #777b8e;
          font-size: 11px;
          margin-top: 1px;
        }

        .bc-back {
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.05);
          color: #d7d8df;
          border-radius: 10px;
          padding: 9px 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .bc-main {
          width: min(1400px, calc(100% - 32px));
          margin: 0 auto;
          padding: 40px 0 70px;
        }

        .bc-hero {
          margin-bottom: 30px;
        }

        .bc-kicker {
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .bc-title {
          margin: 0;
          font-size: clamp(30px, 5vw, 52px);
          line-height: 1.04;
          letter-spacing: -.04em;
          font-weight: 900;
        }

        .bc-description {
          max-width: 750px;
          color: #8c90a3;
          font-size: 15px;
          line-height: 1.65;
          margin-top: 14px;
        }

        .bc-panel {
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.085),
            rgba(255,255,255,.025)
          );
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 18px;
          box-shadow:
            inset 1px 1px 0 rgba(255,255,255,.08),
            0 20px 50px rgba(0,0,0,.20);
          backdrop-filter: blur(20px);
        }

        .bc-upload {
          min-height: 280px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1.5px dashed rgba(255,255,255,.18);
          border-radius: 16px;
          margin: 2px;
          transition: .2s ease;
          cursor: pointer;
        }

        .bc-upload.dragging {
          background: rgba(124,58,237,.12);
          border-color: #8b5cf6;
          transform: scale(.997);
        }

        .bc-upload-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(124,58,237,.13);
          color: #a78bfa;
          margin-bottom: 18px;
        }

        .bc-upload h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .bc-upload p {
          color: #777b8e;
          font-size: 13px;
          margin: 0 0 20px;
        }

        .bc-primary {
          border: 0;
          border-radius: 10px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #4b0082, #7c3aed);
          color: white;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .bc-primary:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .bc-secondary {
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 10px;
          padding: 11px 15px;
          background: rgba(255,255,255,.05);
          color: #e4e4e7;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
        }

        .bc-filebar {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .bc-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .bc-file-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: rgba(34,197,94,.12);
          color: #4ade80;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bc-file-name {
          font-size: 14px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bc-file-sheet {
          color: #777b8e;
          font-size: 11px;
          margin-top: 3px;
        }

        .bc-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .bc-stat {
          padding: 18px;
        }

        .bc-stat-label {
          color: #74788c;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .bc-stat-number {
          font-size: 28px;
          font-weight: 900;
          margin-top: 4px;
        }

        .good { color: #4ade80; }
        .bad { color: #fb7185; }
        .violet { color: #a78bfa; }

        .bc-section {
          margin-top: 16px;
          overflow: hidden;
        }

        .bc-section-head {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .bc-section-title {
          font-size: 14px;
          font-weight: 800;
        }

        .bc-section-sub {
          color: #74788c;
          font-size: 11px;
          margin-top: 3px;
        }

        .bc-mapping {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px;
        }

        .bc-map-row {
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 11px;
          padding: 11px;
          display: grid;
          grid-template-columns: minmax(130px, .8fr) 1.2fr;
          align-items: center;
          gap: 10px;
        }

        .bc-map-label {
          font-size: 12px;
          font-weight: 700;
        }

        .bc-map-label.missing {
          color: #fb7185;
        }

        .bc-select {
          width: 100%;
          background: #111522;
          color: #e4e4e7;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px;
          padding: 9px 10px;
          outline: none;
          font-size: 12px;
        }

        .bc-alert {
          margin: 16px;
          padding: 13px 15px;
          border-radius: 10px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 12px;
          line-height: 1.5;
        }

        .bc-alert.error {
          background: rgba(244,63,94,.09);
          border: 1px solid rgba(244,63,94,.22);
          color: #fda4af;
        }

        .bc-alert.warning {
          background: rgba(245,158,11,.08);
          border: 1px solid rgba(245,158,11,.22);
          color: #fcd34d;
        }

        .bc-alert.success {
          background: rgba(34,197,94,.08);
          border: 1px solid rgba(34,197,94,.22);
          color: #86efac;
        }

        .bc-table-wrap {
          overflow: auto;
          max-height: 520px;
        }

        .bc-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1500px;
          font-size: 11px;
        }

        .bc-table th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #111522;
          color: #8c90a3;
          text-align: left;
          padding: 11px 10px;
          border-bottom: 1px solid rgba(255,255,255,.09);
          white-space: nowrap;
        }

        .bc-table td {
          padding: 10px;
          border-bottom: 1px solid rgba(255,255,255,.055);
          vertical-align: top;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bc-table tr:hover td {
          background: rgba(255,255,255,.025);
        }

        .bc-row-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
        }

        .bc-error-list {
          white-space: normal;
          color: #fda4af;
          min-width: 260px;
          line-height: 1.45;
        }

        .bc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .bc-progress {
          height: 7px;
          background: rgba(255,255,255,.08);
          border-radius: 100px;
          overflow: hidden;
          margin-top: 10px;
        }

        .bc-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4b0082, #8b5cf6);
          transition: width .25s ease;
        }

        @media (max-width: 900px) {
          .bc-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .bc-mapping {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .bc-header {
            padding: 0 14px;
          }

          .bc-main {
            width: min(100% - 20px, 1400px);
            padding-top: 24px;
          }

          .bc-stats {
            grid-template-columns: 1fr 1fr;
          }

          .bc-filebar,
          .bc-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .bc-map-row {
            grid-template-columns: 1fr;
          }

          .bc-upload {
            padding: 28px 18px;
          }
        }
      `}</style>

      <header className="bc-header">
        <div className="bc-brand">
          <img src="/favicon.png" alt="BC" />

          <div>
            <div className="bc-brand-title">
              Importador BC
            </div>

            <div className="bc-brand-sub">
              Administración de encuestas
            </div>
          </div>
        </div>

        <button
          className="bc-back"
          onClick={() => setLocation("/resultados")}
        >
          <ArrowLeft size={15} />
          Volver
        </button>
      </header>

      <main className="bc-main">
        <section className="bc-hero">
          <div className="bc-kicker">
            Base de datos · Importación masiva
          </div>

          <h1 className="bc-title">
            Importar respuestas
          </h1>

          <p className="bc-description">
            Carga respuestas procedentes de CSV o Excel.
            El sistema detectará automáticamente las preguntas,
            normalizará los datos y comprobará cada fila antes
            de permitir su incorporación a la base de datos.
          </p>
        </section>

        {!rawRows.length && (
          <section className="bc-panel">
            <div
              className={`bc-upload${dragging ? " dragging" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bc-upload-icon">
                <Upload size={30} />
              </div>

              <h2>Arrastra aquí el archivo</h2>

              <p>
                CSV, XLS o XLSX · Se utilizará la primera hoja
                del documento.
              </p>

              <button
                type="button"
                className="bc-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FileSpreadsheet size={17} />
                Seleccionar archivo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileInput}
                style={{ display: "none" }}
              />
            </div>
          </section>
        )}

        {errorMessage && (
          <div className="bc-alert error">
            <XCircle size={17} style={{ flexShrink: 0 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {!!rawRows.length && (
          <>
            <section className="bc-panel bc-filebar">
              <div className="bc-file-info">
                <div className="bc-file-icon">
                  <FileSpreadsheet size={20} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div className="bc-file-name">
                    {fileName}
                  </div>

                  <div className="bc-file-sheet">
                    Hoja: {sheetName} ·{" "}
                    {headers.length} columnas detectadas
                  </div>
                </div>
              </div>

              <button
                className="bc-secondary"
                onClick={resetImport}
                disabled={status === "importing"}
              >
                <RefreshCw size={14} />
                Cambiar archivo
              </button>
            </section>

            <section className="bc-stats">
              <div className="bc-panel bc-stat">
                <div className="bc-stat-label">
                  Filas
                </div>
                <div className="bc-stat-number">
                  {summary.total.toLocaleString("es-ES")}
                </div>
              </div>

              <div className="bc-panel bc-stat">
                <div className="bc-stat-label">
                  Válidas
                </div>
                <div className="bc-stat-number good">
                  {summary.valid.toLocaleString("es-ES")}
                </div>
              </div>

              <div className="bc-panel bc-stat">
                <div className="bc-stat-label">
                  Con errores
                </div>
                <div className="bc-stat-number bad">
                  {summary.invalid.toLocaleString("es-ES")}
                </div>
              </div>

              <div className="bc-panel bc-stat">
                <div className="bc-stat-label">
                  Columnas reconocidas
                </div>
                <div className="bc-stat-number violet">
                  {REQUIRED_FIELDS.length -
                    missingColumns.length}
                  /{REQUIRED_FIELDS.length}
                </div>
              </div>
            </section>

            <section className="bc-panel bc-section">
              <div className="bc-section-head">
                <div>
                  <div className="bc-section-title">
                    Relación de columnas
                  </div>

                  <div className="bc-section-sub">
                    Puedes corregir manualmente cualquier
                    detección automática.
                  </div>
                </div>

                {missingColumns.length === 0 ? (
                  <CheckCircle2
                    size={20}
                    className="good"
                  />
                ) : (
                  <AlertTriangle
                    size={20}
                    style={{ color: "#fbbf24" }}
                  />
                )}
              </div>

              {missingColumns.length > 0 && (
                <div className="bc-alert warning">
                  <AlertTriangle
                    size={17}
                    style={{ flexShrink: 0 }}
                  />

                  <div>
                    Hay {missingColumns.length} columnas sin
                    identificar. Relaciónalas manualmente antes
                    de importar.
                  </div>
                </div>
              )}

              <div className="bc-mapping">
                {REQUIRED_FIELDS.map((field) => {
                  const mapped = columnMap[field];

                  return (
                    <div
                      className="bc-map-row"
                      key={field}
                    >
                      <div
                        className={`bc-map-label${
                          !mapped ? " missing" : ""
                        }`}
                      >
                        {mapped ? (
                          <Check
                            size={12}
                            style={{
                              display: "inline",
                              marginRight: 5,
                              color: "#4ade80",
                            }}
                          />
                        ) : (
                          <X
                            size={12}
                            style={{
                              display: "inline",
                              marginRight: 5,
                            }}
                          />
                        )}

                        {FIELD_LABELS[field] || field}
                      </div>

                      <select
                        className="bc-select"
                        value={mapped || ""}
                        onChange={(event) =>
                          updateMapping(
                            field,
                            event.target.value,
                          )
                        }
                        disabled={status === "importing"}
                      >
                        <option value="">
                          — Sin relacionar —
                        </option>

                        {headers.map((header) => (
                          <option
                            key={header}
                            value={header}
                          >
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bc-panel bc-section">
              <div className="bc-section-head">
                <div>
                  <div className="bc-section-title">
                    Previsualización
                  </div>

                  <div className="bc-section-sub">
                    Las filas incorrectas nunca se importarán.
                  </div>
                </div>

                <button
                  className="bc-secondary"
                  onClick={() =>
                    setShowOnlyErrors((current) => !current)
                  }
                >
                  {showOnlyErrors
                    ? "Mostrar todas"
                    : `Ver errores (${invalidRows.length})`}
                </button>
              </div>

              <div className="bc-table-wrap">
                <table className="bc-table">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Estado</th>
                      <th>Edad</th>
                      <th>CCAA</th>
                      <th>Provincia</th>
                      <th>Nacionalidad</th>
                      <th>Anterior</th>
                      <th>Generales</th>
                      <th>Autonómicas</th>
                      <th>Municipales</th>
                      <th>Europeas</th>
                      <th>Ejecutivo</th>
                      <th>Feijóo</th>
                      <th>Sánchez</th>
                      <th>Abascal</th>
                      <th>Alvise</th>
                      <th>Y. Díaz</th>
                      <th>I. Montero</th>
                      <th>Ayuso</th>
                      <th>Buxadé</th>
                      <th>Ideología</th>
                      <th>Juvenil</th>
                      <th>Líder</th>
                      <th>Estado</th>
                      <th>Territorio</th>
                      <th>Pensiones</th>
                      <th>Migración</th>
                      <th>Errores</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleRows
                      .slice(0, 500)
                      .map((row) => (
                        <tr key={row.rowNumber}>
                          <td>{row.rowNumber}</td>

                          <td>
                            {row.errors.length === 0 ? (
                              <span className="bc-row-status good">
                                <CheckCircle2 size={13} />
                                Válida
                              </span>
                            ) : (
                              <span className="bc-row-status bad">
                                <XCircle size={13} />
                                Error
                              </span>
                            )}
                          </td>

                          <td>{row.edad ?? "—"}</td>
                          <td>{row.ccaa || "—"}</td>
                          <td>{row.provincia || "—"}</td>
                          <td>{row.nacionalidad || "—"}</td>

                          <td>
                            {row.anteriores_eegg || "—"}
                          </td>

                          <td>
                            {row.voto_generales || "—"}
                          </td>

                          <td>
                            {row.voto_autonomicas || "—"}
                          </td>

                          <td>
                            {row.voto_municipales || "—"}
                          </td>

                          <td>
                            {row.voto_europeas || "—"}
                          </td>

                          <td>
                            {row.nota_ejecutivo ?? "—"}
                          </td>

                          <td>{row.val_feijoo ?? "—"}</td>
                          <td>{row.val_sanchez ?? "—"}</td>
                          <td>{row.val_abascal ?? "—"}</td>
                          <td>{row.val_alvise ?? "—"}</td>

                          <td>
                            {row.val_yolanda_diaz ?? "—"}
                          </td>

                          <td>
                            {row.val_irene_montero ?? "—"}
                          </td>

                          <td>{row.val_ayuso ?? "—"}</td>
                          <td>{row.val_buxade ?? "—"}</td>

                          <td>
                            {row.posicion_ideologica ?? "—"}
                          </td>

                          <td>
                            {row.voto_asociacion_juvenil ||
                              "—"}
                          </td>

                          <td>
                            {row.lider_partido || "—"}
                          </td>

                          <td>
                            {row.monarquia_republica || "—"}
                          </td>

                          <td>
                            {row.division_territorial || "—"}
                          </td>

                          <td>
                            {row.sistema_pensiones || "—"}
                          </td>

                          <td>
                            {row.opinion_crisismigratoria ||
                              "—"}
                          </td>

                          <td>
                            {row.errors.length ? (
                              <div className="bc-error-list">
                                {row.errors.join(" · ")}
                              </div>
                            ) : row.warnings.length ? (
                              <div
                                style={{
                                  color: "#fcd34d",
                                  whiteSpace: "normal",
                                }}
                              >
                                {row.warnings.join(" · ")}
                              </div>
                            ) : (
                              <span className="good">
                                Sin incidencias
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {visibleRows.length > 500 && (
                <div
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "#777b8e",
                    fontSize: 11,
                    borderTop:
                      "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  Se muestran las primeras 500 filas de{" "}
                  {visibleRows.length.toLocaleString("es-ES")}.
                  El resto también será procesado.
                </div>
              )}

              {status === "importing" && (
                <div style={{ padding: "0 20px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: "#8c90a3",
                    }}
                  >
                    <span>
                      Importando {importedCount} respuestas…
                    </span>

                    <span>{importProgress}%</span>
                  </div>

                  <div className="bc-progress">
                    <div
                      className="bc-progress-bar"
                      style={{
                        width: `${importProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="bc-alert success">
                  <CheckCircle2
                    size={18}
                    style={{ flexShrink: 0 }}
                  />

                  <div>
                    Importación completada.{" "}
                    <strong>
                      {importedCount.toLocaleString("es-ES")}
                    </strong>{" "}
                    respuestas han sido incorporadas a
                    Supabase.
                  </div>
                </div>
              )}

              <div className="bc-footer">
                <div
                  style={{
                    color: "#777b8e",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#e4e4e7" }}>
                    {validRows.length.toLocaleString("es-ES")}
                  </strong>{" "}
                  respuestas listas para importar.
                  {invalidRows.length > 0 && (
                    <>
                      {" "}
                      Las{" "}
                      <strong className="bad">
                        {invalidRows.length.toLocaleString(
                          "es-ES",
                        )}
                      </strong>{" "}
                      filas incorrectas serán ignoradas.
                    </>
                  )}
                </div>

                <button
                  className="bc-primary"
                  onClick={importToSupabase}
                  disabled={
                    status === "importing" ||
                    status === "success" ||
                    validRows.length === 0 ||
                    missingColumns.length > 0
                  }
                >
                  {status === "importing" ? (
                    <>
                      <RefreshCw size={16} />
                      Importando…
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 size={16} />
                      Importado
                    </>
                  ) : (
                    <>
                      <Database size={16} />
                      Importar{" "}
                      {validRows.length.toLocaleString(
                        "es-ES",
                      )}{" "}
                      respuestas
                    </>
                  )}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
