### Предлагаемая структура в стиле DDD для фронтенд‑проекта

```text
src/
  app/                         # "точка входа" приложения
    providers/                 # конфиг React, роутинг, store, i18n
    routes/                    # декларация маршрутов
    index.tsx
  shared/                      # переиспользуемые абстракции (не знают доменов)
    ui/                        # базовые UI-компоненты (Button, Modal, GridBase)
    lib/                       # утилиты, хелперы, форматтеры
    types/                     # общие типы/DTO
    config/                    # конфиги, фичефлаги
    styles/                    # глобальные стили, дизайн‑токены
  processes/                   # сквозные пользовательские сценарии (онбординг и т.п.)
    gameSession/               # процесс “игровая сессия” (оркестрация нескольких фич/доменов)
      index.ts
  domains/                     # bounded contexts (чистая доменная модель)
    game/                      # правила игры как домен
      entities/                # сущности и их инварианты (Game, Turn, Phase)
      valueObjects/            # VO: Position, Coordinates, CardId
      services/                # доменные сервисы без побочек (rules/engines)
      policies/                # инварианты/правила переходов
      factories/               # создание агрегатов/VO
      events/                  # доменные события
      repo/                    # интерфейсы репозиториев (порты)
      index.ts
    board/
      entities/
      valueObjects/
      services/
      index.ts
    ship/
      entities/
      services/
      index.ts
    card/
      entities/
      valueObjects/
      services/
      index.ts
    player/
      entities/
      services/
      index.ts
  application/                 # слой application (use cases, orchestrations)
    useCases/                  # команды/запросы (StartGame, PlayCard, MoveShip)
    queries/                   # селекторы/чтение состояния
    mappers/                   # маппинг домен <-> DTO/UI
    ports/                     # интерфейсы к внеших сервисам (clock, random, storage)
    index.ts
  infrastructure/              # адаптеры к портам (все побочки)
    persistence/               # localStorage/IndexedDB, адаптеры репозиториев
    services/                  # time/random/logger/http
    gateways/                  # сети/сокеты (если появятся)
    configs/                   # runtime конфигурация адаптеров
    index.ts
  ui/                          # слой представления, близкий к фичам
    pages/                     # страницы (маршрут = страница)
      GamePage/
        index.tsx
    features/                  # фичи, работающие через use cases
      PlayCard/
        model/                 # хук/слайс фичи, обращается к application
        ui/                    # компоненты фичи (контейнер+презентационные)
        index.ts
      MoveShip/
        model/
        ui/
        index.ts
    widgets/                   # составные блоки страниц (BoardWidget, HandWidget)
      BoardWidget/
        model/
        ui/
        index.ts
  tests/                       # модульные/интеграционные/контрактные тесты (mirrors src)
    domains/
    application/
    ui/
```

### Как разложить ваши текущие файлы
- `src/index.tsx` → `src/app/index.tsx`
- `src/components/*`:
  - базовые универсальные → `src/shared/ui/`
  - специфичные для игры (Grid, Card визуал) → `src/ui/widgets/*` или `src/ui/features/*` по назначению
  - страницы → `src/ui/pages/GamePage/`
- `src/core/*`:
  - доменная логика (`Card.ts`, `ShipCard.ts`, `PositionSystem.ts`, `ShipCornerManager.ts`, `gameStateMachine.ts`, `gameActions.ts`, `gameData.ts`, `cardData.ts`, `gameLogger.ts`) разложить:
    - сущности/VO → `src/domains/{game|card|ship|board|player}/{entities|valueObjects}`
    - доменные сервисы и правила → `src/domains/*/services` и `src/domains/game/policies`
    - состояние/машина состояний как use cases → `src/application/useCases`
    - логгер как порт/адаптер:
      - интерфейс → `src/application/ports/logger.ts`
      - реализация → `src/infrastructure/services/logger/*`
- Тесты из `src/__tests__` → `src/tests` с зеркалированием структуры (или рядом с кодом как `*.test.ts`).

### Короткие принципы раскладки
- Домены не знают про UI/инфраструктуру. Только типы и чистая логика.
- Application дергает домены и обращается к портам. Никаких побочных эффектов внутри домена.
- Infrastructure реализует порты, регистрируется в `app/providers`.
- UI вызывает только application (use cases/queries), не лезет к домену напрямую.
- Общие вещи живут в `shared/*`.

### Мини‑план миграции (без боли)
1) Создать каркас папок как выше.  
2) Перенести чистые доменные сущности/VO в `domains/*` без изменений.  
3) Выделить команды в `application/useCases` из `gameActions.ts` и машины состояний.  
4) Вынести зависимости на окружение в порты (`application/ports`), сделать адаптеры в `infrastructure/*`.  
5) Разрезать UI на `pages` → `widgets` → `features`, оставив базовые элементы в `shared/ui`.  
6) Обновить импорты.  
7) Переложить тесты с зеркальным путём.

Хочешь — могу разложить конкретно ваши файлы по папкам и наметить пофайловые правки импорта.