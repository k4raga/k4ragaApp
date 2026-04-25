export const LANDING_COPY = {
  badge: 'K4RAGA HUB',
  title: 'K4RAGA',
  subtitle:
    'Простой хаб без лишней возни. Отсюда можно перейти в CS-тренировку и дальше работать уже внутри отдельного поддомена.',
  primaryCta: 'Открыть CS',
  secondaryCta: 'Twitch',
  overviewLabel: 'КАК ЭТО УСТРОЕНО',
  blocksLabel: 'ЧТО ВНУТРИ CS',
  cards: [
    {
      title: 'CS',
      text: 'Отдельный поддомен с конструктором и тренировкой без календарей и лишних слоев.'
    },
    {
      title: 'Twitch',
      text: 'Внешняя витрина и основной живой контент, куда ведет вся тренировочная подводка.'
    }
  ]
}

export const NAV_COPY = {
  cs: {
    home: 'Сборка',
    training: 'Тренировка',
    faceit: 'Faceit'
  },
  main: {
    home: 'Главная',
    cs: 'CS'
  }
}

export const BUILDER_COPY = {
  kicker: 'CONFIG MODE',
  title: 'Сборка сессии',
  description:
    'Слева лежат типы тренировок. Перетаскивай или добавляй их вправо, чтобы собрать живую CS-сессию на нужную длительность.',
  refresh: 'Пересобрать фокусы',
  openTraining: 'Открыть тренировку',
  activeBlocks: 'Карточек в сессии',
  totalDuration: 'Собрано времени',
  minutes: 'мин',
  activeFocuses: 'доступных фокусов',
  libraryTitle: 'Типы тренировок',
  sessionTitle: 'План сессии',
  targetLabel: 'Пресет длительности',
  sessionEmpty: 'Справа пока пусто. Добавь первый блок из библиотеки и собери свою длинную тренировку.',
  addToSession: 'Добавить в сессию',
  dragHint: 'Можно перетащить вправо',
  remove: 'Убрать',
  duplicate: 'Дубль',
  moveUp: 'Выше',
  moveDown: 'Ниже',
  clear: 'Очистить',
  target: 'Цель',
  ready: 'Сессия готова',
  focusLabel: 'Фокусы',
  libraryMeta: 'Тип тренировки'
}

export const TRAINING_COPY = {
  kicker: 'DETAILED MODE',
  title: 'CS Тренировка',
  description:
    'Здесь только прохождение собранной сессии. Порядок и фокусы приходят из сборщика.',
  refresh: 'Пересобрать фокусы',
  builder: 'Вернуться к сборке',
  home: 'На главную',
  empty: 'Собери хотя бы одну карточку в builder, чтобы открыть тренировку.',
  completeTitle: 'GG WP',
  completeText: 'Сессия закрыта. Можно идти в катку, на стрим или собирать новый заход.',
  popupTitle: 'GG WP!',
  popupText: 'CS тренировка завершена',
  popupText2: 'можно возвращаться на главную'
}

export const FACEIT_WATCH_COPY = {
  kicker: 'FACEIT WATCH',
  title: 'Матчи benchmark-пула',
  description:
    'Ручной обзор последних FACEIT-матчей за 7 дней по пулу donk, flameZ, YEKINDAR, kyousuke и NiKo. Источник дергается только по кнопке, чтобы не спамить внешние запросы.',
  refresh: 'Загрузить матчи',
  loading: 'Загрузка...',
  updated: 'Обновлено',
  home: 'Конструктор',
  training: 'Тренировка',
  filterLabel: 'Фильтр игроков',
  matches: 'Матчей за 7 дней',
  empty: 'За последние 7 дней матчи не нашлись или источник не отдал историю.',
  loadError: 'Не удалось загрузить матчи',
  errorPrefix: 'Ошибка',
  matchLink: 'Матч FACEIT',
  profileLink: 'Профиль FACEIT',
  map: 'Карта',
  score: 'Счет',
  kills: 'Киллы',
  kda: 'KDR',
  hub: 'Хаб',
  elo: 'ELO'
}
