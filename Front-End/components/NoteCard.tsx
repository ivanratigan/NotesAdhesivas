"use client";

import { useTheme, Theme } from "@/contexts/ThemeContext";
import { getStickyColor } from "@/lib/colors";
import {
  isExpired,
  getRemainingMs,
  formatRemainingTime,
  formatCreationTime,
  type Note,
} from "@/lib/notes";

type NoteCardProps = {
  note: Note;
  now: number;
  selected: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onResetTimer?: (note: Note) => void;
};

export function NoteCard({
  note,
  now,
  selected,
  onEdit,
  onDelete,
  onResetTimer,
}: NoteCardProps) {
  const { theme } = useTheme();
  const dark = theme === Theme.DARK;

  const expired = now > 0 && isExpired(note, now);
  const remainingMs = getRemainingMs(note, now);
  const colorSpec = getStickyColor(note.color);

  // Colores dinámicos según el modo y el color de fondo elegido para la nota
  const bgColor = dark ? colorSpec.bgDark : colorSpec.bgLight;
  const borderColor = dark ? colorSpec.borderDark : colorSpec.borderLight;
  const textColor = dark ? colorSpec.textDark : colorSpec.textLight;

  const buttonStyle = {
    border: "1px solid rgba(0, 0, 0, 0.15)",
    background: dark ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.6)",
    color: textColor,
    borderRadius: 7,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    transition: "all 0.15s ease",
  };

  return (
    <article
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        minHeight: 220,
        padding: "18px 18px 14px",
        borderRadius: 8,
        boxShadow: dark
          ? "0 8px 18px rgba(0, 0, 0, 0.45)"
          : "0 10px 20px rgba(50, 40, 20, 0.08), 0 2px 6px rgba(0,0,0,0.04)",
        outline: selected
          ? dark
            ? "3px solid #60a5fa"
            : "3px solid #2563eb"
          : "none",
        outlineOffset: 2,
        opacity: expired ? 0.78 : 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        color: textColor,
        transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.3s ease",
      }}
    >
      {/* Detalle visual de cinta adhesiva superior (Tape / Pin) */}
      <div
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 52,
          height: 14,
          background: dark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(2px)",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.06)",
        }}
        aria-hidden="true"
      />

      {/* Cabecera de la tarjeta: Título y temporizador */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              lineHeight: 1.3,
              wordBreak: "break-word",
            }}
          >
            {note.title}
          </h3>

          {/* Chip de temporizador */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 12,
              whiteSpace: "nowrap",
              background: expired
                ? dark
                  ? "#521616"
                  : "#fee2e2"
                : colorSpec.badgeBg,
              color: expired
                ? dark
                  ? "#fca5a5"
                  : "#991b1b"
                : colorSpec.badgeText,
              border: expired
                ? dark
                  ? "1px solid #7f1d1d"
                  : "1px solid #fca5a5"
                : "1px solid rgba(0,0,0,0.06)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            title={expired ? "Esta nota ha cumplido su validez" : "Tiempo restante antes de recibir la notificación"}
          >
            {expired ? "⏰ Vencida" : `⏳ ${formatRemainingTime(remainingMs)}`}
          </span>
        </div>

        <span style={{ fontSize: 11, opacity: 0.7 }}>
          Creada a las {formatCreationTime(note.createdAt)} ({note.initialMinutes} min validez)
        </span>
      </div>

      {/* Contenido / Texto de la nota */}
      <p
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          lineHeight: 1.45,
          fontSize: 14,
          flex: 1,
          wordBreak: "break-word",
          opacity: 0.95,
        }}
      >
        {note.text || <em style={{ opacity: 0.6 }}>Sin descripción adicional</em>}
      </p>

      {/* Barra de acciones al pie */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 6,
          paddingTop: 8,
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => onEdit(note)}
            title="Editar título, texto, color o minutos"
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => onDelete(note.id)}
            title="Eliminar esta nota del tablero"
          >
            🗑️ Eliminar
          </button>
        </div>

        {onResetTimer && (
          <button
            type="button"
            style={{
              ...buttonStyle,
              fontSize: 11,
              padding: "4px 8px",
              opacity: 0.85,
            }}
            onClick={() => onResetTimer(note)}
            title="Reiniciar el conteo de validez desde este instante"
          >
            🔄 Reiniciar
          </button>
        )}
      </div>
    </article>
  );
}
