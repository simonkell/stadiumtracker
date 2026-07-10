"use client";

export function AdminExportLink() {
  return (
    <a
      className="button-primary button-secondary inline-flex items-center justify-center"
      href="/api/export/stadiums"
      target="_blank"
      rel="noreferrer"
    >
      Live-Stand als JSON exportieren
    </a>
  );
}
