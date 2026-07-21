import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target)
  const prevTarget = useRef(target)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = prevTarget.current
    const to = target

    if (prefersReduced || document.hidden || from === to) {
      setValue(to)
      prevTarget.current = to
      return
    }

    const start = performance.now()
    let frame: number

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(from + (to - from) * eased)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        prevTarget.current = to
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
