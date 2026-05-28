import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { getAllSettings, setSetting, getCurrency, getWaterGoal } from "./settingsStore"
import { setGoal as setWaterGoal } from "../life/water/waterStore"
import { exportToJson, exportAllCsv } from "../../utils/export"
import { DATA_DIR } from "../../db/connection"
import { homedir } from "os"
import { join } from "path"

type View = "general" | "water" | "budget" | "export"

export function SettingsView({ subView }: { subView: string }) {
  const initial = (subView === "water" ? "water" : subView === "budget" ? "budget" : subView === "export" ? "export" : "general") as View
  const [view, setView] = useState<View>(initial)
  const [inputFocused, setInputFocused] = useState(false)
  const [editField, setEditField] = useState("")
  const [editValue, setEditValue] = useState("")
  const [exportMessage, setExportMessage] = useState("")

  const settings = getAllSettings()

  useKeyboard((key) => {
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

  if (editField) {
    const labels: Record<string, string> = {
      currency: "Currency (TRY/USD/EUR/GBP):",
      date_format: "Date Format (YYYY-MM-DD):",
      time_format: "Time Format (12h/24h):",
      water_goal: "Daily Water Goal (ml):",
    }
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Edit Setting</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{labels[editField] ?? editField}</text>
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
        <text fg="#414868">Enter to save, ESC to cancel</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Settings</strong></text>

      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg={view === "general" ? "#7aa2f7" : "#565f89"} >General</text>
        <text fg={view === "water" ? "#7aa2f7" : "#565f89"}>Water</text>
        <text fg={view === "export" ? "#7aa2f7" : "#565f89"}>Export</text>
      </box>

      {view === "general" && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">[C] Currency:</text>
            <text fg="#e2e8f0">{settings.currency ?? "TRY"}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">[D] Date Format:</text>
            <text fg="#e2e8f0">{settings.date_format ?? "YYYY-MM-DD"}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">[T] Time Format:</text>
            <text fg="#e2e8f0">{settings.time_format ?? "24h"}</text>
          </box>
          <box style={{ height: 1 }} />
          <text fg="#414868">Data stored at: {DATA_DIR}</text>
        </box>
      )}

      {view === "water" && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, gap: 1 }}>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">[G] Daily Goal:</text>
            <text fg="#e2e8f0">{getWaterGoal()}ml</text>
          </box>
        </box>
      )}

      {view === "export" && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, gap: 1 }}>
          <text fg="#e2e8f0">Export your data to Desktop:</text>
          <text fg="#565f89">[J] Export as JSON (all data in one file)</text>
          <text fg="#565f89">[V] Export as CSV (one file per table)</text>
          {exportMessage && <text fg="#16c79a">{exportMessage}</text>}
        </box>
      )}
    </box>
  )
}
