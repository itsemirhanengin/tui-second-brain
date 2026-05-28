import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { getAllSettings, setSetting, getCurrency, getWaterGoal } from "./settingsStore"
import { setGoal as setWaterGoal } from "../life/water/waterStore"
import { exportToJson, exportAllCsv } from "../../utils/export"
import { DATA_DIR } from "../../db/connection"
import { homedir } from "os"
import { join } from "path"
import { useTheme } from "../../hooks/useTheme"
import { THEMES, THEME_KEYS, type Theme } from "../../utils/themes"

type View = "general" | "water" | "budget" | "export"

export function SettingsView({ subView }: { subView: string }) {
  const theme = useTheme()
  const propView = (subView === "water" ? "water" : subView === "budget" ? "budget" : subView === "export" ? "export" : "general") as View
  const [view, setView] = useState<View>(propView)

  useEffect(() => {
    setView(propView)
    setInputFocused(false)
    setEditField("")
  }, [propView])

  const [inputFocused, setInputFocused] = useState(false)
  const [editField, setEditField] = useState("")
  const [editValue, setEditValue] = useState("")
  const [exportMessage, setExportMessage] = useState("")
  const [themeIdx, setThemeIdx] = useState(0)
  const [pickingTheme, setPickingTheme] = useState(false)

  const settings = getAllSettings()
  const currentThemeKey = settings.theme ?? "tokyo_night"

  useKeyboard((key) => {
    if (pickingTheme) {
      switch (key.name) {
        case "up": setThemeIdx((i) => Math.max(0, i - 1)); break
        case "down": setThemeIdx((i) => Math.min(THEME_KEYS.length - 1, i + 1)); break
        case "return":
          setSetting("theme", THEME_KEYS[themeIdx])
          setPickingTheme(false)
          break
        case "escape":
          setPickingTheme(false)
          break
      }
      return
    }

    if (key.name === "escape" && inputFocused) {
      setEditField(""); setInputFocused(false)
      return
    }

    if (inputFocused) return

    if (key.name === "escape") {
      setEditField("")
      return
    }

    if (view === "general") {
      switch (key.name) {
        case "c":
          setEditField("currency")
          setEditValue(settings.currency ?? "TRY")
          setInputFocused(true)
          break
        case "d":
          setEditField("date_format")
          setEditValue(settings.date_format ?? "YYYY-MM-DD")
          setInputFocused(true)
          break
        case "t":
          setEditField("time_format")
          setEditValue(settings.time_format ?? "24h")
          setInputFocused(true)
          break
        case "h":
          setThemeIdx(THEME_KEYS.indexOf(currentThemeKey) >= 0 ? THEME_KEYS.indexOf(currentThemeKey) : 0)
          setPickingTheme(true)
          break
        case "1":
          setSetting("notifications_payments", (settings.notifications_payments ?? "1") === "1" ? "0" : "1")
          break
        case "2":
          setSetting("notifications_routines", (settings.notifications_routines ?? "1") === "1" ? "0" : "1")
          break
        case "3":
          setSetting("notifications_deadlines", (settings.notifications_deadlines ?? "1") === "1" ? "0" : "1")
          break
        case "4":
          setSetting("notifications_budget", (settings.notifications_budget ?? "1") === "1" ? "0" : "1")
          break
      }
    } else if (view === "water") {
      if (key.name === "g") {
        setEditField("water_goal")
        setEditValue(String(getWaterGoal()))
        setInputFocused(true)
      }
    } else if (view === "export") {
      if (key.name === "j") {
        try {
          const outputDir = join(homedir(), "Desktop")
          const path = exportToJson(outputDir)
          setExportMessage(`Exported to: ${path}`)
        } catch {
          setExportMessage("Export failed")
        }
      } else if (key.name === "v") {
        try {
          const outputDir = join(homedir(), "Desktop")
          const paths = exportAllCsv(outputDir)
          setExportMessage(`Exported ${paths.length} CSV files to Desktop`)
        } catch {
          setExportMessage("Export failed")
        }
      }
    }
  })

  if (pickingTheme) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg={theme.primary}><strong>Select Theme</strong></text>
        <text fg={theme.textSecondary}>Up/Down to browse, Enter to apply, ESC to cancel</text>
        <box style={{ height: 1 }} />
        {THEME_KEYS.map((key, idx) => {
          const t = THEMES[key]
          const isSelected = idx === themeIdx
          const isCurrent = key === currentThemeKey
          return (
            <box key={key} style={{ flexDirection: "row", gap: 1 }}>
              <text fg={isSelected ? theme.primary : theme.textSecondary}>
                {isSelected ? "▸ " : "  "}
              </text>
              <text fg={t.primary}>{t.name}</text>
              {isCurrent && <text fg={theme.success}>(current)</text>}
              <box style={{ flexDirection: "row", gap: 0 }}>
                <text bg={t.bg} fg={t.text}> Aa </text>
                <text bg={t.bgCard} fg={t.primary}> ■ </text>
                <text bg={t.bgCard} fg={t.secondary}> ■ </text>
                <text bg={t.bgCard} fg={t.accent}> ■ </text>
                <text bg={t.bgCard} fg={t.success}> ■ </text>
                <text bg={t.bgCard} fg={t.error}> ■ </text>
                <text bg={t.bgCard} fg={t.warning}> ■ </text>
              </box>
            </box>
          )
        })}
      </box>
    )
  }

  if (editField) {
    const labels: Record<string, string> = {
      currency: "Currency (TRY/USD/EUR/GBP):",
      date_format: "Date Format (YYYY-MM-DD):",
      time_format: "Time Format (12h/24h):",
      water_goal: "Daily Water Goal (ml):",
    }
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg={theme.primary}><strong>Edit Setting</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg={theme.textSecondary}>{labels[editField] ?? editField}</text>
          <input value={editValue} onInput={setEditValue} onSubmit={() => {
            if (editField === "water_goal") {
              const val = Number(editValue)
              if (val > 0) setWaterGoal(val)
            } else {
              setSetting(editField, editValue)
            }
            setEditField("")
            setInputFocused(false)
          }} focused style={{ width: 20 }} />
        </box>
        <text fg={theme.textMuted}>Enter to save, ESC to cancel</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg={theme.primary}><strong>Settings</strong></text>

      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg={view === "general" ? theme.primary : theme.textSecondary}>General</text>
        <text fg={view === "water" ? theme.primary : theme.textSecondary}>Water</text>
        <text fg={view === "export" ? theme.primary : theme.textSecondary}>Export</text>
      </box>

      {view === "general" && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: theme.border, padding: 1, gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[C] Currency:</text>
            <text fg={theme.text}>{settings.currency ?? "TRY"}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[D] Date Format:</text>
            <text fg={theme.text}>{settings.date_format ?? "YYYY-MM-DD"}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[T] Time Format:</text>
            <text fg={theme.text}>{settings.time_format ?? "24h"}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[H] Theme:</text>
            <text fg={theme.primary}>{THEMES[currentThemeKey]?.name ?? currentThemeKey}</text>
          </box>
          <box style={{ height: 1 }} />
          <text fg={theme.textSecondary}><strong>Notifications</strong></text>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[1] Payments:</text>
            <text fg={(settings.notifications_payments ?? "1") === "1" ? theme.success : theme.textMuted}>
              {(settings.notifications_payments ?? "1") === "1" ? "ON" : "OFF"}
            </text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[2] Routines:</text>
            <text fg={(settings.notifications_routines ?? "1") === "1" ? theme.success : theme.textMuted}>
              {(settings.notifications_routines ?? "1") === "1" ? "ON" : "OFF"}
            </text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[3] Deadlines:</text>
            <text fg={(settings.notifications_deadlines ?? "1") === "1" ? theme.success : theme.textMuted}>
              {(settings.notifications_deadlines ?? "1") === "1" ? "ON" : "OFF"}
            </text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[4] Budget:</text>
            <text fg={(settings.notifications_budget ?? "1") === "1" ? theme.success : theme.textMuted}>
              {(settings.notifications_budget ?? "1") === "1" ? "ON" : "OFF"}
            </text>
          </box>
          <box style={{ height: 1 }} />
          <text fg={theme.textMuted}>Data stored at: {DATA_DIR}</text>
        </box>
      )}

      {view === "water" && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: theme.border, padding: 1, gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={theme.textSecondary}>[G] Daily Goal:</text>
            <text fg={theme.text}>{getWaterGoal()}ml</text>
          </box>
        </box>
      )}

      {view === "export" && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: theme.border, padding: 1, gap: 1 }}>
          <text fg={theme.text}>Export your data to Desktop:</text>
          <text fg={theme.textSecondary}>[J] Export as JSON (all data in one file)</text>
          <text fg={theme.textSecondary}>[V] Export as CSV (one file per table)</text>
          {exportMessage && <text fg={theme.success}>{exportMessage}</text>}
        </box>
      )}
    </box>
  )
}
