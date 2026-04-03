'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Popup from '@/components/Popup/Popup'
import './page.css'

const STORAGE_KEY = 'k4raga-cs-training-v1'

const EXERCISES = [
  { id: 1, num: '01', name: 'Аим', hints: ['Постановка прицела', 'Хедшоты', 'Флик-шоты'] },
  { id: 2, num: '02', name: 'Мувмент', hints: ['Контрастрейф', 'Спрей в движении', 'Пик угла'] },
  { id: 3, num: '03', name: 'Пистолеты', hints: ['Deagle', 'P250 / P2000', 'USP-S / Dual Berettas'] },
  { id: 4, num: '04', name: 'Автоматы', hints: ['MP7 / MP9', 'MAC-10', 'Galil AR / FAMAS'] },
  { id: 5, num: '05', name: 'Снайпинг', hints: ['AWP', 'SSG 08', 'Флик-шоты'] },
  { id: 6, num: '06', name: 'Чиловая катка', hints: ['Deathmatch', 'Casual', 'Arms Race'] }
]

const ICONS = [
  <svg key="1" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><line x1="16" y1="2" x2="16" y2="12"/><line x1="16" y1="20" x2="16" y2="30"/><line x1="2" y1="16" x2="12" y2="16"/><line x1="20" y1="16" x2="30" y2="16"/><rect x="12" y="12" width="8" height="8"/></svg>,
  <svg key="2" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><rect x="5" y="5" width="22" height="22"/><line x1="12" y1="11" x2="12" y2="21"/><line x1="20" y1="11" x2="20" y2="21"/></svg>,
  <svg key="3" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><path d="M4 12h18l2 2v4h-6v6h-4v-6H4z"/><line x1="8" y1="12" x2="8" y2="8"/><rect x="22" y="10" width="6" height="4"/></svg>,
  <svg key="4" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><path d="M4 24l6-4 6 2 6-6 6 2"/><circle cx="8" cy="8" r="2" fill="#D40000"/><circle cx="14" cy="6" r="1.5" fill="#D40000"/><circle cx="11" cy="11" r="1.5" fill="#D40000"/><circle cx="16" cy="12" r="2" fill="#D40000"/><circle cx="20" cy="9" r="1" fill="#D40000"/></svg>,
  <svg key="5" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><circle cx="16" cy="16" r="11"/><line x1="16" y1="1" x2="16" y2="10"/><line x1="16" y1="22" x2="16" y2="31"/><line x1="1" y1="16" x2="10" y2="16"/><line x1="22" y1="16" x2="31" y2="16"/></svg>,
  <svg key="6" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><rect x="2" y="8" width="28" height="16" rx="3"/><rect x="8" y="13" width="6" height="6"/><circle cx="22" cy="14" r="1.5" fill="#D40000"/><circle cx="22" cy="19" r="1.5" fill="#D40000"/><circle cx="19" cy="16.5" r="1.5" fill="#D40000"/><circle cx="25" cy="16.5" r="1.5" fill="#D40000"/></svg>
]

function pickRandomHints() {
  return EXERCISES.map((exercise) => {
    const index = Math.floor(Math.random() * exercise.hints.length)
    return exercise.hints[index]
  })
}

function readState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export default function TrainingPage() {
  const [checked, setChecked] = useState(EXERCISES.map(() => false))
  const [selected, setSelected] = useState(() => pickRandomHints())
  const [popup, setPopup] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = readState()
    if (saved?.checked?.length === EXERCISES.length) {
      setChecked(saved.checked)
    }
    if (saved?.selected?.length === EXERCISES.length) {
      setSelected(saved.selected)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeState({ checked, selected })
  }, [checked, selected, hydrated])

  const done = useMemo(() => checked.filter(Boolean).length, [checked])
  const total = EXERCISES.length
  const complete = done === total

  useEffect(() => {
    if (complete && hydrated) {
      setPopup(true)
    }
  }, [complete, hydrated])

  function toggle(index) {
    setChecked((current) => current.map((value, i) => (i === index ? !value : value)))
  }

  function resetTraining() {
    setChecked(EXERCISES.map(() => false))
    setSelected(pickRandomHints())
    setPopup(false)
  }

  return (
    <main className="training-page">
      <section className="training-header">
        <div className="training-kicker">DETAILED MODE</div>
        <h1>CS Тренировка</h1>
        <p>
          Одна страница, один проход, шесть блоков.
          Отмечай выполнение и держи рабочую форму перед матчами.
        </p>
        <div className="training-progress-wrap">
          <div className="training-progress-bar" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <div className="training-progress-text">{done} / {total}</div>
      </section>

      <section className="training-list">
        {EXERCISES.map((task, index) => (
          <label key={task.id} className={'training-task' + (checked[index] ? ' done' : '')} onClick={() => toggle(index)}>
            <div className="training-task-number">
              {checked[index] ? null : <span>{task.num}</span>}
            </div>
            <div className="training-task-info">
              <div className="training-task-name">{task.name}</div>
              <div className="training-task-selected">{selected[index]}</div>
            </div>
            <div className="training-task-icon">{ICONS[index]}</div>
          </label>
        ))}
      </section>

      {complete && (
        <section className="training-banner">
          <div className="training-banner-icon">★</div>
          <h2>GG WP</h2>
          <p>Сетка закрыта. Можно идти в катку или в стрим уже без раскачки.</p>
        </section>
      )}

      <section className="training-actions">
        <button type="button" className="training-reset" onClick={resetTraining}>Сбросить тренировку</button>
        <Link href="/" className="training-back">На главную</Link>
      </section>

      <Popup
        show={popup}
        icon="⭐"
        title="GG WP!"
        desc={<>CS тренировка завершена —<br />можно возвращаться на главную</>}
        onClose={() => setPopup(false)}
      />
    </main>
  )
}
