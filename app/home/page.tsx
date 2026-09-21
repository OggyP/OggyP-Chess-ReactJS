'use client'

import dynamic from 'next/dynamic'
import NeedsLogin from '@/src/helpers/verifyToken'
import LoadingPage from '@/src/views/loading'

const Home = dynamic(() => import('@/src/views/home'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

export default function HomeRoute() {
  return (
    <NeedsLogin>
      <Home userInfo={null as any} />
    </NeedsLogin>
  )
}
