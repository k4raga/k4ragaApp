'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Popup from '@/components/Popup/Popup'
import { TRAINING_COPY } from '@/lib/copy'
import { buildSessionBlocks, readTrainingState, rerollTrainingState, setSessionItemCheck, toggleSessionItemCheck, writeTrainingState } from '@/lib/training-state'
import './page.css'

const ICONS = [
  <svg key="1" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><line x1="16" y1="2" x2="16" y2="12"/><line x1="16" y1="20" x2="16" y2="30"/><line x1="2" y1="16" x2="12" y2="16"/><line x1="20" y1="16" x2="30" y2="16"/><rect x="12" y="12" width="8" height="8"/></svg>,
  <svg key="2" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><rect x="5" y="5" width="22" height="22"/><line x1="12" y1="11" x2="12" y2="21"/><line x1="20" y1="11" x2="20" y2="21"/></svg>,
  <svg key="3" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><path d="M4 12h18l2 2v4h-6v6h-4v-6H4z"/><line x1="8" y1="12" x2="8" y2="8"/><rect x="22" y="10" width="6" height="4"/></svg>,
  <svg key="4" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><path d="M4 24l6-4 6 2 6-6 6 2"/><circle cx="8" cy="8" r="2" fill="#D40000"/><circle cx="14" cy="6" r="1.5" fill="#D40000"/><circle cx="11" cy="11" r="1.5" fill="#D40000"/><circle cx="16" cy="12" r="2" fill="#D40000"/><circle cx="20" cy="9" r="1" fill="#D40000"/></svg>,
  <svg key="5" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><circle cx="16" cy="16" r="11"/><line x1="16" y1="1" x2="16" y2="10"/><line x1="16" y1="22" x2="16" y2="31"/><line x1="1" y1="16" x2="10" y2="16"/><line x1="22" y1="16" x2="31" y2="16"/></svg>,
  <svg key="6" viewBox="0 0 32 32" fill="none" stroke="#D40000" strokeWidth="2" strokeLinecap="square"><rect x="2" y="8" width="28" height="16" rx="3"/><rect x="8" y="13" width="6" height="6"/><circle cx="22" cy="14" r="1.5" fill="#D40000"/><circle cx="22" cy="19" r="1.5" fill="#D40000"/><circle cx="19" cy="16.5" r="1.5" fill="#D40000"/><circle cx="25" cy="16.5" r="1.5" fill="#D40000"/></svg>
]

export default function TrainingPage() {
  const [trainingState, setTrainingState] = useState({
    targetMinutes: 150,
    sessionItems: [],
    checked: {}
  })
  const [popup, setPopup] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTrainingState(readTrainingState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeTrainingState(trainingState)
  }, [trainingState, hydrated])

  const activeBlocks = useMemo(() => buildSessionBlocks(trainingState), [trainingState])
  const done = useMemo(
    () => activeBlocks.filter((block) => trainingState.checked[block.instanceId]).length,
    [activeBlocks, trainingState]
  )
  const total = activeBlocks.length
  const complete = done === total

  useEffect(() => {
    if (complete && hydrated && total > 0) {
      setPopup(true)
    }
  }, [complete, hydrated, total])

  function toggleBlockCheck(instanceId) {
    setTrainingState((current) => toggleSessionItemCheck(current, instanceId))
  }

  function uncheckBlock(instanceId) {
    setTrainingState((current) => setSessionItemCheck(current, instanceId, false))
  }

  function refreshTraining() {
    setTrainingState((current) => rerollTrainingState(current))
    setPopup(false)
  }

  return (
    <main className="training-page">
      <section className="training-header">
        <div className="training-kicker">{TRAINING_COPY.kicker}</div>
        <h1>{TRAINING_COPY.title}</h1>
        <p>{TRAINING_COPY.description}</p>
        <div className="training-progress-wrap">
          <div className="training-progress-bar" style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }} />
        </div>
        <div className="training-progress-text">{done} / {total}</div>
      </section>

      <section className="training-actions">
        <button type="button" className="training-reset" onClick={refreshTraining}>{TRAINING_COPY.refresh}</button>
        <Link href="/builder" className="training-reset training-secondary-link">{TRAINING_COPY.builder}</Link>
        <Link href="/" className="training-back">{TRAINING_COPY.home}</Link>
      </section>

      <section className="training-list">
        {activeBlocks.map((task, index) => (
          <label
            key={task.instanceId}
            className={'training-task' + (trainingState.checked[task.instanceId] ? ' done' : '')}
            onClick={() => toggleBlockCheck(task.instanceId)}
            onDoubleClick={() => uncheckBlock(task.instanceId)}
          >
            <div className="training-task-number">
              {trainingState.checked[task.instanceId] ? null : <span>{String(index + 1).padStart(2, '0')}</span>}
            </div>
            <div className="training-task-info">
              <div className="training-task-name">{task.focus}</div>
              <div className="training-task-type">{task.block.name}</div>
              <div className="training-task-duration">{task.durationMinutes} мин</div>
              <div className="training-task-summary">{task.block.summary}</div>
            </div>
            <div className="training-task-icon">{ICONS[(task.block.id - 1) % ICONS.length]}</div>
          </label>
        ))}

        {activeBlocks.length === 0 && (
          <div className="training-empty">
            {TRAINING_COPY.empty}
          </div>
        )}
      </section>

      {complete && total > 0 && (
        <section className="training-banner">
          <div className="training-banner-icon">★</div>
          <h2>{TRAINING_COPY.completeTitle}</h2>
          <p>{TRAINING_COPY.completeText}</p>
        </section>
      )}

      <Popup
        show={popup}
        icon="⭐"
        title={TRAINING_COPY.popupTitle}
        desc={<>{TRAINING_COPY.popupText} —<br />{TRAINING_COPY.popupText2}</>}
        onClose={() => setPopup(false)}
      />
    </main>
  )
}
