'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GripHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BeforeAfterSliderProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

/**
 * Pure-CSS/JS before-after image comparison slider.
 * No external library required.
 */
export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50) // percentage 0-100
  const dragging = useRef(false)

  const setFromEvent = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - left) / width) * 100))
    setPosition(pct)
  }, [])

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    setFromEvent(e.clientX)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) setFromEvent(e.clientX)
    }
    const onMouseUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [setFromEvent])

  // Touch events
  const onTouchMove = (e: React.TouchEvent) => {
    setFromEvent(e.touches[0].clientX)
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden select-none rounded-lg', className)}
      style={{ touchAction: 'none' }}
    >
      {/* After image (full width, shown underneath) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="block w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped to left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="block w-full h-full object-cover"
          style={{ minWidth: containerRef.current?.clientWidth ?? 400 }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
        {beforeLabel}
      </span>
      <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
        {afterLabel}
      </span>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
        onTouchStart={(e) => setFromEvent(e.touches[0].clientX)}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center cursor-ew-resize">
          <GripHorizontal className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  )
}
