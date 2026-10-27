# Sticky Notes | Herramienta de Notas Visuales con Recordatorios 📌⏰
> Proyecto práctico de la **Clase 3** (Sistemas Distribuidos). Desarrollado con **Next.js (App Router)**, **React 19**, **TypeScript**, **Web Notifications API** y arquitectura cliente-servidor mediante **API REST**.

---

## 📋 Requisitos y Funcionalidades

**Consigna 27:** Desarrollar una herramienta minimalista de notas visuales con sistema de recordatorios.

1. **Creación y edición de notas adhesivas (sticky notes):**
   - **Campos:** Título (obligatorio), texto/detalle, color de fondo configurable y minutos de validez.
   - **Paleta de notas:** 6 colores pastel característicos de notas adhesivas (*Amarillo clásico*, *Verde menta*, *Celeste cielo*, *Rosa pastel*, *Lavanda* y *Naranja suave*) con contraste balanceado para modo claro y modo oscuro.
   - **Atajos rápidos de validez:** Selectores de 1m, 5m, 15m, 30m y 60m.
   - **Edición y eliminación:** Modificación de campos reiniciando la validez y borrado individual o completo del tablero.

2. **Persistencia mediante API REST en Servidor:**
   - **Carga automática:** Al iniciar o recargar la aplicación en el navegador, el cliente realiza una petición `GET /notas` para recuperar el estado persistido.
   - **Guardado automático:** Cualquier adición, edición, reinicio de temporizador o eliminación envía inmediatamente una petición `POST /notas` con la colección actualizada.

3. **Tablero visual en tiempo real:**
   - Visualización en cuadrícula responsiva (`NoteBoard`) con estética de notas adhesivas.
   - Cuenta regresiva activa segundo a segundo (`⏳ Quedan: mm:ss`) y transición al estado vencido (`⏰ Vencida`).
   - Búsqueda en vivo y filtrado por estado (*Todas*, *Activas*, *Vencidas*).

4. **Web Notifications API y Web Audio API:**
   - Banner de autorización de permisos del navegador.
   - Emisión de notificaciones nativas del sistema operativo en el momento exacto en que expira la validez de cada nota.
   - Tono auditivo sintetizado mediante la **Web Audio API**.
   - Control de identificadores notificados para evitar alertas duplicadas.

5. **Modo Claro / Modo Oscuro:**
   - Alternancia de tema a través de `ThemeContext` con soporte de preferencias del sistema.

---

## 🔌 Contrato de Comunicación REST (Cliente - Servidor)

Toda la comunicación de red está centralizada en el módulo [`services/notesService.ts`](file:///c:/Users/Ivan/OneDrive/Desktop/Nueva%20carpeta/cosas2/Facu/Sistemas%20distribuidos/sistemas%20distribuidos/clase3-notas-adhesivas/Front-End/services/notesService.ts):

| Método HTTP | Endpoint | Acción | Descripción | Formato del Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/notes` | `findAll` | Obtiene todas las notas al iniciar la app. | *(Sin body)* $\rightarrow$ Retorna `Note[]` |
| **POST** | `/api/notes` | `createNote` | Crea una nota nueva en el servidor. | `{ "title": "...", "text": "...", "color": "yellow", "minutes": 15 }` |
| **PATCH** | `/api/notes/:id` | `updateNote` | Actualiza contenido o estado de la nota. | `{ "title": "...", "text": "...", "color": "...", "minutes": 10, "initialMinutes": 10, "createdAt": 1740000000000, "expired": false, "finished": false }` |
| **DELETE** | `/api/notes/:id` | `removeNote` | Elimina una nota por su UUID. | *(Sin body)* $\rightarrow$ Retorna `{ mensaje: "Note eliminada", id }` |

*URL base del backend:* `http://localhost:3001/api/notes` (configurable mediante `NEXT_PUBLIC_API_URL`).

---

## 🚀 Puesta en Marcha

### Front-End (Next.js)
```bash
cd clase3-notas-adhesivas/Front-End
npm install
npm run dev
```
Acceder en el navegador: [http://localhost:3000](http://localhost:3000).

---

## 📁 Estructura del Front-End

```
Front-End/
├── app/
│   ├── layout.tsx                # Shell HTML y metadatos
│   ├── page.tsx                  # Punto de entrada
│   └── globals.css               # Estilos globales y reset
├── components/
│   ├── NotesApp.tsx              # Componente principal y ciclo de sincronización REST
│   ├── NoteForm.tsx              # Formulario de alta y edición con paleta de colores
│   ├── NoteBoard.tsx             # Tablero visual, filtros y buscador
│   ├── NoteCard.tsx              # Tarjeta de sticky note con cuenta regresiva
│   └── NotificationBanner.tsx    # Gestión de permisos de Web Notifications
├── contexts/
│   └── ThemeContext.tsx          # Contexto React para modo claro/oscuro
├── services/
│   └── notesService.ts           # Servicio cliente HTTP (GET y POST REST)
└── lib/
    ├── colors.ts                 # Definición de colores pastel y tokens de estilo
    └── notes.ts                  # Modelo de datos Note y funciones de cálculo temporal
```
