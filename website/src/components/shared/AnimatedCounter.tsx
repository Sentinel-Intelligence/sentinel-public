'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, duration = 2200) {
  const [count, setCount] = useState(0)
  const rafRef   = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
      else setCount(target)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return count
}

export function AnimatedStat({ target, label }: { target: number; label: string }) {
  const count = useCountUp(target)
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
      <div className="text-3xl font-bold text-cyan-400 mb-2 tabular-nums">
        {count.toLocaleString()}
      </div>
      <div className="text-gray-400 text-sm tracking-wide">{label}</div>
    </div>
  )
}
