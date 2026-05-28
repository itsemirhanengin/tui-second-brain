export interface Theme {
  name: string
  bg: string
  bgAlt: string
  bgCard: string
  border: string
  borderActive: string
  primary: string
  secondary: string
  accent: string
  text: string
  textSecondary: string
  textMuted: string
  success: string
  error: string
  warning: string
  info: string
}

export const THEMES: Record<string, Theme> = {
  tokyo_night: {
    name: "Tokyo Night",
    bg: "#1a1b26",
    bgAlt: "#16161e",
    bgCard: "#292e42",
    border: "#292e42",
    borderActive: "#7aa2f7",
    primary: "#7aa2f7",
    secondary: "#bb9af7",
    accent: "#7dcfff",
    text: "#e2e8f0",
    textSecondary: "#565f89",
    textMuted: "#414868",
    success: "#16c79a",
    error: "#e94560",
    warning: "#f39c12",
    info: "#3498db",
  },
  catppuccin: {
    name: "Catppuccin Mocha",
    bg: "#1e1e2e",
    bgAlt: "#181825",
    bgCard: "#313244",
    border: "#313244",
    borderActive: "#89b4fa",
    primary: "#89b4fa",
    secondary: "#cba6f7",
    accent: "#94e2d5",
    text: "#cdd6f4",
    textSecondary: "#6c7086",
    textMuted: "#45475a",
    success: "#a6e3a1",
    error: "#f38ba8",
    warning: "#fab387",
    info: "#89dceb",
  },
  dracula: {
    name: "Dracula",
    bg: "#282a36",
    bgAlt: "#21222c",
    bgCard: "#44475a",
    border: "#44475a",
    borderActive: "#bd93f9",
    primary: "#bd93f9",
    secondary: "#ff79c6",
    accent: "#8be9fd",
    text: "#f8f8f2",
    textSecondary: "#6272a4",
    textMuted: "#44475a",
    success: "#50fa7b",
    error: "#ff5555",
    warning: "#ffb86c",
    info: "#8be9fd",
  },
  nord: {
    name: "Nord",
    bg: "#2e3440",
    bgAlt: "#272c36",
    bgCard: "#3b4252",
    border: "#3b4252",
    borderActive: "#88c0d0",
    primary: "#88c0d0",
    secondary: "#b48ead",
    accent: "#81a1c1",
    text: "#eceff4",
    textSecondary: "#7b88a1",
    textMuted: "#4c566a",
    success: "#a3be8c",
    error: "#bf616a",
    warning: "#ebcb8b",
    info: "#5e81ac",
  },
  gruvbox: {
    name: "Gruvbox Dark",
    bg: "#282828",
    bgAlt: "#1d2021",
    bgCard: "#3c3836",
    border: "#3c3836",
    borderActive: "#fabd2f",
    primary: "#fabd2f",
    secondary: "#d3869b",
    accent: "#8ec07c",
    text: "#ebdbb2",
    textSecondary: "#928374",
    textMuted: "#504945",
    success: "#b8bb26",
    error: "#fb4934",
    warning: "#fe8019",
    info: "#83a598",
  },
  rosepine: {
    name: "Rose Pine",
    bg: "#191724",
    bgAlt: "#1f1d2e",
    bgCard: "#26233a",
    border: "#26233a",
    borderActive: "#c4a7e7",
    primary: "#c4a7e7",
    secondary: "#ebbcba",
    accent: "#9ccfd8",
    text: "#e0def4",
    textSecondary: "#6e6a86",
    textMuted: "#393552",
    success: "#31748f",
    error: "#eb6f92",
    warning: "#f6c177",
    info: "#9ccfd8",
  },
}

export const THEME_KEYS = Object.keys(THEMES)

export function getThemeByKey(key: string): Theme {
  return THEMES[key] ?? THEMES.tokyo_night
}
