'use client'

import dynamic from 'next/dynamic'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import LoadingPage from '@/src/views/loading'

const AnalysisPage = dynamic(() => import('@/src/views/analysis'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

function AnalysisInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const mode = params.mode as string

  return (
    <AnalysisPage
      mode={mode}
      pgn={searchParams.get('pgn')}
      fen={searchParams.get('fen')}
    />
  )
}

export default function AnalysisRoute() {
  return (
    <Suspense fallback={<LoadingPage description="Loading" />}>
      <AnalysisInner />
    </Suspense>
  )
}
