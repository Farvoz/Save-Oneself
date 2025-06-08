import { StateFrom } from 'xstate';
import { createGameStateMachine } from './gameStateMachine';
import { PositionSystem, Position } from './PositionSystem';
import { ShipCornerManager } from './ShipCornerManager';

export type Direction = 'NE' | 'SE' | 'SW' | 'NW';

export type CardType = 'back' | 'front' | 'ship';

export type Card = {
    id: string;
    lives: number;
    direction?: Direction;
    requirements?: string;
    type: CardType;
    emoji: string;
    description?: string;
    backId?: string;
    score?: number;
    skipMove?: boolean;
    hasTurned?: boolean;
    cornerManager?: ShipCornerManager;
    getEmoji?: () => string;
};

export type ShipCard = {
    type: 'ship';
    direction: Direction;
    id: string;
    position: Position | null;
    skipMove: boolean;
    hasTurned: boolean;
    emoji: string;
    cornerManager?: ShipCornerManager;
    getEmoji: () => string;
    lives: number;
};

export type GameContext = {
    lives: number;
    deck: Card[];
    frontDeck: Card[];
    positionSystem: PositionSystem;
    playerPosition?: Position;
    shipCard?: ShipCard;
    hasPlacedCard: boolean;
    hasMoved: boolean;
    movesLeft: number;
    gameOverMessage: string | null;
    isVictory: boolean;
};

export type GameEvent =
    | { type: 'MOVE_PLAYER'; row: number; col: number }
    | { type: 'FLIP_CARD'; row: number; col: number }
    | { type: 'SKIP_PHASE' }
    | { type: 'SKIP_MOVES' };

export type GameState = StateFrom<typeof createGameStateMachine>; 

// Initial deck of cards (back side)
export const INITIAL_DECK: Card[] = [
    // Реализованы полностью:
    { id: 'vines', lives: 0, direction: 'SW', requirements: 'palm-trees', type: 'back', emoji: '🌿', description: 'Позволяет сделать убежище' },
    { id: 'hook', lives: 0, direction: 'NE', requirements: 'water', type: 'back', emoji: '🎣', description: 'Позволяет добыть рыбу' },
    { id: 'water', lives: 2, requirements: 'telescope', type: 'back', emoji: '💧', description: 'Позволяет освежиться' },
    { id: 'flint', lives: 0, requirements: 'vines', type: 'back', emoji: '⚡', description: 'Позволяет сделать огонь' },
    { id: 'palm-trees', lives: 0, direction: 'SE', requirements: 'rocks', type: 'back', emoji: '🌴', description: 'Позволяет добыть кокосы' },
    { id: 'sticks', lives: 0, direction: 'NW', requirements: 'flint', type: 'back', emoji: '🥢', description: 'Позволяет сделать копье для охоты' },
    { id: 'bottle', lives: 0, requirements: '_ship-set-sail', type: 'back', emoji: '🍾', description: 'Позволяет отправить сообщение, если не угловая карта' },
    { id: 'higher-ground', lives: 0, requirements: 'torch', type: 'back', emoji: '⛰️', description: 'Здесь доступно много действий' },
    { id: 'telescope', lives: 0, requirements: 'higher-ground', type: 'back', emoji: '🔭', description: 'Позволяет увидеть полное движение корабля' },
    { id: 'rocks', lives: 0, requirements: 'higher-ground', type: 'back', emoji: '🧱', description: 'Позволяет выложить SOS в ряд' },
    { id: 'pig', lives: -2, requirements: 'spear', type: 'back', emoji: '🐷', description: 'После добычи, даёт мясо' },
    { id: 'storm', lives: -2, requirements: '_13-turn', type: 'back', emoji: '🌧️', description: 'Можно защититься в убежище' },
    // TODO:  если одинаковое расстояние, то выбирается случайно
    { id: 'mirage', lives: 0, requirements: '_swap', type: 'back', emoji: '🌫️', description: 'Сразу же заменяет самую дальнюю карту и переворачивается' },
    { id: 'pirates', lives: 0, requirements: '_ship-sailing', type: 'back', emoji: '🏴‍☠️', description: 'Срабатывает, когда корабль уже плывет' },
    // 2 карты сокровищ: сначала надо попасть на карту, которая находится на пересечении ряда и колонки. А потом можно перевернуть обе карты
    { id: 'map-r', lives: 0, requirements: '_map', type: 'back', emoji: '👈🗺️👉', description: 'Сокровище где-то в этом ряду' },
    { id: 'map-c', lives: 0, requirements: '_map', type: 'back', emoji: '👇🗺️☝️', description: 'Сокровище где-то в этой колонке' },
];

// Initial deck of cards (front side)
export const INITIAL_FRONT_DECK: Card[] = [
    { id: 'rum', lives: 1, backId: 'map-r', type: 'front', emoji: '🥃' },
    { id: 'treasure', lives: 0, score: 10, backId: 'map-c', type: 'front', emoji: '💎' },
    { id: 'fish', lives: 3, backId: 'hook', type: 'front', emoji: '🐟' },
    { id: 'waterfall', lives: 2, backId: 'water', type: 'front', emoji: '🌊' },
    { id: 'coconuts', lives: 2, backId: 'palm-trees', type: 'front', emoji: '🥥' },
    { id: 'meat', lives: 3, backId: 'pig', type: 'front', emoji: '🍽️' },
    { id: 'torch', lives: 0, score: 2, backId: 'flint', type: 'front', emoji: '🕯️' },
    { id: 'compass', lives: 0, backId: 'pirates', type: 'front', emoji: '🧭', description: 'Даёт дополнительный ход на выложенную карту' },
    { id: 'sea-serpent', lives: 0, backId: 'mirage', type: 'front', emoji: '🐍', description: 'Корабль перескочет соседнюю клетку' },
    { id: 'tornado', lives: -3, backId: 'storm', type: 'front', emoji: '🌪️', description: 'Уничтожает убежище и костер, а затем переворачивается обратно' },
    { id: 'ship-sighted', lives: 0, score: 1, backId: 'telescope', type: 'front', emoji: '🚢', description: 'Корабль после угла поплывет дальше, но только один раз' },
    { id: 'shelter', lives: 2, score: 2, backId: 'vines', type: 'front', emoji: '🏠', description: 'Защищает от шторма' },
    { id: 'spear', lives: 0, score: 2, backId: 'sticks', type: 'front', emoji: '🗡️', description: 'Защищает от кабана' },
    { id: 'sos', lives: 0, score: 5, backId: 'rocks', type: 'front', emoji: '🆘', description: 'Если корабль пересекает этот ряд, то вы выигрываете!' },
    { id: 'lit-beacon', lives: 0, score: 7, backId: 'higher-ground', type: 'front', emoji: '🔥', description: 'Если корабль пересекает этот колонку, то вы выигрываете!' },
    { id: 'message', lives: 0, score: 3, backId: 'bottle', type: 'front', emoji: '📜', description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то вы выигрываете!' },
];

// Initial ship card
export const INITIAL_SHIP: Partial<ShipCard> = {
    type: 'ship',
    direction: 'NE',
    id: 'ship',
    position: null,
    skipMove: true,
    hasTurned: false,
    emoji: '⛵',
    cornerManager: undefined,
    lives: 0
};

// Initial game state
export const INITIAL_STATE: GameContext = {
    lives: 16,
    deck: [...INITIAL_DECK],
    frontDeck: [...INITIAL_FRONT_DECK],
    positionSystem: new PositionSystem(),
    gameOverMessage: null,
    isVictory: false,
    hasPlacedCard: false,
    movesLeft: 0,
    hasMoved: false
}; 