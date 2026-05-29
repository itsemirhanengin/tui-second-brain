import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { setGlobalInputFocus } from "../../../utils/inputFocus"
import { ProgressBar } from "../../../components/shared/ProgressBar"
import { EmptyState } from "../../../components/shared/EmptyState"
import {
  getGoals,
  createGoal,
  deleteGoal,
  updateGoalProgress,
  toggleGoalComplete,
  getMilestones,
  createMilestone,
  toggleMilestone,
  deleteMilestone,
  getGoalProgress,
  type Goal,
  type Milestone,
} from "./goalsStore"

type View = "list" | "new" | "detail" | "add_milestone" | "update_progress"

export function GoalsView() {
  const [view, setView] = useState<View>("list")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalInputFocus(v) }
  const [, setDataVer] = useState(0)
  const bump = () => setDataVer((v) => v + 1)

  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newUnit, setNewUnit] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newStep, setNewStep] = useState(0)

  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [msIdx, setMsIdx] = useState(0)
  const [msTitle, setMsTitle] = useState("")
  const [progressInput, setProgressInput] = useState("")

  const goals = getGoals(true)

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      if (view === "add_milestone" || view === "update_progress") setView("detail")
      else setView("list")
      setInputFocused(false)
      return
    }

    if (inputFocused) return

    if (view === "list") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(goals.length - 1, i + 1)); break
        case "return":
          if (goals[selectedIndex]) { setActiveGoal(goals[selectedIndex]); setMsIdx(0); setView("detail") }
          break
        case "n":
          setNewTitle(""); setNewDesc(""); setNewTarget(""); setNewUnit(""); setNewDate(""); setNewStep(0)
          setView("new"); setInputFocused(true)
          break
        case "c":
          if (goals[selectedIndex]) { toggleGoalComplete(goals[selectedIndex].id); bump() }
          break
        case "x":
          if (goals[selectedIndex]) { deleteGoal(goals[selectedIndex].id); setSelectedIndex(Math.max(0, selectedIndex - 1)); bump() }
          break
      }
    } else if (view === "detail" && activeGoal) {
      const milestones = getMilestones(activeGoal.id)
      switch (key.name) {
        case "up": setMsIdx((i) => Math.max(0, i - 1)); break
        case "down": setMsIdx((i) => Math.min(milestones.length - 1, i + 1)); break
        case "return":
          if (milestones[msIdx]) { toggleMilestone(milestones[msIdx].id); bump() }
          break
        case "m":
          setMsTitle(""); setView("add_milestone"); setInputFocused(true)
          break
        case "p":
          setProgressInput(String(activeGoal.current_value)); setView("update_progress"); setInputFocused(true)
          break
        case "x":
          if (milestones[msIdx]) { deleteMilestone(milestones[msIdx].id); setMsIdx(Math.max(0, msIdx - 1)); bump() }
          break
        case "escape": setView("list"); setActiveGoal(null); break
      }
    }
  })

  if (view === "new") {
    const steps = [
      { label: "Goal Title:", placeholder: "e.g. Save for vacation", value: newTitle, setter: setNewTitle },
      { label: "Description:", placeholder: "Optional details", value: newDesc, setter: setNewDesc },
      { label: "Target Value (0 for milestone-based):", placeholder: "10000", value: newTarget, setter: setNewTarget },
      { label: "Unit:", placeholder: "e.g. TRY, kg, books", value: newUnit, setter: setNewUnit },
      { label: "Target Date (YYYY-MM-DD, optional):", placeholder: "", value: newDate, setter: setNewDate },
    ]
    const step = steps[newStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Goal</strong> (Step {newStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={((val: string) => {
            step.setter(val)
            if (newStep < steps.length - 1) setNewStep(newStep + 1)
            else {
              if (newTitle.trim()) createGoal(newTitle.trim(), newDesc, newDate || null, Number(newTarget) || null, newUnit)
              setView("list"); setInputFocused(false)
            }
          }) as any} focused style={{ width: 35 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "add_milestone" && activeGoal) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{activeGoal.title}</strong> — Add Milestone</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Milestone:</text>
          <input placeholder="e.g. Complete first chapter" value={msTitle} onInput={setMsTitle} onSubmit={((val: string) => {
            setMsTitle(val)
            if (val.trim()) createMilestone(activeGoal.id, val.trim())
            setView("detail"); setInputFocused(false)
          }) as any} focused style={{ width: 35 }} />
        </box>
        <text fg="#414868">Enter to add, ESC to cancel</text>
      </box>
    )
  }

  if (view === "update_progress" && activeGoal) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{activeGoal.title}</strong> — Update Progress</text>
        <text fg="#565f89">Current: {activeGoal.current_value}{activeGoal.unit ? ` ${activeGoal.unit}` : ""} {activeGoal.target_value ? `/ ${activeGoal.target_value} ${activeGoal.unit}` : ""}</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">New Value:</text>
          <input placeholder={String(activeGoal.current_value)} value={progressInput} onInput={setProgressInput} onSubmit={((v: string) => {
            setProgressInput(v)
            const num = Number(v)
            if (!isNaN(num)) updateGoalProgress(activeGoal.id, num)
            setActiveGoal(getGoals(true).find((g) => g.id === activeGoal.id) ?? activeGoal)
            setView("detail"); setInputFocused(false); bump()
          }) as any} focused style={{ width: 15 }} />
        </box>
        <text fg="#414868">Enter to save, ESC to cancel</text>
      </box>
    )
  }

  if (view === "detail" && activeGoal) {
    const milestones = getMilestones(activeGoal.id)
    const progress = getGoalProgress(activeGoal.id)
    const completedMs = milestones.filter((m) => m.is_completed).length

    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#7aa2f7"><strong>{activeGoal.title}</strong></text>
          {activeGoal.is_completed && <text fg="#16c79a">[COMPLETED]</text>}
        </box>
        {activeGoal.description && <text fg="#e2e8f0">{activeGoal.description}</text>}

        <box style={{ flexDirection: "row", gap: 3 }}>
          {activeGoal.target_value != null && activeGoal.target_value > 0 && (
            <text fg="#565f89">Progress: {activeGoal.current_value}/{activeGoal.target_value} {activeGoal.unit}</text>
          )}
          {activeGoal.target_date && <text fg="#565f89">Target: {activeGoal.target_date}</text>}
        </box>
        <ProgressBar current={progress} max={100} width={30} label={`${progress}%`} />

        <box style={{ height: 1 }} />
        <text fg="#bb9af7"><strong>Milestones</strong> <span fg="#565f89">({completedMs}/{milestones.length})</span></text>
        <text fg="#565f89">[M] Add Milestone [Enter] Toggle [P] Update Progress [X] Delete [ESC] Back</text>

        {milestones.length === 0 ? (
          <text fg="#414868">No milestones — press M to add</text>
        ) : (
          <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
            {milestones.map((ms, idx) => (
              <box key={ms.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === msIdx ? "#7aa2f7" : "#414868"}>{idx === msIdx ? "▸" : " "}</text>
                <text fg={ms.is_completed ? "#16c79a" : "#565f89"}>{ms.is_completed ? "✓" : "○"}</text>
                <text fg={ms.is_completed ? "#414868" : "#e2e8f0"}>{ms.title}</text>
              </box>
            ))}
          </box>
        )}
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Goals</strong></text>
      <text fg="#565f89">[N] New [Enter] Detail [C] Complete [X] Delete</text>

      {goals.length === 0 ? <EmptyState message="No goals yet" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {goals.map((g, idx) => {
            const progress = getGoalProgress(g.id)
            return (
              <box key={g.id} style={{ flexDirection: "column", marginBottom: 1 }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text fg={idx === selectedIndex ? "#7aa2f7" : "#414868"}>{idx === selectedIndex ? "▸" : " "}</text>
                  <text fg={g.is_completed ? "#16c79a" : "#e2e8f0"}>{g.is_completed ? "✓ " : ""}{g.title}</text>
                  {g.target_value != null && g.target_value > 0 && <text fg="#565f89">{g.current_value}/{g.target_value} {g.unit}</text>}
                  {g.target_date && <text fg="#414868">by {g.target_date}</text>}
                </box>
                <box style={{ paddingLeft: 4 }}>
                  <ProgressBar current={progress} max={100} width={20} label={`${progress}%`} />
                </box>
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
