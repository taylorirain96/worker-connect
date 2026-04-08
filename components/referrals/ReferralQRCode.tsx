'use client'
import { useEffect, useRef } from 'react'

interface ReferralQRCodeProps {
  value: string
  size?: number
  className?: string
}

/**
 * Simple QR-code-like placeholder.
 * In production wire up a real QR library (e.g. `qrcode` or `react-qr-code`).
 * The canvas draws a deterministic pixel pattern derived from the referral URL.
 */
export default function ReferralQRCode({ value, size = 128, className = '' }: ReferralQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const GRID = 21
    const cell = Math.floor(size / GRID)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Deterministic hash from value
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
    }

    ctx.fillStyle = '#000000'
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        // Always fill finder patterns (corners)
        const isFinderTL = row < 7 && col < 7
        const isFinderTR = row < 7 && col >= GRID - 7
        const isFinderBL = row >= GRID - 7 && col < 7

        if (isFinderTL || isFinderTR || isFinderBL) {
          const r = isFinderTL ? row : isFinderTR ? row : row - (GRID - 7)
          const c = isFinderTL ? col : isFinderTR ? col - (GRID - 7) : col
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 1 && r <= 5 && c >= 1 && c <= 5)) {
            ctx.fillRect(col * cell, row * cell, cell, cell)
          }
          continue
        }

        // Data cells — pseudo-random from hash
        const idx = row * GRID + col
        const bit = (hash >> (idx % 32)) & 1
        if (bit) {
          ctx.fillRect(col * cell, row * cell, cell, cell)
        }
      }
    }
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded ${className}`}
      aria-label="Referral QR code"
    />
  )
}
