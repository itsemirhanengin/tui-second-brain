interface EmptyStateProps {
  message?: string
  hint?: string
}

export function EmptyState({ message = "No data yet", hint = "Press 'a' to add new entry" }: EmptyStateProps) {
  return (
    <box style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: 2 }}>
      <text fg="#414868">{message}</text>
      {hint && <text fg="#565f89">{hint}</text>}
    </box>
  )
}
