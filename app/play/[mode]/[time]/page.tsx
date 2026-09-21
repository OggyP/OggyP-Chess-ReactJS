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

function PlayInner() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string
  const time = params.time as string
  const match = time?.match(/^(\d+)\+(\d+)$/)

  useEffect(() => {
    if (!match) {
      router.replace('/home')
    }
  }, [match, router])

  if (!match) {
    return <LoadingPage description="Redirecting" />
  }

  const base = parseInt(match[1], 10)
  const increment = parseInt(match[2], 10)

  return (
    <NeedsLogin>
      <PlayGame mode={mode} base={base} increment={increment} />
    </NeedsLogin>
  )
}

export default function PlayRoute() {
  return <PlayInner />
}
