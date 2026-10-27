export type StickyColor = {
  id: string;
  name: string;
  bgLight: string;
  borderLight: string;
  bgDark: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  badgeBg: string;
  badgeText: string;
};

export const STICKY_COLORS: StickyColor[] = [
  {
    id: "yellow",
    name: "Amarillo clásico",
    bgLight: "#fef08a", // Amber/Yellow 200
    borderLight: "#fde047",
    bgDark: "#3b3414",
    borderDark: "#6b5d1e",
    textLight: "#352b0d",
    textDark: "#fef9c3",
    badgeBg: "rgba(0, 0, 0, 0.08)",
    badgeText: "#42320b",
  },
  {
    id: "green",
    name: "Verde menta",
    bgLight: "#bbf7d0", // Green 200
    borderLight: "#86efac",
    bgDark: "#153621",
    borderDark: "#22633b",
    textLight: "#14371e",
    textDark: "#dcfce7",
    badgeBg: "rgba(0, 0, 0, 0.08)",
    badgeText: "#14371e",
  },
  {
    id: "blue",
    name: "Celeste cielo",
    bgLight: "#bae6fd", // Sky 200
    borderLight: "#7dd3fc",
    bgDark: "#14334a",
    borderDark: "#1f567f",
    textLight: "#0f2f45",
    textDark: "#e0f2fe",
    badgeBg: "rgba(0, 0, 0, 0.08)",
    badgeText: "#0f2f45",
  },
  {
    id: "pink",
    name: "Rosa pastel",
    bgLight: "#fbcfe8", // Pink 200
    borderLight: "#f472b6",
    bgDark: "#3d152c",
    borderDark: "#6d2750",
    textLight: "#3d132a",
    textDark: "#fce7f3",
    badgeBg: "rgba(0, 0, 0, 0.08)",
    badgeText: "#3d132a",
  },
  {
    id: "purple",
    name: "Lavanda",
    bgLight: "#e9d5ff", // Purple 200
    borderLight: "#d8b4fe",
    bgDark: "#2c1743",
    borderDark: "#522b7c",
    textLight: "#2c1343",
    textDark: "#f3e8ff",
    badgeBg: "rgba(0, 0, 0, 0.08)",
    badgeText: "#2c1343",
  },
  {
    id: "orange",
    name: "Naranja suave",
    bgLight: "#fed7aa", // Orange 200
    borderLight: "#fdba74",
    bgDark: "#3e2413",
    borderDark: "#704121",
    textLight: "#3c1d0c",
    textDark: "#ffedd5",
    badgeBg: "rgba(0, 0, 0, 0.08)",
    badgeText: "#3c1d0c",
  },
];

export function getStickyColor(colorId: string = "yellow"): StickyColor {
  return STICKY_COLORS.find((c) => c.id === colorId) || STICKY_COLORS[0];
}
