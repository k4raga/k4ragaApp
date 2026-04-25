'use client'

import {
  TRAINING_BLOCKS,
  SESSION_PRESET_MINUTES,
  TRAINING_STORAGE_KEY,
  createDefaultTrainingState,
  createPresetSession,
  createSessionItem,
  getBlockById,
  getBlockFocuses,
  pickRandomFocus,
  pickRandomFromFocuses
} from '@/lib/training-data'

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

function normalizeChecked(sessionItems, checked) {
  const normalized = {}

  for (const item of sessionItems) {
    normalized[item.instanceId] = Boolean(checked?.[item.instanceId])
  }

  return normalized
}

function normalizeSessionItems(sessionItems) {
  if (!Array.isArray(sessionItems)) return []

  return sessionItems
    .map((item) => {
      const block = getBlockById(item.blockId)
      if (!block) return null

      const allowedFocuses = Array.isArray(item.allowedFocuses) && item.allowedFocuses.length > 0
        ? item.allowedFocuses.filter((focus) => getBlockFocuses(block).includes(focus))
        : getBlockFocuses(block)

      return {
        instanceId: item.instanceId || createSessionItem(block).instanceId,
        blockId: block.id,
        allowedFocuses,
        focus: item.focus && allowedFocuses.includes(item.focus)
          ? item.focus
          : pickRandomFromFocuses(allowedFocuses) || pickRandomFocus(block.id),
        durationMinutes: item.durationMinutes || block.durationMinutes || 10
      }
    })
    .filter(Boolean)
}

function normalizeBlockFocusSelections(savedSelections) {
  return Object.fromEntries(
    TRAINING_BLOCKS.map((block) => {
      const availableFocuses = getBlockFocuses(block)
      const selectedFocuses = Array.isArray(savedSelections?.[block.id])
        ? savedSelections[block.id].filter((focus) => availableFocuses.includes(focus))
        : availableFocuses

      return [block.id, selectedFocuses.length > 0 ? selectedFocuses : availableFocuses]
    })
  )
}

function toggleFocusGroup(currentFocuses, groupFocuses, availableFocuses) {
  const normalizedFocuses = currentFocuses.filter((focus) => availableFocuses.includes(focus))
  const normalizedGroupFocuses = groupFocuses.filter((focus) => availableFocuses.includes(focus))

  if (normalizedGroupFocuses.length === 0) {
    return normalizedFocuses
  }

  const groupIsActive = normalizedGroupFocuses.every((focus) => normalizedFocuses.includes(focus))
  const nextFocusSet = groupIsActive
    ? new Set(normalizedFocuses.filter((focus) => !normalizedGroupFocuses.includes(focus)))
    : new Set([...normalizedFocuses, ...normalizedGroupFocuses])
  const nextFocuses = availableFocuses.filter((focus) => nextFocusSet.has(focus))

  return nextFocuses.length > 0 ? nextFocuses : normalizedFocuses
}

export function readTrainingState() {
  const storage = getStorage()
  if (!storage) return createDefaultTrainingState()

  try {
    const raw = storage.getItem(TRAINING_STORAGE_KEY)
    if (!raw) return createDefaultTrainingState()

    const saved = JSON.parse(raw)
    const sessionItems = normalizeSessionItems(saved?.sessionItems)
    const targetMinutes = SESSION_PRESET_MINUTES.includes(saved?.targetMinutes)
      ? saved.targetMinutes
      : 150

    if (sessionItems.length === 0) {
      return createDefaultTrainingState()
    }

    return {
      targetMinutes,
      sessionItems,
      blockFocusSelections: normalizeBlockFocusSelections(saved?.blockFocusSelections),
      checked: normalizeChecked(sessionItems, saved?.checked)
    }
  } catch {
    return createDefaultTrainingState()
  }
}

export function writeTrainingState(state) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state))
}

export function buildSessionBlocks(state) {
  return state.sessionItems
    .map((item) => {
      const block = getBlockById(item.blockId)
      if (!block) return null

      return {
        ...item,
        block
      }
    })
    .filter(Boolean)
}

export function resetTrainingChecks(state) {
  return {
    ...state,
    checked: Object.fromEntries(state.sessionItems.map((item) => [item.instanceId, false]))
  }
}

export function rerollTrainingState(state) {
  const sessionItems = state.sessionItems.map((item) => ({
    ...item,
    focus: pickRandomFromFocuses(item.allowedFocuses) || pickRandomFocus(item.blockId)
  }))

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, {})
  }
}

export function applyDurationPreset(state, targetMinutes) {
  const sessionItems = createPresetSession(targetMinutes, state.blockFocusSelections)

  return {
    ...state,
    targetMinutes,
    sessionItems,
    checked: normalizeChecked(sessionItems, {})
  }
}

export function addSessionItem(state, blockId) {
  const block = getBlockById(blockId)
  if (!block) return state

  const allowedFocuses = state.blockFocusSelections?.[blockId] || getBlockFocuses(block)
  const sessionItems = [createSessionItem(block, allowedFocuses), ...state.sessionItems]

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function removeSessionItem(state, instanceId) {
  const sessionItems = state.sessionItems.filter((item) => item.instanceId !== instanceId)

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function duplicateSessionItem(state, instanceId) {
  const index = state.sessionItems.findIndex((item) => item.instanceId === instanceId)
  if (index === -1) return state

  const source = state.sessionItems[index]
  const block = getBlockById(source.blockId)
  if (!block) return state

  const duplicate = createSessionItem(block, source.allowedFocuses)
  const sessionItems = [...state.sessionItems]
  sessionItems.splice(index + 1, 0, duplicate)

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function moveSessionItem(state, instanceId, direction) {
  const index = state.sessionItems.findIndex((item) => item.instanceId === instanceId)
  if (index === -1) return state

  const nextIndex = direction === 'up' ? index - 1 : index + 1
  if (nextIndex < 0 || nextIndex >= state.sessionItems.length) return state

  const sessionItems = [...state.sessionItems]
  const [item] = sessionItems.splice(index, 1)
  sessionItems.splice(nextIndex, 0, item)

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function reorderSessionItems(state, draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return state

  const draggedIndex = state.sessionItems.findIndex((item) => item.instanceId === draggedId)
  const targetIndex = state.sessionItems.findIndex((item) => item.instanceId === targetId)

  if (draggedIndex === -1 || targetIndex === -1) return state

  const sessionItems = [...state.sessionItems]
  const [draggedItem] = sessionItems.splice(draggedIndex, 1)
  sessionItems.splice(targetIndex, 0, draggedItem)

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function toggleBlockFocusSelection(state, blockId, focus) {
  const block = getBlockById(blockId)
  if (!block) return state

  const currentFocuses = state.blockFocusSelections?.[blockId] || getBlockFocuses(block)
  const hasFocus = currentFocuses.includes(focus)
  const nextFocuses = hasFocus
    ? currentFocuses.filter((item) => item !== focus)
    : [...currentFocuses, focus]

  if (nextFocuses.length === 0) {
    return state
  }

  return {
    ...state,
    blockFocusSelections: {
      ...state.blockFocusSelections,
      [blockId]: nextFocuses
    }
  }
}

export function toggleBlockFocusGroupSelection(state, blockId, focuses) {
  const block = getBlockById(blockId)
  if (!block) return state

  const availableFocuses = getBlockFocuses(block)
  const currentFocuses = state.blockFocusSelections?.[blockId] || availableFocuses
  const nextFocuses = toggleFocusGroup(currentFocuses, focuses, availableFocuses)

  return {
    ...state,
    blockFocusSelections: {
      ...state.blockFocusSelections,
      [blockId]: nextFocuses
    }
  }
}

export function toggleSessionItemFocusSelection(state, instanceId, focus) {
  const sessionItems = state.sessionItems.map((item) => {
    if (item.instanceId !== instanceId) {
      return item
    }

    const block = getBlockById(item.blockId)
    if (!block) return item

    const availableFocuses = getBlockFocuses(block)
    const currentFocuses = Array.isArray(item.allowedFocuses) && item.allowedFocuses.length > 0
      ? item.allowedFocuses
      : availableFocuses
    const hasFocus = currentFocuses.includes(focus)
    const nextFocuses = hasFocus
      ? currentFocuses.filter((entry) => entry !== focus)
      : [...currentFocuses, focus]

    if (nextFocuses.length === 0) {
      return item
    }

    return {
      ...item,
      allowedFocuses: nextFocuses,
      focus: nextFocuses.includes(item.focus)
        ? item.focus
        : pickRandomFromFocuses(nextFocuses) || item.focus
    }
  })

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function toggleSessionItemFocusGroupSelection(state, instanceId, focuses) {
  const sessionItems = state.sessionItems.map((item) => {
    if (item.instanceId !== instanceId) {
      return item
    }

    const block = getBlockById(item.blockId)
    if (!block) return item

    const availableFocuses = getBlockFocuses(block)
    const currentFocuses = Array.isArray(item.allowedFocuses) && item.allowedFocuses.length > 0
      ? item.allowedFocuses
      : availableFocuses
    const nextFocuses = toggleFocusGroup(currentFocuses, focuses, availableFocuses)

    return {
      ...item,
      allowedFocuses: nextFocuses,
      focus: nextFocuses.includes(item.focus)
        ? item.focus
        : pickRandomFromFocuses(nextFocuses) || item.focus
    }
  })

  return {
    ...state,
    sessionItems,
    checked: normalizeChecked(sessionItems, state.checked)
  }
}

export function toggleSessionItemCheck(state, instanceId) {
  return {
    ...state,
    checked: {
      ...state.checked,
      [instanceId]: !state.checked[instanceId]
    }
  }
}

export function setSessionItemCheck(state, instanceId, checked) {
  return {
    ...state,
    checked: {
      ...state.checked,
      [instanceId]: checked
    }
  }
}
