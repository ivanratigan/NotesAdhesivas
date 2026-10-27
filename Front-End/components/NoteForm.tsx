"use client";

import { Theme, useTheme } from "@/contexts/ThemeContext";
import { STICKY_COLORS, getStickyColor } from "@/lib/colors";
import { useState } from "react";

type NoteFormProps = {
  editing: boolean;
  initialTitle: string;
  initialText: string;
  initialColor: string;
  initialMinutes: string;
  onSubmit: (values: {
    title: string;
    text: string;
    color: string;
    minutes: number;
  }) => void;
  onCancel: () => void;
};

export function NoteForm({
  editing,
  initialTitle,
  initialText,
  initialColor,
  initialMinutes,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState(initialColor || "yellow");
  const [minutesInput, setMinutesInput] = useState(initialMinutes || "5");
  const [error, setError] = useState("");

  const { theme } = useTheme();
  const dark = theme === Theme.DARK;

  const inputStyle: React.CSSProperties = {
    border: dark ? "1px solid #4a3e33" : "1px solid #d4c8b6",
    background: dark ? "#191512" : "#ffffff",
    color: dark ? "#f4efe6" : "#231c14",
    borderRadius: 8,
    padding: "10px 12px",
    font: "inherit",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextText = text.trim();
    const minutes = Number(minutesInput);

    if (!nextTitle) {
      setError("El título de la nota adhesiva es obligatorio.");
      return;
    }

    if (!Number.isInteger(minutes) || minutes < 1) {
      setError("Los minutos de validez deben ser un número entero mayor a 0.");
      return;
    }

    onSubmit({
      title: nextTitle,
      text: nextText,
      color,
      minutes,
    });

    if (!editing) {
      setTitle("");
      setText("");
      setColor("yellow");
      setMinutesInput("5");
    }
    setError("");
  }

  const activeColorSpec = getStickyColor(color);

  return (
    <section
      style={{
        background: dark ? "#241e17" : "#fffdfa",
        border: dark ? "1px solid #3d3226" : "1px solid #e7decb",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 28,
        boxShadow: dark
          ? "0 4px 14px rgba(0,0,0,0.3)"
          : "0 4px 16px rgba(40,30,15,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{editing ? "✏️ Editar nota adhesiva" : "➕ Nueva nota adhesiva"}</span>
        </h2>
        {editing && (
          <span
            style={{
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 12,
              background: dark ? "#3b2e1a" : "#fef08a",
              color: dark ? "#fde047" : "#854d0e",
              fontWeight: 600,
            }}
          >
            Modo edición activo
          </span>
        )}
      </div>

      <form noValidate onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Campo Título */}
        <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600 }}>
          Título de la nota *
          <input
            value={title}
            placeholder="Ej.: Comprar insumos de laboratorio, Repasar TCP/IP..."
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            maxLength={100}
          />
        </label>

        {/* Campo Texto / Detalle */}
        <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600 }}>
          Detalle o texto de la nota
          <textarea
            value={text}
            rows={3}
            placeholder="Escribe aquí el contenido o recordatorio de la nota adhesiva..."
            onChange={(e) => setText(e.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>

        {/* Fila: Selector de Color de Fondo y Minutos de Validez */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {/* Selector de color de fondo */}
          <div>
            <span style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Color de fondo ({activeColorSpec.name})
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {STICKY_COLORS.map((c) => {
                const isSelected = color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    title={c.name}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: c.bgLight,
                      border: isSelected
                        ? dark
                          ? "3px solid #60a5fa"
                          : "3px solid #1e3a8a"
                        : "2px solid rgba(0,0,0,0.15)",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      boxShadow: isSelected
                        ? "0 4px 10px rgba(0,0,0,0.2)"
                        : "0 2px 4px rgba(0,0,0,0.06)",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    {isSelected ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de minutos de validez */}
          <div>
            <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600 }}>
              Minutos de validez (recordatorio) *
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(e.target.value)}
                  style={{ ...inputStyle, width: 110 }}
                />
                <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 400 }}>
                  minutos antes de la notificación
                </span>
              </div>
            </label>
            {/* Atajos rápidos de minutos */}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[1, 5, 15, 30, 60].map((quickMin) => (
                <button
                  key={quickMin}
                  type="button"
                  onClick={() => setMinutesInput(String(quickMin))}
                  style={{
                    background:
                      minutesInput === String(quickMin)
                        ? dark
                          ? "#3e3223"
                          : "#ece2d2"
                        : dark
                        ? "#1a1612"
                        : "#f6ede1",
                    border: dark ? "1px solid #4a3c2c" : "1px solid #dcd1be",
                    color: "inherit",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {quickMin}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mensaje de error si la validación falla */}
        {error && (
          <p
            style={{
              margin: 0,
              padding: "8px 12px",
              borderRadius: 6,
              background: dark ? "#3d1414" : "#fee2e2",
              color: dark ? "#fca5a5" : "#991b1b",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </p>
        )}

        {/* Aclaración al editar */}
        {editing && (
          <p style={{ margin: 0, color: dark ? "#d5c5b2" : "#5a4b3c", fontSize: 13 }}>
            ℹ️ Al guardar los cambios, la validez de la nota se reinicia y contará desde este momento.
          </p>
        )}

        {/* Botones de acción del formulario */}
        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button
            type="submit"
            style={{
              background: dark ? "#f4efe6" : "#231c14",
              color: dark ? "#231c14" : "#fffdfa",
              border: 0,
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {editing ? "💾 Guardar cambios" : "📌 Agregar al tablero"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "transparent",
                border: dark ? "1px solid #4a3e33" : "1px solid #d4c8b6",
                color: "inherit",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
