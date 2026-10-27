import axios from "axios";
import { normalizeNotes, normalizeSingleNote, type Note } from "@/lib/notes";

/**
 * URL base del backend REST de NestJS.
 * El backend corre en el puerto 3001 con el prefijo global 'api' y el controlador 'notes'.
 * Endpoint resultante: http://localhost:3001/api/notes
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/notes";

/**
 * GET = findAll:
 * Obtiene todas las notas almacenadas en el servidor al cargar la página.
 */
export async function findAll(): Promise<Note[]> {
  const response = await axios.get(API_URL, { timeout: 5000 });
  return normalizeNotes(response.data);
}

/**
 * POST = createNote:
 * Crea una nota nueva enviando título, texto, color y minutos de validez.
 */
export async function createNote(data: {
  title: string;
  text: string;
  color: string;
  minutes: number;
}): Promise<Note> {
  const response = await axios.post(
    API_URL,
    {
      title: data.title,
      text: data.text,
      color: data.color,
      minutes: data.minutes,
    },
    { timeout: 5000 },
  );

  const normalized = normalizeSingleNote(response.data);
  if (!normalized) {
    throw new Error("Respuesta inválida del servidor al crear la nota");
  }
  return normalized;
}

/**
 * PATCH = updateNote:
 * Actualiza parcialmente una nota existente identificada por su UUID.
 * Permite actualizar campos de contenido (title, text, color, minutes)
 * o campos de estado (createdAt, expired, finished).
 */
export async function updateNote(
  id: string,
  data: {
    title?: string;
    text?: string;
    color?: string;
    minutes?: number;
    initialMinutes?: number;
    createdAt?: number;
    expired?: boolean;
    finished?: boolean;
  },
): Promise<Note> {
  const response = await axios.patch(`${API_URL}/${id}`, data, { timeout: 5000 });
  const normalized = normalizeSingleNote(response.data);
  if (!normalized) {
    throw new Error("Respuesta inválida del servidor al actualizar la nota");
  }
  return normalized;
}

/**
 * DELETE = removeNote:
 * Elimina una nota del servidor por su identificador UUID.
 */
export async function removeNote(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`, { timeout: 5000 });
}
