'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ErrorPage from '@/src/views/Error'
import LoadingPage from '@/src/views/loading'

function ErrorInner() {
  const searchParams = useSearchParams()
  return (
    <ErrorPage
      title={searchParams.get('title') || 'Unknown Error'}
      description={searchParams.get('desc') || ''}
    />
  )
}

export default function ErrorRoute() {
  return (
    <Suspense fallback={<LoadingPage description="Loading" />}>
      <ErrorInner />
    </Suspense>
  )
}
