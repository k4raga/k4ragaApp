export const TRAINING_STORAGE_KEY = 'k4raga-cs-training-v3'

export const SESSION_PRESET_MINUTES = [30, 60, 90, 120, 150]

export const TRAINING_BLOCKS = [
  {
    id: 1,
    num: '01',
    name: 'Аим',
    durationMinutes: 10,
    duration: '10 мин DM',
    summary: 'Спокойный механический разогрев перед основным темпом.',
    focuses: ['Постановка прицела', 'Хедшоты', 'Deagle']
  },
  {
    id: 2,
    num: '02',
    name: 'Мувмент',
    durationMinutes: 10,
    duration: '10 мин DM',
    summary: 'Выход в контакт через правильную остановку и чистый пик.',
    focuses: ['Контрастрейф на две клавиши', 'Контрастрейф на одну клавишу', 'Пик угла']
  },
  {
    id: 3,
    num: '03',
    name: 'Пистолеты',
    durationMinutes: 10,
    duration: '10 мин DM',
    summary: 'Блок под стартовые раунды и экономические добивки.',
    focuses: ['Glock-18', 'USP-S', 'P2000', 'Dual Berettas', 'P250', 'Five-SeveN', 'Tec-9', 'CZ75-Auto', 'Desert Eagle', 'R8 Revolver']
  },
  {
    id: 4,
    num: '04',
    name: 'Вторичное оружие',
    durationMinutes: 10,
    duration: '10 мин DM',
    summary: 'Все рабочее оружие вне снайперок и AK.',
    focusGroups: [
      {
        label: 'ПП',
        items: ['MAC-10', 'MP9', 'MP7', 'MP5-SD', 'UMP-45', 'PP-Bizon', 'P90']
      },
      {
        label: 'Дробовики',
        items: ['Nova', 'XM1014', 'MAG-7', 'Sawed-Off']
      },
      {
        label: 'Автоматы',
        items: ['Galil AR', 'FAMAS', 'M4A4', 'M4A1-S', 'AUG', 'SG 553']
      },
      {
        label: 'Тяжелое',
        items: ['M249', 'Negev']
      }
    ]
  },
  {
    id: 5,
    num: '05',
    name: 'Снайпинг',
    durationMinutes: 10,
    duration: '10 мин DM',
    summary: 'Отдельный слот под обе снайперки без лишнего шума.',
    focuses: ['SSG 08', 'AWP']
  },
  {
    id: 6,
    num: '06',
    name: 'AK-47',
    durationMinutes: 10,
    duration: '10 мин DM',
    summary: 'Главное оружие под реальные дуэли и перенос формы в матч.',
    focuses: ['Тап', 'Бёрст', 'Спрей', 'Первый патрон']
  }
]

export const TRAINING_OVERVIEW_BLOCKS = [
  {
    num: '01',
    title: 'База контакта',
    desc: 'Первые блоки собирают прицел, движение и уверенность в первом контакте.'
  },
  {
    num: '02',
    title: 'Оружейный пул',
    desc: 'Середина тренировки прокручивает пистолеты и вторичное оружие как отдельные классы.'
  },
  {
    num: '03',
    title: 'Снайперка и AK',
    desc: 'Финальные блоки добирают две крайности: снайпинг и главное оружие под матч.'
  }
]

export function createDefaultTrainingState() {
  const targetMinutes = 150
  return {
    targetMinutes,
    sessionItems: createPresetSession(targetMinutes),
    blockFocusSelections: Object.fromEntries(
      TRAINING_BLOCKS.map((block) => [block.id, getBlockFocuses(block)])
    ),
    checked: {}
  }
}

export function createPresetSession(targetMinutes, blockFocusSelections = {}) {
  const itemCount = Math.max(1, Math.floor(targetMinutes / 10))
  const sessionItems = []

  for (let index = 0; index < itemCount; index += 1) {
    const block = TRAINING_BLOCKS[index % TRAINING_BLOCKS.length]
    sessionItems.push(createSessionItem(block, blockFocusSelections[block.id]))
  }

  return sessionItems
}

export function createSessionItem(block, allowedFocuses = null) {
  const availableFocuses = getBlockFocuses(block)
  const normalizedAllowedFocuses = Array.isArray(allowedFocuses) && allowedFocuses.length > 0
    ? allowedFocuses.filter((focus) => availableFocuses.includes(focus))
    : availableFocuses
  const selectedFocus = pickRandomFromFocuses(normalizedAllowedFocuses)

  return {
    instanceId: `session-${block.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    blockId: block.id,
    allowedFocuses: normalizedAllowedFocuses,
    focus: selectedFocus,
    durationMinutes: block.durationMinutes || 10
  }
}

export function pickRandomFocus(blockId) {
  const block = TRAINING_BLOCKS.find((entry) => entry.id === blockId)
  const focuses = block ? getBlockFocuses(block) : []

  return pickRandomFromFocuses(focuses)
}

export function pickRandomFromFocuses(focuses) {
  if (!focuses || focuses.length === 0) {
    return ''
  }

  const index = Math.floor(Math.random() * focuses.length)
  return focuses[index]
}

export function getBlockById(blockId) {
  return TRAINING_BLOCKS.find((block) => block.id === blockId) || null
}

export function getBlockFocuses(block) {
  if (block.focusGroups) {
    return block.focusGroups.flatMap((group) => group.items)
  }

  return block.focuses || []
}
