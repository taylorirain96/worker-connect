'use client'
import { Star, CheckCircle, ExternalLink } from 'lucide-react'

interface Props {
  bbbRating?: string
  googleRating?: number
  isAccredited?: boolean
}

export default function BBBIntegration({ bbbRating, googleRating, isAccredited }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">BBB</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">Better Business Bureau</p>
            {isAccredited && <CheckCircle className="h-4 w-4 text-blue-600" />}
          </div>
          {bbbRating ? (
            <p className="text-sm text-gray-600">Rating: <span className="font-semibold text-blue-700">{bbbRating}</span></p>
          ) : (
            <p className="text-xs text-gray-500">Not connected</p>
          )}
          {isAccredited && <p className="text-xs text-blue-600 font-medium">Accredited Business</p>}
        </div>
        <button className="text-blue-600 hover:text-blue-700">
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold" style={{ background: 'linear-gradient(45deg, #4285F4, #EA4335, #FBBC05, #34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Google Business</p>
          {googleRating ? (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">{googleRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Not connected</p>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
