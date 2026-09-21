'use client'

import dynamic from 'next/dynamic'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import LoadingPage from '@/src/views/loading'

const ViewGame = dynamic(() => import('@/src/views/viewGame'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

function ViewGameInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  return <ViewGame gameId={id} viewAs={searchParams.get('viewAs')} />
}

export default function ViewGameRoute() {
  return (
    <Suspense fallback={<LoadingPage description="Loading" />}>
      <ViewGameInner />
    </Suspense>
  )
}
