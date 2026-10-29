# Aplicación de Notas Adhesivas con Recordatorios

Proyecto académico de Sistemas Distribuidos compuesto por un frontend en **Next.js** y un backend desacoplado en **NestJS**.

---

## 1. Arquitectura y Tecnologías

- **Frontend (`/Front-End`):**
  - Next.js (App Router), React, TypeScript.
  - Comunicación REST con Axios contra el backend.
  - Temporizador visual y notificaciones mediante Web Notifications API y Web Audio API.

- **Backend (`/Back-End`):**
  - NestJS estructurado en capas (**Controller → Service → Repository/Database**).
  - Capa de persistencia en archivo JSON (`JsonDb`) con control de concurrencia y escritura atómica.
  - Validación de DTOs con `class-validator` y `class-transformer`.
  - Documentación de API interactiva con **Swagger / OpenAPI** (`@nestjs/swagger`).
  - Suite de **tests unitarios** con Jest y `@nestjs/testing`.

---

## 2. Endpoints de la API REST

Base URL: `http://localhost:3001/api/notes`

| Método | Endpoint | Descripción | DTO / Parámetro | Código HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | Obtiene todas las notas guardadas | — | `200 OK` |
| `POST` | `/api/notes` | Crea una nueva nota adhesiva | `CreateNoteDto` (body) | `201 Created` |
| `PATCH` | `/api/notes/:id` | Modifica título, texto, color o estado | UUID (param), `UpdateNoteDto` (body) | `200 OK` |
| `DELETE` | `/api/notes/:id` | Elimina una nota por su identificador | UUID (param) | `200 OK` |

### Documentación Swagger
Con el backend iniciado, acceder a:
```
http://localhost:3001/docs
```

---

## 3. Instrucciones de Ejecución

### Backend (NestJS)
```bash
cd Back-End
npm install
npm run start:dev
```
*El backend escuchará en `http://localhost:3001` (prefijo global `/api`).*

### Ejecución de Tests Unitarios
Para correr los tests unitarios del servicio (`notes.service.spec.ts`):
```bash
cd Back-End
npm test
```

### Frontend (Next.js)
En una terminal separada:
```bash
cd Front-End
npm install
npm run dev
```
*Abrir `http://localhost:3000` en el navegador.*
