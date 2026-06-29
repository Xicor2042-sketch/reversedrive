'use client'

import { cn } from '@/lib/utils/cn'

interface RadarAnimationProps {
  viewCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
}

/**
 * CSS-based radar sweep animation.
 * Shows a circular radar with a rotating sweep line and a view count in the center.
 */
export function RadarAnimation({ viewCount, className, size = 'md' }: RadarAnimationProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full',
        sizeMap[size],
        className
      )}
      style={{
        background:
          'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.05) 60%, transparent 100%)',
        border: '1px solid rgba(59,130,246,0.3)',
      }}
    >
      {/* Concentric rings */}
      <div className="absolute inset-1 rounded-full border border-[#3B82F6]/20" />
      <div className="absolute inset-3 rounded-full border border-[#3B82F6]/15" />

      {/* Crosshair lines */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#3B82F6]/15" />
      <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-[#3B82F6]/15" />

      {/* Sweeping line */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(59,130,246,0.4) 350deg, rgba(6,182,212,0.6) 360deg)',
          animation: 'radar-sweep 4s linear infinite',
        }}
      />

      {/* Center dot + count */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-[#06B6D4] leading-none">{viewCount}</span>
        <span className="text-[7px] text-gray-500 leading-none mt-0.5">views</span>
      </div>

      {/* Pulse rings */}
      <div
        className="absolute inset-0 rounded-full border border-[#06B6D4]/40"
        style={{ animation: 'radar-pulse 2s ease-out infinite' }}
      />
    </div>
  )
}