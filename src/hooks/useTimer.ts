import { useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds: number = 600) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      // 🧽 Siempre limpiar antes de crear uno nuevo
      if (intervalRef.current) clearInterval(intervalRef.current)

      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => Math.max(prev - 1, 0))
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  const toggle = () => setRunning(prev => !prev)

  const reset = (to: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setSeconds(to)
    setRunning(false)
  }

  const addSeconds = (n: number) => setSeconds((s) => Math.max(s + n, 0))

  return { seconds, running, toggle, reset, addSeconds }
}
