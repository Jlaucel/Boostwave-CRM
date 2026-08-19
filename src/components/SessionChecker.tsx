'use client'

import { useEffect } from 'react'
import { checkSessionAlive } from '@/app/actions/auth'

export function SessionChecker() {
  useEffect(() => {
    // Check session every 1 minute
    const interval = setInterval(async () => {
      try {
        const isAlive = await checkSessionAlive()
        if (!isAlive) {
          window.location.href = '/login'
        }
      } catch (error) {
        // Ignore network errors to prevent redirecting on flaky connections
        console.error('Failed to check session', error)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return null
}
