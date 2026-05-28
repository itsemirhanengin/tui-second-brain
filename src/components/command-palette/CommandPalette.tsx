import { useState, useMemo, useCallback } from "react"
import { useKeyboard } from "@opentui/react"
import { useTheme } from "../../hooks/useTheme"
import { fuzzySearch } from "../../utils/fuzzySearch"
import { getRecentCommandIds, recordCommandUsage } from "./recentCommands"
import type { Command } from "./commandRegistry"

interface CommandPaletteProps {
  commands: Command[]
  onClose: () => void
}

const MAX_VISIBLE = 12

export function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const t = useTheme()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const recentIds = useMemo(() => getRecentCommandIds(), [])

  const filteredCommands = useMemo(() => {
    if (query.trim().length === 0) {
      const recent = recentIds
        .map((id) => commands.find((c) => c.id === id))
        .filter((c): c is Command => c != null)
      const rest = commands.filter((c) => !recentIds.includes(c.id))
      return [...recent, ...rest]
    }

    const results = fuzzySearch(
      query,
      commands,
      (c) => `${c.label} ${c.category} ${c.keywords}`,
    )
    return results.map((r) => r.item)
  }, [query, commands, recentIds])

  const visibleCommands = filteredCommands.slice(0, MAX_VISIBLE)

  const execute = useCallback(
    (cmd: Command) => {
      recordCommandUsage(cmd.id)
      cmd.action()
    },
    [],
  )

  useKeyboard((key) => {
    if (key.name === "escape") {
      onClose()
      return
    }

    if (key.name === "up") {
      setSelectedIndex((i) => Math.max(0, i - 1))
      return
    }

    if (key.name === "down") {
      setSelectedIndex((i) => Math.min(visibleCommands.length - 1, i + 1))
      return
    }

    if (key.name === "return") {
      const cmd = visibleCommands[selectedIndex]
      if (cmd) execute(cmd)
      return
    }
  })

  const handleInput = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(0)
  }, [])

  const isRecent = (cmd: Command) => recentIds.includes(cmd.id)
  const showRecentHeader = query.trim().length === 0 && recentIds.length > 0

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "Navigation": return ">"
      case "Quick Action": return "+"
      default: return " "
    }
  }

  return (
    <box
      style={{
        position: "absolute",
        top: 2,
        left: "20%",
        width: 60,
        flexDirection: "column",
        backgroundColor: t.bg,
        borderStyle: "rounded",
        borderColor: t.primary,
        padding: 1,
        zIndex: 100,
      }}
    >
      <box style={{ flexDirection: "row", gap: 1, marginBottom: 1 }}>
        <text fg={t.primary}>{">"}</text>
        <input
          placeholder="Type a command..."
          value={query}
          onInput={handleInput}
          onSubmit={() => {
            const cmd = visibleCommands[selectedIndex]
            if (cmd) execute(cmd)
          }}
          focused
          style={{ flexGrow: 1 }}
        />
      </box>

      <box style={{ height: 1, marginBottom: 0 }}>
        <text fg={t.textMuted}>{"─".repeat(56)}</text>
      </box>

      {visibleCommands.length === 0 ? (
        <box style={{ padding: 1 }}>
          <text fg={t.textMuted}>No matching commands</text>
        </box>
      ) : (
        <box style={{ flexDirection: "column" }}>
          {showRecentHeader && visibleCommands.length > 0 && isRecent(visibleCommands[0]) && (
            <text fg={t.textMuted}> Recent</text>
          )}
          {visibleCommands.map((cmd, i) => {
            const isSelected = i === selectedIndex
            const wasRecent = isRecent(cmd)
            const showNavHeader =
              showRecentHeader &&
              !wasRecent &&
              (i === 0 || isRecent(visibleCommands[i - 1]))

            return (
              <box key={cmd.id} style={{ flexDirection: "column" }}>
                {showNavHeader && <text fg={t.textMuted}> All Commands</text>}
                <box
                  style={{
                    flexDirection: "row",
                    backgroundColor: isSelected ? t.bgCard : undefined,
                    paddingLeft: 1,
                    paddingRight: 1,
                  }}
                >
                  <text fg={isSelected ? t.primary : t.textSecondary}>
                    {isSelected ? "▸ " : "  "}
                  </text>
                  <text fg={isSelected ? t.text : t.textSecondary}>
                    {categoryIcon(cmd.category)}{" "}
                  </text>
                  <text fg={isSelected ? t.text : t.textSecondary} style={{ flexGrow: 1 }}>
                    {cmd.label}
                  </text>
                  <text fg={t.textMuted}>
                    {cmd.category}
                  </text>
                </box>
              </box>
            )
          })}
        </box>
      )}

      <box style={{ height: 1, marginTop: 0 }}>
        <text fg={t.textMuted}>{"─".repeat(56)}</text>
      </box>

      <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text fg={t.textMuted}> Up/Down: Navigate  Enter: Select  ESC: Close</text>
        <text fg={t.textMuted}>{filteredCommands.length} commands</text>
      </box>
    </box>
  )
}
