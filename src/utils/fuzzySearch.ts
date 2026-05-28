export interface FuzzyResult<T> {
  item: T
  score: number
}

export function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  if (q.length === 0) return 1
  if (q === t) return 3

  if (t.includes(q)) {
    return 2 + (q.length / t.length)
  }

  let qi = 0
  let consecutive = 0
  let maxConsecutive = 0
  let score = 0
  let prevMatchIdx = -2

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++
      score += 1

      if (ti === prevMatchIdx + 1) {
        consecutive++
        maxConsecutive = Math.max(maxConsecutive, consecutive)
      } else {
        consecutive = 1
      }

      if (ti === 0 || t[ti - 1] === " " || t[ti - 1] === ">") {
        score += 0.5
      }

      prevMatchIdx = ti
    }
  }

  if (qi < q.length) return 0

  return (score / t.length) + (maxConsecutive * 0.3)
}

export function fuzzySearch<T>(
  query: string,
  items: T[],
  getText: (item: T) => string,
  minScore = 0.01,
): FuzzyResult<T>[] {
  if (query.trim().length === 0) {
    return items.map((item) => ({ item, score: 1 }))
  }

  return items
    .map((item) => ({
      item,
      score: fuzzyMatch(query, getText(item)),
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
}
