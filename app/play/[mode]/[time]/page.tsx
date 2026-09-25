'use client'

import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import NeedsLogin from '@/src/helpers/verifyToken'
import LoadingPage from '@/src/views/loading'

const PlayGame = dynamic(() => import('@/src/views/play'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

/** Next may decode `180+0` as `180 0` because `+` means space in URLs. */
function parseTimeControl(raw: string | string[] | undefined): { base: number, increment: number } | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const normalized = decodeURIComponent(value).trim().replace(/\s+/g, '+')
  const match = normalized.match(/^(\d+)\+(\d+)$/)
  if (!match) return null
  return {
    base: parseInt(match[1], 10),
    increment: parseInt(match[2], 10),
  }
}

function PlayInner() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string
  const timeControl = parseTimeControl(params.time)

  useEffect(() => {
    if (!timeControl) {
      router.replace('/home')
    }
  }, [timeControl, router])

  if (!timeControl) {
    return <LoadingPage description="Redirecting" />
  }

  return (
    <NeedsLogin>
      <PlayGame mode={mode} base={timeControl.base} increment={timeControl.increment} />
    </NeedsLogin>
  )
}

export default function PlayRoute() {
  return <PlayInner />
}
