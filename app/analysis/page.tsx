'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingPage from '@/src/views/loading'

export default function AnalysisIndexRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/analysis/standard')
  }, [router])
  return <LoadingPage description="Redirecting" />
}
