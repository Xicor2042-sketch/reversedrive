"use client"

import { useEffect, useRef, type ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right" | "scale" | "blur"

/**
 * Scroll-driven reveal (ASUS ROG-style): the element animates in when it
 * enters the viewport and animates back out when it leaves, so scrolling
 * up replays the transition in reverse. CSS transitions (not keyframes)
 * make the reversal smooth.
 *
 * Usage: <Reveal direction="up" delay={120}>...</Reveal>
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  once = false,
  className = "",
}: {
  children: ReactNode
  direction?: Direction
  delay?: number
  once?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced-motion: show everything immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.revealed = "true"
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.revealed = "true"
            if (once) observer.unobserve(el)
          } else if (!once) {
            // Only hide again once it's fully out of view, so tiny scroll
            // jitters at the edge don't flicker the element.
            el.dataset.revealed = "false"
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      data-revealed="false"
      className={`reveal reveal-${direction} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
