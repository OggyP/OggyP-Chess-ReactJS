'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import NeedsLogin from '@/src/helpers/verifyToken'
import LoadingPage from '@/src/views/loading'

const SpectateGame = dynamic(() => import('@/src/views/spectate'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

export default function SpectateRoute() {
  const params = useParams()
  const uuid = params.uuid as string

  return (
    <NeedsLogin>
      <SpectateGame gameId={uuid} />
    </NeedsLogin>
  )
}
