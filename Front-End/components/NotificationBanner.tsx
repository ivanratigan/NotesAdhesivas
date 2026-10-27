"use client";

import { useEffect, useState } from "react";
import { Theme, useTheme } from "@/contexts/ThemeContext";

type NotificationBannerProps = {
  onPermissionChange?: (permission: NotificationPermission) => void;
};

export function NotificationBanner({ onPermissionChange }: NotificationBannerProps) {
  const { theme } = useTheme();
  const dark = theme === Theme.DARK;

  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function handleRequestPermission() {
    if (!("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      onPermissionChange?.(res);

      if (res === "granted") {
        new Notification("¡Recordatorios activados! 📌", {
          body: "Recibirás una notificación inmediata cada vez que una nota cumpla sus minutos de validez.",
        });
      }
    } catch (error) {
      console.error("Error al solicitar permiso de notificaciones:", error);
    }
  }

  function handleSendTestNotification() {
    if (permission === "granted") {
      new Notification("Prueba de notificación 🔔", {
        body: "El sistema de notificaciones de la Web Notifications API está funcionando correctamente.",
      });
    }
  }

  if (!supported) {
    return (
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14,
          background: dark ? "#35231c" : "#fef2f2",
          border: dark ? "1px solid #7f2323" : "1px solid #fecaca",
          color: dark ? "#fca5a5" : "#991b1b",
        }}
      >
        ⚠️ Tu navegador no soporta la <strong>Web Notifications API</strong>.
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 13,
          background: dark ? "#143122" : "#f0fdf4",
          border: dark ? "1px solid #1f673f" : "1px solid #bbf7d0",
          color: dark ? "#86efac" : "#166534",
        }}
      >
        <span>
          ✓ <strong>Notificaciones del navegador activadas:</strong> Te avisaremos automáticamente al vencer cada sticky note.
        </span>
        <button
          type="button"
          onClick={handleSendTestNotification}
          style={{
            background: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
            border: dark ? "1px solid #1f673f" : "1px solid #86efac",
            color: "inherit",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Probar alerta
        </button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14,
          background: dark ? "#382218" : "#fff7ed",
          border: dark ? "1px solid #7c3a16" : "1px solid #ffedd5",
          color: dark ? "#fdba74" : "#9a3412",
        }}
      >
        🔔 <strong>Notificaciones bloqueadas:</strong> Has bloqueado las notificaciones en el navegador. Para recibir recordatorios visuales al vencer las notas, habilítalas en la configuración de permisos del navegador (ícono del candado junto a la URL).
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 18px",
        borderRadius: 12,
        marginBottom: 20,
        background: dark ? "#2b251d" : "#fefce8",
        border: dark ? "1px solid #5a4b37" : "1px solid #fef08a",
        color: dark ? "#fde68a" : "#854d0e",
      }}
    >
      <div>
        <strong>🔔 Activa las notificaciones del navegador</strong>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>
          Para que la aplicación te avise puntualmente (Web Notifications API) cuando una nota cumpla sus minutos de validez.
        </p>
      </div>
      <button
        type="button"
        onClick={handleRequestPermission}
        style={{
          background: dark ? "#fef08a" : "#ca8a04",
          color: dark ? "#2c2206" : "#ffffff",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Permitir notificaciones
      </button>
    </div>
  );
}
