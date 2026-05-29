import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { setGlobalInputFocus } from "../../../utils/inputFocus"
import { ProgressBar } from "../../../components/shared/ProgressBar"
import { EmptyState } from "../../../components/shared/EmptyState"
import {
  getHabits,
  createHabit,
  deleteHabit,
  logHabitToday,
  unlogHabitToday,
  isHabitDoneToday,
  getHabitHeatmap,
  getHabitWeeklyRate,
  getHabitMonthlyRate,
  type Habit,
} from "./habitsStore"

type View = "list" | "new" | "detail"

export function HabitsView() {
  const [view, setView] = useState<View>("list")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalInputFocus(v) }
  const [, setDataVer] = useState(0)
  const bump = () => setDataVer((v) => v + 1)

  const [newName, setNewName] = useState("")
  const [newCat, setNewCat] = useState("")
  const [newStep, setNewStep] = useState(0)

  const [detailHabit, setDetailHabit] = useState<Habit | null>(null)

  const habits = getHabits()

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("list"); setInputFocused(false)
      return
    }

    if (inputFocused) return

    if (view === "list") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(habits.length - 1, i + 1)); break
        case "return":
          if (habits[selectedIndex]) {
            const h = habits[selectedIndex]
            if (isHabitDoneToday(h.id)) unlogHabitToday(h.id)
            else logHabitToday(h.id)
            bump()
          }
          break
        case "n":
          setNewName(""); setNewCat(""); setNewStep(0)
          setView("new"); setInputFocused(true)
          break
        case "d":
          if (habits[selectedIndex]) {
            setDetailHabit(habits[selectedIndex])
            setView("detail")
          }
          break
        case "x":
          if (habits[selectedIndex]) { deleteHabit(habits[selectedIndex].id); setSelectedIndex(Math.max(0, selectedIndex - 1)); bump() }
          break
      }
    } else if (view === "detail") {
      if (key.name === "escape") { setView("list"); setDetailHabit(null) }
    }
  })

  if (view === "new") {
    const steps = [
      { label: "Habit Name:", placeholder: "e.g. Meditate", value: newName, setter: setNewName },
      { label: "Category (optional):", placeholder: "e.g. Health", value: newCat, setter: setNewCat },
    ]
    const step = steps[newStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Habit</strong> (Step {newStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={((val: string) => {
            step.setter(val)
            if (newStep < steps.length - 1) setNewStep(newStep + 1)
            else {
              if (newName.trim()) createHabit(newName.trim(), newCat.trim())
              setView("list"); setInputFocused(false)
            }
          }) as any} focused style={{ width: 30 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "detail" && detailHabit) {
    const weekRate = getHabitWeeklyRate(detailHabit.id)
    const monthRate = getHabitMonthlyRate(detailHabit.id)
    const heatmap = getHabitHeatmap(detailHabit.id, 12)
    const weeks: { date: string; done: boolean }[][] = []
    for (let i = 0; i < heatmap.length; i += 7) {
      weeks.push(heatmap.slice(i, i + 7))
    }
    const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{detailHabit.name}</strong></text>
        {detailHabit.category && <text fg="#414868">Category: {detailHabit.category}</text>}

        <box style={{ flexDirection: "row", gap: 3 }}>
          <text fg="#565f89">Weekly: <span fg="#bb9af7">{weekRate}%</span></text>
          <text fg="#565f89">Monthly: <span fg="#16c79a">{monthRate}%</span></text>
        </box>
        <ProgressBar current={monthRate} max={100} width={30} label="30d completion" />

        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          <text fg="#565f89">Contribution Heatmap (12 weeks):</text>
          {dayLabels.map((day, di) => (
            <box key={day} style={{ flexDirection: "row", gap: 0 }}>
              <text fg="#565f89">{day} </text>
              {weeks.map((week, wi) => {
                const entry = week[di]
                if (!entry) return <text key={wi} fg="#292e42">{" ░"}</text>
                return <text key={wi} fg={entry.done ? "#16c79a" : "#292e42"}>{entry.done ? " █" : " ░"}</text>
              })}
            </box>
          ))}
        </box>

        <text fg="#414868">ESC to go back</text>
      </box>
    )
  }

  const doneToday = habits.filter((h) => isHabitDoneToday(h.id)).length

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Habits</strong> <span fg="#565f89">({doneToday}/{habits.length} today)</span></text>
      <text fg="#565f89">[Enter] Toggle [N] New [D] Detail [X] Delete</text>

      {habits.length === 0 ? <EmptyState message="No habits yet" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {habits.map((h, idx) => {
            const done = isHabitDoneToday(h.id)
            const rate = getHabitWeeklyRate(h.id)
            return (
              <box key={h.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#414868"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg={done ? "#16c79a" : "#565f89"}>{done ? "✓" : "○"}</text>
                <text fg={done ? "#16c79a" : "#e2e8f0"}>{h.name}</text>
                {h.category && <text fg="#414868">[{h.category}]</text>}
                <text fg="#565f89">{rate}%</text>
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
