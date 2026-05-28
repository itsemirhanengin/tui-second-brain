import { useState, useCallback, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { consumePendingAction } from "../../../utils/pendingAction"
import { ProgressBar } from "../../../components/shared/ProgressBar"
import { EmptyState } from "../../../components/shared/EmptyState"
import {
  addWaterEntry,
  getTodayEntries,
  getTodayTotal,
  getCurrentGoal,
  setGoal,
  getStreak,
  getDailyTotals,
  deleteWaterEntry,
  type WaterEntry,
} from "./waterStore"

type View = "main" | "history" | "goal" | "custom"

export function WaterTracker() {
  const [view, setView] = useState<View>("main")
  const [entries, setEntries] = useState(getTodayEntries())
  const [total, setTotal] = useState(getTodayTotal())
  const [goal, setGoalState] = useState(getCurrentGoal())
  const [streak, setStreakState] = useState(getStreak())
  const [history, setHistory] = useState(getDailyTotals(14))
  const [customAmount, setCustomAmount] = useState("")
  const [goalInput, setGoalInput] = useState(String(goal))
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, setInputFocused] = useState(false)

  const refresh = useCallback(() => {
    setEntries(getTodayEntries())
    setTotal(getTodayTotal())
    setGoalState(getCurrentGoal())
    setStreakState(getStreak())
    setHistory(getDailyTotals(14))
  }, [])

  const quickAdd = useCallback(
    (ml: number) => {
      addWaterEntry(ml)
      refresh()
    },
    [refresh]
  )

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "add-water") {
      didConsume.current = true
      setView("custom"); setCustomAmount(""); setInputFocused(true)
    }
  })

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("main"); setInputFocused(false)
      return
    }

    if (inputFocused) return

    if (view === "main") {
      switch (key.name) {
        case "1":
          quickAdd(250)
          break
        case "2":
          quickAdd(330)
          break
        case "3":
          quickAdd(500)
          break
        case "4":
          quickAdd(750)
          break
        case "5":
          quickAdd(1000)
          break
        case "c":
          setView("custom")
          setInputFocused(true)
          break
        case "h":
          setView("history")
          break
        case "g":
          setView("goal")
          setGoalInput(String(goal))
          setInputFocused(true)
          break
        case "x":
          if (entries.length > 0) {
            deleteWaterEntry(entries[selectedIndex]?.id ?? entries[0].id)
            refresh()
            setSelectedIndex(0)
          }
          break
        case "up":
          setSelectedIndex((i) => Math.max(0, i - 1))
          break
        case "down":
          setSelectedIndex((i) => Math.min(entries.length - 1, i + 1))
          break
      }
    } else if (key.name === "escape") {
      setView("main")
      setInputFocused(false)
    }
  })

  if (view === "goal") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7">
          <strong>Set Daily Water Goal</strong>
        </text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Goal (ml):</text>
          <input
            placeholder="2000"
            value={goalInput}
            onInput={setGoalInput}
            onSubmit={() => {
              const val = Number(goalInput)
              if (val > 0) {
                setGoal(val)
                refresh()
              }
              setView("main")
              setInputFocused(false)
            }}
            focused
            style={{ width: 10 }}
          />
        </box>
        <text fg="#414868">Press Enter to save, ESC to cancel</text>
      </box>
    )
  }

  if (view === "custom") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7">
          <strong>Add Custom Amount</strong>
        </text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Amount (ml):</text>
          <input
            placeholder="e.g. 400"
            value={customAmount}
            onInput={setCustomAmount}
            onSubmit={() => {
              const val = Number(customAmount)
              if (val > 0) {
                addWaterEntry(val)
                refresh()
              }
              setCustomAmount("")
              setView("main")
              setInputFocused(false)
            }}
            focused
            style={{ width: 10 }}
          />
        </box>
        <text fg="#414868">Press Enter to add, ESC to cancel</text>
      </box>
    )
  }

  if (view === "history") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7">
          <strong>Water History (Last 14 Days)</strong>
        </text>
        <box style={{ height: 1 }} />
        {history.length === 0 ? (
          <EmptyState message="No water data yet" hint="Start tracking water on the main view" />
        ) : (
          <scrollbox style={{ flexGrow: 1 }} viewportCulling>
            {history.map((day) => {
              const pct = goal > 0 ? Math.min((day.total / goal) * 100, 100) : 0
              const barWidth = 20
              const filled = Math.round((pct / 100) * barWidth)
              const bar = "█".repeat(filled) + "░".repeat(barWidth - filled)
              const color = day.total >= goal ? "#16c79a" : "#f39c12"
              return (
                <box key={day.date} style={{ flexDirection: "row", gap: 1 }}>
                  <text fg="#565f89" style={{ width: 12 }}>
                    {day.date}
                  </text>
                  <text fg={color}>{bar}</text>
                  <text fg="#e2e8f0">
                    {day.total}ml / {goal}ml
                  </text>
                  {day.total >= goal && <text fg="#16c79a"> ✓</text>}
                </box>
              )
            })}
          </scrollbox>
        )}
        <text fg="#414868">ESC to go back</text>
      </box>
    )
  }

  const remaining = Math.max(0, goal - total)

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7">
        <strong>Water Tracker</strong>
      </text>

      <box style={{ flexDirection: "column", borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
        <text fg="#e2e8f0">
          Today: {total}ml / {goal}ml
        </text>
        <ProgressBar current={total} max={goal} width={40} filledColor="#3498db" />
        {total >= goal ? (
          <text fg="#16c79a">Goal reached! Great job!</text>
        ) : (
          <text fg="#565f89">{remaining}ml remaining</text>
        )}
        <text fg="#bb9af7">Streak: {streak} day{streak !== 1 ? "s" : ""}</text>
      </box>

      <box style={{ flexDirection: "column", gap: 0 }}>
        <text fg="#565f89">Quick Add:</text>
        <text fg="#e2e8f0">[1] 250ml [2] 330ml [3] 500ml [4] 750ml [5] 1L [C] Custom</text>
        <text fg="#565f89">[G] Set Goal [H] History [X] Delete Selected</text>
      </box>

      <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
        <text fg="#565f89">Today's Entries:</text>
        {entries.length === 0 ? (
          <text fg="#414868">No entries yet</text>
        ) : (
          entries.map((entry, idx) => (
            <text key={entry.id} fg={idx === selectedIndex ? "#7aa2f7" : "#e2e8f0"}>
              {idx === selectedIndex ? "▸ " : "  "}
              {entry.time} - {entry.amount_ml}ml
            </text>
          ))
        )}
      </box>
    </box>
  )
}
