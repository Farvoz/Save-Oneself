# Схема связей сущностей игры Marooned (актуальная)

## Диаграмма связей (Mermaid)

```mermaid
graph TB
    %% Основные сущности
    GameContext[GameContext<br/>Типы и состояние]
    GameStateMachine[GameStateMachine<br/>Машина состояний]
    PositionSystem[PositionSystem<br/>Система позиций]
    Position[Position<br/>Координаты]

    %% Карты
    GameCard[GameCard<br/>Базовая карта]
    CardSide[CardSide<br/>Сторона карты + обработчики]
    ShipCard[ShipCard<br/>Корабль]
    ShipCornerManager[ShipCornerManager<br/>Орбита и повороты]

    %% Данные/инициализация/действия
    CARD_DATA[CARD_DATA<br/>Данные карт + updateLives]
    initial[initial.ts<br/>INITIAL_STATE/DECK/TYPES]
    gameActions[gameActions.ts<br/>Игровые действия]
    gameLogger[gameLogger.ts<br/>Логгер]

    %% Наследование/композиция
    ShipCard --> GameCard
    ShipCard --> ShipCornerManager
    GameCard --> CardSide

    %% Композиция состояния
    GameContext --> PositionSystem
    GameContext --> Position
    GameContext --> GameCard

    %% Использование
    GameStateMachine --> GameContext
    GameStateMachine --> gameActions
    GameStateMachine --> gameLogger
    initial --> GameContext
    initial --> CARD_DATA
    gameActions --> PositionSystem
    gameActions --> ShipCard
    CARD_DATA --> CardSide
    PositionSystem --> GameCard
    PositionSystem --> ShipCard
    PositionSystem --> Position

    %% Стили
    classDef core fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef card fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef system fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class GameContext,GameStateMachine,PositionSystem,Position core
    class GameCard,CardSide,ShipCard,ShipCornerManager card
    class gameActions,gameLogger system
    class CARD_DATA,initial data
```

## Описание актуальных связей

### 1) Основные сущности

- **GameContext** (`src/core/initial.ts`):
  - `lives: number`
  - `deck: GameCard[]`
  - `positionSystem: PositionSystem`
  - `playerPosition?: Position`
  - `hasPlacedCard: boolean`, `hasMoved: boolean`, `movesLeft: number`
  - `gameOverMessage: string | null`, `isVictory: boolean`

- **GameStateMachine** (`src/core/gameStateMachine.ts`):
  - Инициализируется `INITIAL_STATE`
  - Управляет фазами: startOfRound → moving → checkingCardPlacement → checkingCardEffects → checkingMoveResult → decreasingLives → checkingFlippable → shipMoving → checkingShipEffects
  - Вызовы обработчиков сторон карт: `onRoundStart`, `onPlace` (только для текущей клетки), `onBeforeShipMove`, `onShipMove`

### 2) Система карт

- **CardSide** (`src/core/Card.ts`): описывает сторону карты и содержит обработчики:
  - `onPlace`, `onFlip`, `onBeforeShipMove`, `onShipMove`, `onRoundStart`, а также `canFlip`

- **GameCard** (`src/core/Card.ts`):
  - Две стороны (back/front), переключается `flip`
  - Методы доступа к текущим свойствам (id, emoji, type, direction, lives/score)
  - Базовая реализация `canFlip` учитывает требования (`requirements`) через `PositionSystem`

- **ShipCard** (`src/core/ShipCard.ts`):
  - Наследуется от `GameCard`, хранит текущее направление и `ShipCornerManager`
  - Флаги `skipMove`, `hasTurned`

- **ShipCornerManager** (`src/core/ShipCornerManager.ts`):
  - Рассчитывает «квадрат острова» по текущим границам
  - Валидирует орбиту и стартовую/следующую позицию корабля, определяет повороты на углах

### 3) Позиции

- **PositionSystem** (`src/core/PositionSystem.ts`):
  - Хранит карты по ключу строки координат
  - Оперирует картами/кораблем: `getShipPosition/Card`, `set/remove/swap`, `findCardById`, `findAllBy`, `getBounds`, `getAdjacentPositions`, `isAdjacent`, `isOutOfBounds`, `countNonShipCards`, `clone`
  - Знает о `ShipCard` (валидация позиций корабля через `cornerManager`)

- **Position**: простая структура координат с утилитами (`toString`, `fromString`, `distanceTo`, `equals`, `isValid`)

### 4) Данные, инициализация, действия

- **CARD_DATA** (`src/core/cardData.ts`):
  - Описание всех карт (back/front) и их обработчиков
  - Функция `updateLives(oldLives, delta)` централизует изменение жизней (0..16)

- **initial.ts**:
  - Типы `GameContext`, `GameEvent`, `GameState`
  - `INITIAL_GAME_DECK` создаётся из `CARD_DATA`
  - `INITIAL_STATE` формирует стартовый контекст

- **gameActions.ts**:
  - `shuffleDeck`, `movePlayer`, `placeCard`, `placeShip`, `moveShip`, `decreaseLive`, `isPlayerValidPosition`, `hasFlippableCards`, `checkVictory`, `checkDefeat`, `calculateScore`
  - Взаимодействует с `PositionSystem`, `ShipCard`, `ShipCornerManager`; использует `updateLives` из `cardData`

### 5) Поток раунда (кратко)

1. `startOfRound`: сброс флагов, `onRoundStart` для всех карт
2. `moving`: игрок делает шаг (`MOVE_PLAYER`) или пропускает остаток ходов
3. `checkingCardPlacement`: если клетка пустая и карта не размещена — `placeCard` (+ потенциально `placeShip`)
4. `checkingCardEffects`: `onPlace` только для текущей клетки
5. `checkingMoveResult`: проверка победы/ходов; иначе — уменьшение жизней
6. `decreasingLives` → `checkingFlippable` (по желанию `FLIP_CARD`) → `shipMoving`
7. `shipMoving`: `onBeforeShipMove`, движение корабля, затем проверка победы/поражения и `onShipMove`

## Примечания по текущей архитектуре

- **Циклических зависимостей нет**: `gameActions` импортирует `updateLives` из `cardData`, а `cardData` не зависит от `gameActions`.
- **Сознательная связанность `PositionSystem ↔ ShipCard`**: валидация позиций корабля делегирована `ShipCornerManager` через `ShipCard`.
- **Обработчики на `CardSide`** формируют сценарии: телескоп (поворот на углу один раз), пираты (перехват до движения), мираж (замена дальней карты и flip), шторм/торнадо (условные flip-эффекты), карты карты (map-r/map-c) и т.п.

## Возможные улучшения (необязательные)

- Вынести `updateLives` в отдельный модуль эффектов, если появятся другие общие эффекты
- Рассмотреть ослабление зависимости `PositionSystem` от `ShipCard` через интерфейс уровня «корабля», если потребуется альтернативная реализация
- Документировать контракт обработчиков `CardSide` и их сроки вызова в отдельном разделе руководства


