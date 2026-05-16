'use client'
import { useState, useRef } from 'react'
import { Play, Video } from 'lucide-react'

interface VideoProfilePlayerProps {
  videoProfileUrl: string | null | undefined
  workerName?: string
}

export default function VideoProfilePlayer({ videoProfileUrl, workerName }: VideoProfilePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  if (!videoProfileUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
        <Video className="h-10 w-10 text-slate-500" />
        <p className="text-sm text-slate-400">No video profile uploaded yet.</p>
      </div>
    )
  }

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700/50">
      <video
        ref={videoRef}
        src={videoProfileUrl}
        controls
        poster=""
        className="w-full max-h-72 object-cover"
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        aria-label={workerName ? `${workerName}'s video profile` : 'Worker video profile'}
      />
      {!playing && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors group"
          aria-label="Play video profile"
        >
          <div className="h-14 w-14 rounded-full bg-indigo-600/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play className="h-6 w-6 text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  )
}
