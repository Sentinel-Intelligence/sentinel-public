'use client'

import { Suspense, lazy } from 'react'

const WeatherMap = lazy(() => import('./WeatherMapClient'))

function MapSkeleton() {
  return (
    <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-48 animate-pulse" />
          <div className="h-5 bg-gray-800 rounded w-56 animate-pulse" />
          <div className="h-3 bg-gray-800 rounded w-72 animate-pulse" />
        </div>
      </div>
      <div className="h-[420px] relative overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-600 text-xs font-mono tracking-widest animate-pulse">
            Loading influence map…
          </span>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-800 space-y-3">
        <div className="h-2 bg-gray-800 rounded animate-pulse w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function InfluenceMap() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <WeatherMap />
    </Suspense>
  )
}
