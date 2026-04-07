'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  before: string
  after: string
}

export function BeforeAfterShowcase({ before, after }: Props) {
  const [dividerPct, setDividerPct] = useState(50)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.offsetWidth)
    const ro = new ResizeObserver(() => setContainerWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const updateFromEvent = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setDividerPct(pct)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    updateFromEvent(e.clientX)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    updateFromEvent(e.clientX)
  }
  const onMouseUp = () => { dragging.current = false }

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    updateFromEvent(e.touches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    updateFromEvent(e.touches[0].clientX)
  }
  const onTouchEnd = () => { dragging.current = false }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-48 select-none overflow-hidden cursor-col-resize"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* After photo (full width baseline) */}
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before photo clipped to left side */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${dividerPct}%` }}
      >
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerWidth > 0 ? containerWidth : '100%' }}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${dividerPct}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className="text-gray-500 text-xs font-bold select-none">⇔</span>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
        Before
      </span>
      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
        After
      </span>
    </div>
  )
}
