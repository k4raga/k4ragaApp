# Deployment

## Локальная проверка

Перед выкладкой:

```bash
npm run build
```

## Прод

Сейчас приложение крутится через:

- `nginx`
- `pm2`
- `next start -p 3000`

Рабочая директория на сервере:

- `/var/www/k4raga`

PM2-процесс:

- `k4raga`

## Базовый сценарий выкладки

1. Собрать архив приложения без:
   - `.git`
   - `.next`
   - `node_modules`
   - `.claude`
2. Залить архив на сервер.
3. Распаковать в новую release-папку.
4. Выполнить:

```bash
npm ci
npm run build
```

5. Переместить прошлый релиз в backup.
6. Новый релиз сделать текущим `/var/www/k4raga`.
7. Перезапустить:

```bash
pm2 delete k4raga || true
pm2 start npm --name k4raga -- start
pm2 save
```

## После выкладки

Проверять:

- `https://k4raga.ru/`
- `https://cs.k4raga.ru/`
- `https://cs.k4raga.ru/training`

Ожидаемый результат:

- ответы `200`;
- корректный root на основном домене;
- конструктор на `cs`;
- отдельная страница тренировки.
