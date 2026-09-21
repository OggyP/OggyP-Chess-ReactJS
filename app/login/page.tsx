'use client'

import dynamic from 'next/dynamic'
import LoadingPage from '@/src/views/loading'

const Login = dynamic(() => import('@/src/views/login'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

export default function LoginRoute() {
  return <Login />
}
