"use client";

import { useEffect, useState } from "react";
import { Theme, useTheme } from "@/contexts/ThemeContext";
import { NoteBoard } from "@/components/NoteBoard";
import { NoteForm } from "@/components/NoteForm";
import { NotificationBanner } from "@/components/NotificationBanner";
import {
  findAll,
  createNote,
  updateNote,
  removeNote,
} from "@/services/notesService";
import { isExpired, type Note } from "@/lib/notes";

const announcedIds = new Set<string>();

/**
 * Tono sintetizado sutil (Web Audio API) al dispararse un recordatorio.
 */
function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Limitado hasta la interacción inicial del usuario con la página
  }
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [editing, setEditing] = useState<Note | null>(null);

  // Estado del servidor REST
  const [serverStatus, setServerStatus] = useState<"connecting" | "connected" | "saving" | "error">("connecting");
  const [serverError, setServerError] = useState<string | null>(null);

  const { theme, toggleTheme } = useTheme();
  const dark = theme === Theme.DARK;

  /**
   * GET = findAll: Carga inicial de todas las notas desde el servidor al iniciar la página
   */
  async function loadNotesFromServer() {
    try {
      setServerStatus("connecting");
      const remoteNotes = await findAll();
      setNotes(remoteNotes);
      setServerStatus("connected");
      setServerError(null);
    } catch (error) {
      console.warn("Error al cargar notas desde el backend (GET /api/notes):", error);
      setServerStatus("error");
      setServerError("Servidor no disponible");
    } finally {
      setReady(true);
      setNow(Date.now());
    }
  }

  useEffect(() => {
    loadNotesFromServer();
  }, []);

  // Ticks por segundo para actualizar cuentas regresivas
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Web Notifications API: monitoreo de notas que cumplen su validez
  useEffect(() => {
    if (!ready || now === 0) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    const due = notes.filter(
      (note) => isExpired(note, now) && !note.finished && !announcedIds.has(note.id),
    );

    if (due.length === 0) return;

    for (const note of due) {
      announcedIds.add(note.id);
      try {
        new Notification(`⏰ Recordatorio: ${note.title}`, {
          body: note.text
            ? `${note.text} — se cumplieron sus ${note.initialMinutes} min de validez.`
            : `Se cumplieron los ${note.initialMinutes} min de validez de esta nota.`,
        });
        playChime();

        // PATCH = updateNote: marcar la nota como expired y finished en el servidor
        updateNote(note.id, { expired: true, finished: true }).catch((err) =>
          console.warn(`No se pudo actualizar estado de expiración para la nota ${note.id}:`, err),
        );
      } catch (err) {
        console.error("Fallo al emitir la notificación:", err);
        announcedIds.delete(note.id);
      }
    }

    setNotes((current) =>
      current.map((n) =>
        due.some((d) => d.id === n.id) ? { ...n, expired: true, finished: true } : n,
      ),
    );
  }, [notes, now, ready]);

  /**
   * Guardado de nota:
   * - Si se está editando -> PATCH = updateNote
   * - Si es una nota nueva -> POST = createNote
   */
  async function handleSaveNote(values: {
    title: string;
    text: string;
    color: string;
    minutes: number;
  }) {
    setServerStatus("saving");

    if (editing) {
      announcedIds.delete(editing.id);
      try {
        // PATCH /api/notes/:id
        const updated = await updateNote(editing.id, {
          title: values.title,
          text: values.text,
          color: values.color,
          minutes: values.minutes,
          initialMinutes: values.minutes,
          createdAt: Date.now(),
          expired: false,
          finished: false,
        });

        setNotes((current) =>
          current.map((note) => (note.id === editing.id ? updated : note)),
        );
        setEditing(null);
        setServerStatus("connected");
        setServerError(null);
      } catch (error) {
        console.error("Error al actualizar la nota (PATCH):", error);
        setServerStatus("error");
        setServerError("Error al actualizar");
      }
      return;
    }

    try {
      // POST /api/notes
      const created = await createNote({
        title: values.title,
        text: values.text,
        color: values.color,
        minutes: values.minutes,
      });

      setNotes((current) => [created, ...current]);
      setServerStatus("connected");
      setServerError(null);
    } catch (error) {
      console.error("Error al crear la nota (POST):", error);
      setServerStatus("error");
      setServerError("Error al crear la nota");
    }
  }

  /**
   * DELETE = removeNote: Elimina la nota en el servidor
   */
  async function handleDeleteNote(id: string) {
    announcedIds.delete(id);
    setServerStatus("saving");
    try {
      // DELETE /api/notes/:id
      await removeNote(id);
      setNotes((current) => current.filter((note) => note.id !== id));
      if (editing?.id === id) setEditing(null);
      setServerStatus("connected");
      setServerError(null);
    } catch (error) {
      console.error("Error al eliminar la nota (DELETE):", error);
      setServerStatus("error");
      setServerError("Error al eliminar");
    }
  }

  /**
   * PATCH = updateNote: Reinicia el temporizador de la nota desde este instante
   */
  async function handleResetTimer(note: Note) {
    announcedIds.delete(note.id);
    setServerStatus("saving");
    try {
      const updated = await updateNote(note.id, {
        createdAt: Date.now(),
        expired: false,
        finished: false,
      });
      setNotes((current) =>
        current.map((n) => (n.id === note.id ? updated : n)),
      );
      setServerStatus("connected");
      setServerError(null);
    } catch (error) {
      console.error("Error al reiniciar temporizador (PATCH):", error);
      setServerStatus("error");
      setServerError("Error al reiniciar");
    }
  }

  /**
   * Limpiar todas las notas
   */
  async function handleClearAll() {
    if (!confirm("¿Deseas eliminar todas las notas del tablero?")) return;

    setServerStatus("saving");
    try {
      await Promise.all(notes.map((n) => removeNote(n.id)));
      announcedIds.clear();
      setNotes([]);
      setEditing(null);
      setServerStatus("connected");
      setServerError(null);
    } catch (error) {
      console.error("Error al limpiar notas:", error);
      setServerStatus("error");
      setServerError("Error al limpiar notas");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: dark ? "#171411" : "#f5f0e8",
        color: dark ? "#f4efe6" : "#231c14",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "36px 20px 80px",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Cabecera Principal */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: dark ? "1px solid #332b21" : "1px solid #e5dcce",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 32 }}>📌</span>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
                Sticky Notes
              </h1>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.75 }}>
              Tablero de notas visuales con recordatorios conectado a API REST NestJS
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Indicador de estado del servidor REST */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background:
                  serverStatus === "connected"
                    ? dark
                      ? "#143122"
                      : "#dcfce7"
                    : serverStatus === "saving"
                    ? dark
                      ? "#3d3215"
                      : "#fef9c3"
                    : dark
                    ? "#381c1c"
                    : "#fee2e2",
                color:
                  serverStatus === "connected"
                    ? dark
                      ? "#86efac"
                      : "#166534"
                    : serverStatus === "saving"
                    ? dark
                      ? "#fde047"
                      : "#854d0e"
                    : dark
                    ? "#fca5a5"
                    : "#991b1b",
                border:
                  serverStatus === "connected"
                    ? dark
                      ? "1px solid #1f673f"
                      : "1px solid #bbf7d0"
                    : serverStatus === "saving"
                    ? dark
                      ? "1px solid #6b581e"
                      : "1px solid #fef08a"
                    : dark
                    ? "1px solid #7f1d1d"
                    : "1px solid #fecaca",
              }}
              title="Estado de conexión con el Back-End (http://localhost:3001/api/notes)"
            >
              <span>
                {serverStatus === "connected" && "🟢 Servidor conectado"}
                {serverStatus === "saving" && "💾 Sincronizando..."}
                {serverStatus === "connecting" && "🔄 Conectando..."}
                {serverStatus === "error" && `🔴 ${serverError || "Servidor no disponible"}`}
              </span>

              {serverStatus === "error" && (
                <button
                  type="button"
                  onClick={loadNotesFromServer}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: 11,
                    padding: 0,
                  }}
                >
                  Reintentar
                </button>
              )}
            </div>

            {/* Alternador de tema claro/oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                border: dark ? "1px solid #4a3e33" : "1px solid #d4c8b6",
                background: dark ? "#241e17" : "#fffdfa",
                color: "inherit",
                borderRadius: 8,
                padding: "8px 14px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {dark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
            </button>
          </div>
        </header>

        {/* Banner de permisos de notificación */}
        <NotificationBanner />

        {/* Formulario de creación / edición de notas */}
        <NoteForm
          key={editing?.id ?? "new"}
          editing={editing !== null}
          initialTitle={editing?.title ?? ""}
          initialText={editing?.text ?? ""}
          initialColor={editing?.color ?? "yellow"}
          initialMinutes={editing ? String(editing.initialMinutes) : "5"}
          onSubmit={handleSaveNote}
          onCancel={() => setEditing(null)}
        />

        {/* Tablero de notas */}
        <NoteBoard
          notes={notes}
          ready={ready}
          now={now}
          editingId={editing?.id ?? null}
          onEdit={setEditing}
          onDelete={handleDeleteNote}
          onResetTimer={handleResetTimer}
          onClearAll={handleClearAll}
        />
      </div>
    </main>
  );
}
