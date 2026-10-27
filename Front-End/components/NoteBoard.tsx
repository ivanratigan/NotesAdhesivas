"use client";

import { useState } from "react";
import { NoteCard } from "@/components/NoteCard";
import { Theme, useTheme } from "@/contexts/ThemeContext";
import { isExpired, type Note } from "@/lib/notes";

type NoteBoardProps = {
  notes: Note[];
  ready: boolean;
  now: number;
  editingId: string | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onResetTimer: (note: Note) => void;
  onClearAll?: () => void;
};

export function NoteBoard({
  notes,
  ready,
  now,
  editingId,
  onEdit,
  onDelete,
  onResetTimer,
  onClearAll,
}: NoteBoardProps) {
  const { theme } = useTheme();
  const dark = theme === Theme.DARK;
  const muted = dark ? "#baa997" : "#6c5d4f";

  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const activeNotes = notes.filter((n) => !isExpired(n, now));
  const expiredNotes = notes.filter((n) => isExpired(n, now));

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.text.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "active") return !isExpired(note, now);
    if (filter === "expired") return isExpired(note, now);
    return true;
  });

  const filterButtonStyle = (active: boolean): React.CSSProperties => ({
    background: active
      ? dark
        ? "#f4efe6"
        : "#231c14"
      : dark
      ? "#241e17"
      : "#f4eee1",
    color: active
      ? dark
        ? "#231c14"
        : "#f4efe6"
      : "inherit",
    border: dark ? "1px solid #3d3226" : "1px solid #d4c8b6",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
    <section>
      {/* Barra de cabecera del Tablero */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Tablero de Notas Visuales
          </h2>
          {ready && (
            <span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>
              ({notes.length} {notes.length === 1 ? "nota" : "notas"})
            </span>
          )}
        </div>

        {/* Acciones de filtrado y búsqueda */}
        {notes.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Buscar nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: dark ? "1px solid #3d3226" : "1px solid #d4c8b6",
                background: dark ? "#191512" : "#ffffff",
                color: "inherit",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                outline: "none",
                width: 150,
              }}
            />

            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => setFilter("all")}
                style={filterButtonStyle(filter === "all")}
              >
                Todas ({notes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("active")}
                style={filterButtonStyle(filter === "active")}
              >
                Activas ({activeNotes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("expired")}
                style={filterButtonStyle(filter === "expired")}
              >
                Vencidas ({expiredNotes.length})
              </button>
            </div>

            {onClearAll && notes.length > 1 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  background: "transparent",
                  border: "none",
                  color: dark ? "#f87171" : "#dc2626",
                  fontSize: 12,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                title="Eliminar todas las notas del tablero"
              >
                Limpiar todo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal del tablero */}
      {!ready ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            background: dark ? "#241e17" : "#fffdfa",
            borderRadius: 14,
            border: dark ? "1px dashed #3d3226" : "1px dashed #dcd1be",
            color: muted,
          }}
        >
          <p style={{ margin: 0, fontSize: 15 }}>Cargando notas desde el servidor...</p>
        </div>
      ) : notes.length === 0 ? (
        <div
          style={{
            padding: "54px 20px",
            textAlign: "center",
            background: dark ? "#241e17" : "#fffdfa",
            borderRadius: 14,
            border: dark ? "1px dashed #3d3226" : "1px dashed #dcd1be",
            color: muted,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "inherit" }}>
            El tablero está vacío
          </h3>
          <p style={{ margin: 0, fontSize: 14, maxWidth: 420, marginInline: "auto" }}>
            Completa el formulario de arriba para fijar tu primera sticky note con su título, color y recordatorio con notificación.
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            background: dark ? "#241e17" : "#fffdfa",
            borderRadius: 14,
            color: muted,
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>
            No se encontraron notas con el filtro o término de búsqueda seleccionado.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              now={now}
              selected={editingId === note.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onResetTimer={onResetTimer}
            />
          ))}
        </div>
      )}
    </section>
  );
}
