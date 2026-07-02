"use client"

// Re-mounts on every route change, so each page gets the same entrance
// animation in BOTH directions (dashboard -> leads and leads -> dashboard).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter">{children}</div>
}
