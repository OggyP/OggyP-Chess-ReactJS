'use client'

import dynamic from 'next/dynamic'
import LoadingPage from '@/src/views/loading'

const Register = dynamic(() => import('@/src/views/register'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

export default function RegisterRoute() {
  return <Register />
}
