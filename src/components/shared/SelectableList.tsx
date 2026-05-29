import type { ReactNode } from "react"

interface SelectableListProps {
  items: ReactNode[]
  selectedIndex: number
  emptyMessage?: string
  emptyHint?: string
}

export function SelectableList({ items, selectedIndex, emptyMessage, emptyHint }: SelectableListProps) {
  if (items.length === 0) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#565f89">{emptyMessage ?? "No items"}</text>
        {emptyHint && <text fg="#414868">{emptyHint}</text>}
      </box>
    )
  }

  return (
    <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
      {items}
    </scrollbox>
  )
}
