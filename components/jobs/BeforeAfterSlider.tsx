'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

/**
 * A CSS-only before/after comparison slider.
 * Drag the divider to reveal the "before" (left) vs "after" (right) photo.
 */
export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPct, setSliderPct] = useState(50)
  const dragging = useRef(false)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setSliderPct(pct)
  }, [])

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    updateSlider(e.clientX)
  }
  const onMouseMove = useCallback(
    (e: MouseEvent) => { if (dragging.current) updateSlider(e.clientX) },
    [updateSlider]
  )
  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    updateSlider(e.touches[0].clientX)
  }
  const onTouchMove = useCallback(
    (e: TouchEvent) => { if (dragging.current) updateSlider(e.touches[0].clientX) },
    [updateSlider]
  )
  const onTouchEnd = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd])

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl bg-gray-900 ${className}`}
      style={{ cursor: 'col-resize' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* After image (full width, behind) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="block w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Before image (clipped to left of slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPct}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="block w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 flex items-center justify-center"
        style={{ left: `calc(${sliderPct}% - 1px)` }}
      >
        <div className="w-0.5 h-full bg-white/80 shadow-md" />
        <div className="absolute h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-primary-500">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-600 fill-none stroke-current stroke-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-2 left-3 text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-2 right-3 text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full pointer-events-none">
        {afterLabel}
      </span>
    </div>
  )
}
