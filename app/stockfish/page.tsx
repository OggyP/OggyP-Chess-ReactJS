'use client'

import dynamic from 'next/dynamic'
import LoadingPage from '@/src/views/loading'

const VersusStockfish = dynamic(() => import('@/src/views/stockfish'), {
  ssr: false,
  loading: () => <LoadingPage description="Loading" />,
})

export default function StockfishRoute() {
  return <VersusStockfish />
}
