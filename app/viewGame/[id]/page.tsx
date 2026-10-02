import type { Metadata } from 'next'
import { gameModeToName } from '@/src/helpers/gameModes'
import ViewGameClient from './ViewGameClient'

type PageProps = {
  params: Promise<{ id: string }>
}

type GameViewData = {
  id: number
  gameMode: string
  white: string
  black: string
  winner: 'white' | 'black' | 'draw'
  gameOverReason: string
  openingName?: string | null
  openingECO?: string | null
  timeOption?: string | null
  whiteRating?: number | null
  blackRating?: number | null
}

function formatPlayerName(raw: string): string {
  const parts = raw.split('|')
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`
  return parts.slice(-1)[0] || raw
}

function formatPlayer(raw: string, rating?: number | null): string {
  const name = formatPlayerName(raw)
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    return `${name} (${Math.round(rating)})`
  }
  return name
}

function formatTimeControl(timeOption?: string | null): string | null {
  if (!timeOption) return null
  const [baseRaw, incrementRaw] = timeOption.split('+')
  const base = Number(baseRaw)
  if (!Number.isFinite(base)) return timeOption
  const minutes = base / 60
  const minutesLabel = Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1)
  return `${minutesLabel}+${incrementRaw ?? '0'}`
}

function formatOutcome(game: GameViewData): string {
  const reason = game.gameOverReason?.replace(/_/g, ' ') || 'unknown'
  if (game.winner === 'draw') {
    return `Draw by ${reason}`
  }
  const winnerName = formatPlayerName(game.winner === 'white' ? game.white : game.black)
  return `${winnerName} won by ${reason}`
}

async function fetchGame(id: string): Promise<GameViewData | null> {
  const apiURL = process.env.NEXT_PUBLIC_API
  if (!apiURL || !/^\d+$/.test(id)) return null

  try {
    const response = await fetch(`${apiURL}games/view/${id}`, {
      next: { revalidate: 3600 },
    })
    if (!response.ok) return null
    const data = await response.json()
    if (!data || typeof data !== 'object' || !data.white || !data.black) return null
    return data as GameViewData
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const game = await fetchGame(id)

  if (!game) {
    return {
      title: 'Game Not Found | OggyP Chess',
      description: 'This chess game could not be found on OggyP Chess.',
      openGraph: {
        title: 'Game Not Found | OggyP Chess',
        description: 'This chess game could not be found on OggyP Chess.',
        url: `/viewGame/${id}`,
        siteName: 'OggyP Chess',
        images: ['/logo512.png'],
        type: 'website',
      },
    }
  }

  const white = formatPlayer(game.white, game.whiteRating)
  const black = formatPlayer(game.black, game.blackRating)
  const title = `${white} vs ${black}`

  const details = [
    formatOutcome(game),
    gameModeToName.get(game.gameMode) ?? game.gameMode,
    formatTimeControl(game.timeOption),
    game.openingName
      ? (game.openingECO ? `${game.openingName} (${game.openingECO})` : game.openingName)
      : null,
  ].filter(Boolean)

  const description = details.join(' • ')

  return {
    title: `${title} | OggyP Chess`,
    description,
    openGraph: {
      title,
      description,
      url: `/viewGame/${id}`,
      siteName: 'OggyP Chess',
      images: ['/logo512.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/logo512.png'],
    },
  }
}

export default function ViewGameRoute() {
  return <ViewGameClient />
}
