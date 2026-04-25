'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FACEIT_WATCH_COPY } from '@/lib/copy'
import styles from './FaceitWatchScreen.module.css'

const STORAGE_KEY = 'k4raga-faceit-watch-cache'

function formatFetchedAt(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default function FaceitWatchScreen() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState({})

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)

      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw)
      setData(parsed)
      const nextSelected = {}
      for (const player of parsed.players || []) {
        nextSelected[player.id] = true
      }
      setSelectedPlayers(nextSelected)
    } catch {
      // ignore broken cache
    }
  }, [])

  useEffect(() => {
    if (!data) {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore storage errors
    }
  }, [data])

  useEffect(() => {
    if (!data) {
      return
    }

    setSelectedPlayers((current) => {
      const next = { ...current }
      let changed = false

      for (const player of data.players) {
        if (!(player.id in next)) {
          next[player.id] = true
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [data])

  async function loadMatches() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/faceit-watch', { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`)
      }

      const payload = await response.json()
      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : FACEIT_WATCH_COPY.loadError)
    } finally {
      setLoading(false)
    }
  }

  function togglePlayer(playerId) {
    setSelectedPlayers((current) => ({
      ...current,
      [playerId]: !current[playerId]
    }))
  }

  const visibleMatches = useMemo(() => {
    if (!data) return []
    return data.matches.filter((match) => selectedPlayers[match.playerId] !== false)
  }, [data, selectedPlayers])

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.kicker}>{FACEIT_WATCH_COPY.kicker}</div>
        <h1>{FACEIT_WATCH_COPY.title}</h1>
        <p>{FACEIT_WATCH_COPY.description}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={loadMatches} disabled={loading}>
            {loading ? FACEIT_WATCH_COPY.loading : FACEIT_WATCH_COPY.refresh}
          </button>
          <Link href="/" className={styles.secondary}>{FACEIT_WATCH_COPY.home}</Link>
          <Link href="/training" className={styles.secondary}>{FACEIT_WATCH_COPY.training}</Link>
        </div>
        {data?.fetchedAt && <div className={styles.meta}>{FACEIT_WATCH_COPY.updated}: {formatFetchedAt(data.fetchedAt)}</div>}
      </section>

      {error && <section className={styles.error}>{FACEIT_WATCH_COPY.errorPrefix}: {error}</section>}

      {data && (
        <>
          <section className={styles.filters}>
            <div className={styles.filtersLabel}>{FACEIT_WATCH_COPY.filterLabel}</div>
            <div className={styles.filterList}>
              {data.players.map((player) => {
                const active = selectedPlayers[player.id] !== false
                return (
                  <button
                    key={player.id}
                    type="button"
                    className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
                    onClick={() => togglePlayer(player.id)}
                  >
                    {player.name}
                  </button>
                )
              })}
            </div>
          </section>

          <section className={styles.players}>
            {data.players.map((player) => (
              <article key={player.id} className={styles.playerCard}>
                <div className={styles.playerHead}>
                  <div>
                    <div className={styles.playerName}>{player.name}</div>
                    <div className={styles.playerNick}>{player.faceitNick}</div>
                  </div>
                  <a href={player.faceitProfileUrl} target="_blank" rel="noreferrer" className={styles.profileLink}>
                    FACEIT
                  </a>
                </div>
                <div className={styles.playerMeta}>
                  <span>{FACEIT_WATCH_COPY.matches}: {player.matches.length}</span>
                  {player.error ? <span className={styles.playerError}>{player.error}</span> : null}
                </div>
              </article>
            ))}
          </section>

          <section className={styles.matches}>
            {visibleMatches.length === 0 ? (
              <div className={styles.empty}>{FACEIT_WATCH_COPY.empty}</div>
            ) : (
              visibleMatches.map((match) => (
                <article key={`${match.playerId}-${match.playedAt}-${match.map}-${match.score}`} className={styles.matchCard}>
                  <div className={styles.matchTop}>
                    <div>
                      <div className={styles.matchPlayer}>{match.playerName}</div>
                      <div className={styles.matchDate}>{match.playedAt}</div>
                    </div>
                    <a
                      href={match.matchUrl || match.fallbackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.matchLink}
                    >
                      {match.matchUrl ? FACEIT_WATCH_COPY.matchLink : FACEIT_WATCH_COPY.profileLink}
                    </a>
                  </div>

                  <div className={styles.matchGrid}>
                    <div><span>{FACEIT_WATCH_COPY.map}</span><strong>{match.map}</strong></div>
                    <div><span>{FACEIT_WATCH_COPY.score}</span><strong>{match.score}</strong></div>
                    <div><span>{FACEIT_WATCH_COPY.kills}</span><strong>{match.kills}</strong></div>
                    <div><span>{FACEIT_WATCH_COPY.kda}</span><strong>{match.kdr || '—'}</strong></div>
                    <div className={styles.wide}><span>{FACEIT_WATCH_COPY.hub}</span><strong>{match.hub}</strong></div>
                    <div><span>{FACEIT_WATCH_COPY.elo}</span><strong>{match.elo || '—'}</strong></div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </main>
  )
}
