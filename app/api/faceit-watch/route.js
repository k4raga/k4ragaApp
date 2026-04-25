import { FACEIT_WATCH_PLAYERS } from '@/lib/faceit-watch-data'

const DAY_MS = 24 * 60 * 60 * 1000
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))
}

function parseDateString(value) {
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function extractCell(rowHtml, className) {
  const regex = new RegExp(`<td[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/td>`, 'i')
  const match = rowHtml.match(regex)
  return match ? match[1] : ''
}

function extractMatchLink(rowHtml) {
  const match = rowHtml.match(/href="(https:\/\/www\.faceit\.com\/en\/cs2\/room\/[^"]+)"/i)
  return match ? decodeHtml(match[1]) : null
}

function extractRows(html) {
  return [...html.matchAll(/<tr class="maps_tr[\s\S]*?<\/tr>/gi)].map((match) => match[0])
}

function parseMatchRow(rowHtml, player) {
  const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1])
  const dateText = stripTags(extractCell(rowHtml, 'col-date'))
  const playedAt = parseDateString(dateText)

  if (!playedAt || cells.length < 12) {
    return null
  }

  const hub = stripTags(cells[2] || '')
  const map = stripTags(cells[3] || '')
  const score = stripTags(cells[4] || '')
  const kills = stripTags(cells[5] || '')
  const assists = stripTags(cells[6] || '') || null
  const deaths = stripTags(cells[7] || '') || null
  const kdr = stripTags(cells[9] || '') || null
  const eloText = stripTags(cells[11] || '') || null
  const matchUrl = extractMatchLink(rowHtml)

  return {
    playerId: player.id,
    playerName: player.name,
    playerNick: player.faceitNick,
    playedAt: playedAt.toISOString().slice(0, 10),
    hub,
    map,
    score,
    kills,
    assists,
    deaths,
    kdr,
    elo: eloText,
    matchUrl,
    fallbackUrl: player.faceitProfileUrl
  }
}

function withinLastDays(matchDate, days) {
  const today = new Date()
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const matchUtc = Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate())
  const diffDays = Math.floor((todayUtc - matchUtc) / DAY_MS)
  return diffDays >= 0 && diffDays < days
}

async function fetchPlayerMatches(player) {
  const response = await fetch(player.faceitAnalyserMatchesUrl, {
    headers: {
      'user-agent': USER_AGENT,
      'accept-language': 'en-US,en;q=0.9'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Source returned ${response.status}`)
  }

  const html = await response.text()
  const rows = extractRows(html)
  const matches = rows
    .map((row) => parseMatchRow(row, player))
    .filter(Boolean)
    .filter((match) => {
      const date = parseDateString(match.playedAt)
      return date ? withinLastDays(date, 7) : false
    })

  return {
    ...player,
    matches
  }
}

export async function GET() {
  const settled = await Promise.allSettled(FACEIT_WATCH_PLAYERS.map((player) => fetchPlayerMatches(player)))

  const players = settled.map((result, index) => {
    const player = FACEIT_WATCH_PLAYERS[index]

    if (result.status === 'fulfilled') {
      return {
        id: result.value.id,
        name: result.value.name,
        faceitNick: result.value.faceitNick,
        faceitProfileUrl: result.value.faceitProfileUrl,
        sourceUrl: result.value.faceitAnalyserMatchesUrl,
        matches: result.value.matches,
        error: null
      }
    }

    return {
      id: player.id,
      name: player.name,
      faceitNick: player.faceitNick,
      faceitProfileUrl: player.faceitProfileUrl,
      sourceUrl: player.faceitAnalyserMatchesUrl,
      matches: [],
      error: result.reason instanceof Error ? result.reason.message : 'Unknown fetch error'
    }
  })

  const allMatches = players.flatMap((player) =>
    player.matches.map((match) => ({
      ...match,
      playerName: player.name,
      playerNick: player.faceitNick,
      fallbackUrl: player.faceitProfileUrl
    }))
  )

  allMatches.sort((a, b) => {
    if (a.playedAt === b.playedAt) {
      return a.playerName.localeCompare(b.playerName)
    }

    return a.playedAt < b.playedAt ? 1 : -1
  })

  return Response.json({
    fetchedAt: new Date().toISOString(),
    windowDays: 7,
    players,
    matches: allMatches
  })
}
