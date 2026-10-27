import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sticky Notes | Herramienta de Notas Visuales con Recordatorios",
  description:
    "Herramienta minimalista de notas visuales (sticky notes) con selección de color, recordatorios con Web Notifications API y persistencia en localStorage (Clase 3).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
