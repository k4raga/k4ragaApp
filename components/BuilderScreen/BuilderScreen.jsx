'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { BUILDER_COPY } from '@/lib/copy'
import { SESSION_PRESET_MINUTES, TRAINING_BLOCKS, getBlockFocuses } from '@/lib/training-data'
import {
  addSessionItem,
  applyDurationPreset,
  buildSessionBlocks,
  duplicateSessionItem,
  moveSessionItem,
  readTrainingState,
  removeSessionItem,
  reorderSessionItems,
  rerollTrainingState,
  toggleBlockFocusSelection,
  toggleBlockFocusGroupSelection,
  toggleSessionItemFocusGroupSelection,
  toggleSessionItemFocusSelection,
  writeTrainingState
} from '@/lib/training-state'
import styles from './BuilderScreen.module.css'

const SESSION_REMOVE_ANIMATION_MS = 320
const SESSION_CLEAR_STAGGER_MS = 90
const CARD_SEND_ANIMATION_MS = 420

function formatPreset(minutes) {
  if (minutes < 60) {
    return `${minutes} мин`
  }

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (remainder === 0) {
    return `${hours} ч`
  }

  return `${hours} ч ${remainder} мин`
}

function getFocusGroups(block) {
  if (block.focusGroups) {
    return block.focusGroups
  }

  return [
    {
      label: null,
      items: getBlockFocuses(block)
    }
  ]
}

function DragLabel() {
  return (
    <div className={styles.dragHandle} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

function TrainingTypeCard({
  block,
  selectedFocuses,
  action,
  dragProps,
  hint,
  titleSuffix = null,
  onToggleFocus,
  onToggleFocusGroup,
  onCardClick,
  onCardDoubleClick,
  compact = false,
  isDragging = false,
  isSending = false
}) {
  return (
    <article
      className={`${styles.card} ${onCardClick || onCardDoubleClick ? styles.cardInteractive : ''} ${compact ? styles.cardCompact : ''} ${isDragging ? styles.cardDragging : ''} ${isSending ? styles.cardSending : ''}`}
      onClick={onCardClick}
      onDoubleClick={onCardDoubleClick}
      {...dragProps}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardHead}>
          <DragLabel />
          <div>
            <div className={styles.cardTitle}>
              {block.num}. {block.name}
              {titleSuffix && <span className={styles.cardTitleSuffix}>{titleSuffix}</span>}
            </div>
            <div className={styles.cardMetaLine}>{block.duration}</div>
          </div>
        </div>
        {action && (
          <div onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
            {action}
          </div>
        )}
      </div>

      <div className={styles.focusGroups}>
        {getFocusGroups(block).map((group) => {
          const selectedInGroup = group.items.filter((focus) => selectedFocuses.includes(focus)).length
          const groupIsActive = selectedInGroup === group.items.length
          const groupIsPartial = !groupIsActive && group.items.some((focus) => selectedFocuses.includes(focus))
          const canToggleGroup = Boolean(group.label && onToggleFocusGroup)

          return (
            <div
              key={group.label || block.id}
              className={`${styles.focusGroup} ${canToggleGroup ? styles.focusGroupInteractive : ''} ${groupIsActive ? styles.focusGroupActive : ''} ${groupIsPartial ? styles.focusGroupPartial : ''}`}
              onClick={canToggleGroup
                ? (event) => {
                    event.stopPropagation()
                    onToggleFocusGroup(group.items)
                  }
                : undefined}
              onDoubleClick={canToggleGroup ? (event) => event.stopPropagation() : undefined}
            >
              {group.label && (
                <button
                  type="button"
                  className={styles.focusGroupToggle}
                  onClick={(event) => {
                    event.stopPropagation()
                    onToggleFocusGroup?.(group.items)
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                >
                  <span className={styles.focusGroupName}>{group.label}</span>
                  <span className={styles.focusGroupRule} />
                  <span className={styles.focusGroupCount}>{selectedInGroup}/{group.items.length}</span>
                </button>
              )}
              <div className={styles.tagList}>
                {group.items.map((focus) => {
                  const active = selectedFocuses.includes(focus)

                  return (
                    <button
                      key={focus}
                      type="button"
                      className={`${styles.tag} ${active ? styles.tagActive : ''}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleFocus(focus)
                      }}
                      onDoubleClick={(event) => event.stopPropagation()}
                    >
                      {focus}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default function BuilderScreen() {
  const [trainingState, setTrainingState] = useState({
    targetMinutes: 150,
    sessionItems: [],
    blockFocusSelections: {},
    checked: {}
  })
  const [hydrated, setHydrated] = useState(false)
  const [draggedBlockId, setDraggedBlockId] = useState(null)
  const [draggedSessionId, setDraggedSessionId] = useState(null)
  const [sendingBlockIds, setSendingBlockIds] = useState([])
  const [removingSessionIds, setRemovingSessionIds] = useState([])
  const dragPreviewRef = useRef(null)
  const sendTimersRef = useRef(new Map())
  const removeTimersRef = useRef(new Map())

  useEffect(() => {
    setTrainingState(readTrainingState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeTrainingState(trainingState)
  }, [trainingState, hydrated])

  useEffect(() => () => {
    sendTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    sendTimersRef.current.clear()
    removeTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    removeTimersRef.current.clear()
  }, [])

  const sessionBlocks = useMemo(() => buildSessionBlocks(trainingState), [trainingState])
  const totalMinutes = sessionBlocks.reduce((sum, item) => sum + item.durationMinutes, 0)
  const remainingMinutes = trainingState.targetMinutes - totalMinutes

  function clearDragPreview() {
    if (dragPreviewRef.current) {
      dragPreviewRef.current.remove()
      dragPreviewRef.current = null
    }
  }

  function attachDragPreview(event) {
    clearDragPreview()

    const source = event.currentTarget
    const preview = source.cloneNode(true)
    preview.style.position = 'fixed'
    preview.style.top = '-1000px'
    preview.style.left = '-1000px'
    preview.style.width = `${source.getBoundingClientRect().width}px`
    preview.style.pointerEvents = 'none'
    preview.style.transform = 'rotate(2deg) scale(1.02)'
    preview.style.opacity = '0.96'
    preview.style.boxShadow = '0 22px 48px rgba(0, 0, 0, 0.38)'
    preview.style.borderColor = 'rgba(212, 0, 0, 0.45)'
    preview.style.background = 'rgba(16, 16, 20, 0.96)'
    preview.style.zIndex = '9999'
    document.body.appendChild(preview)
    dragPreviewRef.current = preview

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setDragImage(preview, 36, 24)
    }
  }

  function handlePresetChange(minutes) {
    setTrainingState((current) => applyDurationPreset(current, minutes))
  }

  function handleAddBlock(blockId) {
    setTrainingState((current) => addSessionItem(current, blockId))
  }

  function triggerBlockSendAnimation(blockId) {
    const activeTimer = sendTimersRef.current.get(blockId)
    if (activeTimer) {
      window.clearTimeout(activeTimer)
      sendTimersRef.current.delete(blockId)
    }

    setSendingBlockIds((current) => current.filter((id) => id !== blockId))

    window.requestAnimationFrame(() => {
      setSendingBlockIds((current) => (
        current.includes(blockId) ? current : [...current, blockId]
      ))

      const timer = window.setTimeout(() => {
        setSendingBlockIds((current) => current.filter((id) => id !== blockId))
        sendTimersRef.current.delete(blockId)
      }, CARD_SEND_ANIMATION_MS)

      sendTimersRef.current.set(blockId, timer)
    })
  }

  function handleAddBlockClick(blockId) {
    triggerBlockSendAnimation(blockId)
    handleAddBlock(blockId)
  }

  function handleRefresh() {
    setTrainingState((current) => rerollTrainingState(current))
  }

  function handleRemoveSessionItem(instanceId) {
    if (!instanceId || removeTimersRef.current.has(instanceId)) return

    setRemovingSessionIds((current) => (
      current.includes(instanceId) ? current : [...current, instanceId]
    ))

    const timer = window.setTimeout(() => {
      setTrainingState((current) => removeSessionItem(current, instanceId))
      setRemovingSessionIds((current) => current.filter((id) => id !== instanceId))
      removeTimersRef.current.delete(instanceId)
    }, SESSION_REMOVE_ANIMATION_MS)

    removeTimersRef.current.set(instanceId, timer)
  }

  function handleClearSession() {
    sessionBlocks.forEach((item, index) => {
      const delayKey = `clear-${item.instanceId}`
      if (removeTimersRef.current.has(item.instanceId) || removeTimersRef.current.has(delayKey)) return

      const timer = window.setTimeout(() => {
        removeTimersRef.current.delete(delayKey)
        handleRemoveSessionItem(item.instanceId)
      }, index * SESSION_CLEAR_STAGGER_MS)

      removeTimersRef.current.set(delayKey, timer)
    })
  }

  function handleDropOnSession() {
    if (!draggedBlockId) return
    handleAddBlock(draggedBlockId)
    setDraggedBlockId(null)
    clearDragPreview()
  }

  function handleDropOnCard(targetId) {
    if (!draggedSessionId) return
    setTrainingState((current) => reorderSessionItems(current, draggedSessionId, targetId))
    setDraggedSessionId(null)
    clearDragPreview()
  }

  function handleDropOnTrash() {
    if (!draggedSessionId) return
    handleRemoveSessionItem(draggedSessionId)
    setDraggedSessionId(null)
    clearDragPreview()
  }

  function handleBlockDragStart(event, blockId) {
    setDraggedBlockId(blockId)
    attachDragPreview(event)
  }

  function handleSessionDragStart(event, instanceId) {
    setDraggedSessionId(instanceId)
    attachDragPreview(event)
  }

  function handleDragEnd() {
    setDraggedBlockId(null)
    setDraggedSessionId(null)
    clearDragPreview()
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>{BUILDER_COPY.title}</h1>
        <p>{BUILDER_COPY.description}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={handleRefresh}>{BUILDER_COPY.refresh}</button>
          <Link href="/training" className={styles.secondary}>{BUILDER_COPY.openTraining}</Link>
        </div>
      </section>

      <section className={styles.topRow}>
        <div className={styles.summaryPanel}>
          <div className={styles.summaryItem}>
            <span>{BUILDER_COPY.activeBlocks}</span>
            <strong>{sessionBlocks.length}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{BUILDER_COPY.totalDuration}</span>
            <strong>{totalMinutes} {BUILDER_COPY.minutes}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{BUILDER_COPY.target}</span>
            <strong>{trainingState.targetMinutes} {BUILDER_COPY.minutes}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{BUILDER_COPY.ready}</span>
            <strong>{remainingMinutes === 0 ? 'OK' : `${remainingMinutes > 0 ? '+' : ''}${remainingMinutes} мин`}</strong>
          </div>
        </div>

        <div className={styles.presetPanel}>
          <div className={styles.presetTitle}>{BUILDER_COPY.targetLabel}</div>
          <div className={styles.presetList}>
            {SESSION_PRESET_MINUTES.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={`${styles.preset} ${trainingState.targetMinutes === minutes ? styles.presetActive : ''}`}
                onClick={() => handlePresetChange(minutes)}
              >
                {formatPreset(minutes)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.columns}>
        <div className={styles.column}>
          <div className={`${styles.board} ${styles.libraryBoard}`}>
            <div className={styles.columnHead}>
              <div>
                <div className={styles.columnKicker}>{BUILDER_COPY.libraryMeta}</div>
                <h2>{BUILDER_COPY.libraryTitle}</h2>
              </div>
            </div>

            <div className={styles.libraryList}>
              {TRAINING_BLOCKS.map((block) => {
                const selectedFocuses = trainingState.blockFocusSelections?.[block.id] || getBlockFocuses(block)

                return (
                  <TrainingTypeCard
                    key={block.id}
                    block={block}
                    selectedFocuses={selectedFocuses}
                    action={null}
                    dragProps={{
                      draggable: true,
                      onDragStart: (event) => handleBlockDragStart(event, block.id),
                      onDragEnd: handleDragEnd
                    }}
                    isDragging={draggedBlockId === block.id}
                    isSending={sendingBlockIds.includes(block.id)}
                    onCardClick={() => handleAddBlockClick(block.id)}
                    onToggleFocus={(focus) => setTrainingState((current) => toggleBlockFocusSelection(current, block.id, focus))}
                    onToggleFocusGroup={(focuses) => setTrainingState((current) => toggleBlockFocusGroupSelection(current, block.id, focuses))}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div
            className={`${styles.board} ${styles.sessionBoard} ${draggedBlockId ? styles.boardActive : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropOnSession}
          >
            <div className={styles.columnHead}>
              <div>
                <div className={styles.columnKicker}>{formatPreset(trainingState.targetMinutes)}</div>
                <h2>{BUILDER_COPY.sessionTitle}</h2>
              </div>
              {sessionBlocks.length > 0 && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearSession}
                >
                  {BUILDER_COPY.clear}
                </button>
              )}
            </div>

            {sessionBlocks.length === 0 && (
              <div className={styles.sessionEmpty}>{BUILDER_COPY.sessionEmpty}</div>
            )}

            <div className={styles.sessionList}>
              {sessionBlocks.map((item, index) => {
                const isRemoving = removingSessionIds.includes(item.instanceId)

                return (
                  <div
                    key={item.instanceId}
                    className={`${styles.sessionItem} ${isRemoving ? styles.sessionItemRemoving : ''}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropOnCard(item.instanceId)}
                  >
                    <TrainingTypeCard
                      block={item.block}
                      selectedFocuses={item.allowedFocuses}
                      titleSuffix={`#${String(index + 1).padStart(2, '0')}`}
                      compact
                      action={(
                        <div className={styles.sessionTools}>
                          <button type="button" className={styles.toolButton} onClick={() => setTrainingState((current) => moveSessionItem(current, item.instanceId, 'up'))}>{BUILDER_COPY.moveUp}</button>
                          <button type="button" className={styles.toolButton} onClick={() => setTrainingState((current) => moveSessionItem(current, item.instanceId, 'down'))}>{BUILDER_COPY.moveDown}</button>
                          <button type="button" className={styles.toolButton} onClick={() => setTrainingState((current) => duplicateSessionItem(current, item.instanceId))}>{BUILDER_COPY.duplicate}</button>
                          <button type="button" className={styles.toolButtonDanger} onClick={() => handleRemoveSessionItem(item.instanceId)}>{BUILDER_COPY.remove}</button>
                        </div>
                      )}
                      dragProps={{
                        draggable: !isRemoving,
                        onDragStart: (event) => handleSessionDragStart(event, item.instanceId),
                        onDragEnd: handleDragEnd
                      }}
                      isDragging={draggedSessionId === item.instanceId}
                      onCardDoubleClick={() => handleRemoveSessionItem(item.instanceId)}
                      onToggleFocus={(focus) => setTrainingState((current) => toggleSessionItemFocusSelection(current, item.instanceId, focus))}
                      onToggleFocusGroup={(focuses) => setTrainingState((current) => toggleSessionItemFocusGroupSelection(current, item.instanceId, focuses))}
                    />
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </section>

      {draggedSessionId && (
        <div
          className={`${styles.floatingTrash} ${styles.floatingTrashActive}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropOnTrash}
        >
          <div className={styles.trashIcon}>🗑</div>
          <div className={styles.trashTitle}>Корзина</div>
          <div className={styles.trashText}>Перетащи сюда карточку из плана, чтобы удалить ее из сессии.</div>
        </div>
      )}
    </main>
  )
}
