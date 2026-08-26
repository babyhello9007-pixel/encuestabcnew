export type ExportFormatPreference = "pdf" | "png" | "csv";

export const EXPORT_FORMAT_STORAGE_KEY = "batalla-cultural-export-format";

export function readExportFormatPreference(storage: Pick<Storage, "getItem"> | null | undefined): ExportFormatPreference {
  if (!storage) return "pdf";
  const value = storage.getItem(EXPORT_FORMAT_STORAGE_KEY);
  return value === "png" || value === "csv" || value === "pdf" ? value : "pdf";
}

export function writeExportFormatPreference(
  storage: Pick<Storage, "setItem" | "removeItem"> | null | undefined,
  value: ExportFormatPreference | null,
) {
  if (!storage) return;
  if (value === null) storage.removeItem(EXPORT_FORMAT_STORAGE_KEY);
  else storage.setItem(EXPORT_FORMAT_STORAGE_KEY, value);
}
