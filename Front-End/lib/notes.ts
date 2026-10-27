export type Note = {
  id: string;
  title: string;
  text: string;
  color: string;
  initialMinutes: number;
  createdAt: number;
  expired: boolean;
  finished: boolean;
};

/**
 * Normaliza y valida una nota o colección de notas devuelta por el backend REST.
 */
export function normalizeNotes(raw: unknown): Note[] {
  if (!raw) return [];

  let list: unknown[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.notes)) {
      list = obj.notes;
    } else if (Array.isArray(obj.data)) {
      list = obj.data;
    }
  }

  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const n = item as Record<string, unknown>;

    const id = typeof n.id === "string" ? n.id : (typeof n._id === "string" ? n._id : String(Date.now() + Math.random()));
    const title = typeof n.title === "string" ? n.title : "";
    const text = typeof n.text === "string" ? n.text : (typeof n.body === "string" ? n.body : "");
    const color = typeof n.color === "string" && n.color ? n.color : "yellow";
    
    // Soporte para initialMinutes o minutes indistintamente
    const initialMinutes =
      typeof n.initialMinutes === "number" && n.initialMinutes > 0
        ? n.initialMinutes
        : typeof n.minutes === "number" && n.minutes > 0
        ? n.minutes
        : 5;

    // Timestamp numérico en milisegundos
    const createdAt =
      typeof n.createdAt === "number"
        ? n.createdAt
        : typeof n.createdAt === "string"
        ? new Date(n.createdAt).getTime()
        : Date.now();

    const expired = typeof n.expired === "boolean" ? n.expired : false;
    const finished = typeof n.finished === "boolean" ? n.finished : false;

    if (!title.trim()) return [];

    return [
      {
        id,
        title,
        text,
        color,
        initialMinutes,
        createdAt,
        expired,
        finished,
      },
    ];
  });
}

/**
 * Normaliza una sola nota devuelta por el servidor (por ejemplo en POST o PATCH).
 */
export function normalizeSingleNote(raw: unknown): Note | null {
  const result = normalizeNotes(raw ? [raw] : []);
  return result.length > 0 ? result[0] : null;
}

/**
 * Retorna la marca temporal exacta (en ms) en la que expira la validez de la nota.
 */
export function expiresAt(note: Note): number {
  return note.createdAt + note.initialMinutes * 60_000;
}

/**
 * Determina si la nota ya superó su tiempo de validez.
 */
export function isExpired(note: Note, now: number): boolean {
  return now >= expiresAt(note);
}

/**
 * Retorna los milisegundos restantes hasta la expiración.
 */
export function getRemainingMs(note: Note, now: number): number {
  return Math.max(0, expiresAt(note) - now);
}

/**
 * Formatea los milisegundos restantes a una cadena legible (mm:ss o hh:mm).
 */
export function formatRemainingTime(remainingMs: number): string {
  if (remainingMs <= 0) return "Validez cumplida";

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

/**
 * Formatea la hora de creación de la nota.
 */
export function formatCreationTime(timestamp: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}
