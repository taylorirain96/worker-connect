'use client'
import { useRef, useState, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}: BeforeAfterSliderProps) {
  const [sliderPct, setSliderPct] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateSlider = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setSliderPct(pct)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    updateSlider(e.clientX)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    updateSlider(e.clientX)
  }

  const onMouseUp = () => {
    dragging.current = false
  }

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    updateSlider(e.touches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    updateSlider(e.touches[0].clientX)
  }

  const onTouchEnd = () => {
    dragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-lg cursor-ew-resize ${className}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="slider"
      aria-label="Before/after comparison slider"
      aria-valuenow={Math.round(sliderPct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* After image (bottom layer – full width) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="w-full h-full object-cover block"
        draggable={false}
      />

      {/* Before image (top layer – clipped to slider position) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPct}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover block"
          style={{ minWidth: '100%' }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPct}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary-500">
          <svg
            className="h-4 w-4 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-2 left-2 text-xs font-semibold bg-black/50 text-white px-2 py-0.5 rounded pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute bottom-2 right-2 text-xs font-semibold bg-black/50 text-white px-2 py-0.5 rounded pointer-events-none">
        {afterLabel}
      </span>
    </div>
  )
}
