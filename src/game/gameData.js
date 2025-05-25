// Initial deck of cards (back side)
export const INITIAL_DECK = [
    // Реализованы полностью:
    { id: 'vines', lives: 0, direction: 'SW', requirements: 'palm-trees', type: 'back', emoji: '🌿' },
    { id: 'hook', lives: 0, direction: 'NE', requirements: 'water', type: 'back', emoji: '🎣' },
    { id: 'water', lives: 2, direction: '', requirements: 'telescope', type: 'back', emoji: '💧' },
    { id: 'flint', lives: 0, direction: '', requirements: 'vines', type: 'back', emoji: '⚡' },
    { id: 'palm-trees', lives: 0, direction: 'SE', requirements: 'rocks', type: 'back', emoji: '🌴' },
    { id: 'sticks', lives: 0, direction: 'NW', requirements: 'flint', type: 'back', emoji: '🥢' },
    { id: 'bottle', lives: 0, direction: '', requirements: '_ship-set-sail', type: 'back', emoji: '🍾' },
    { id: 'higher-ground', lives: 0, direction: '', requirements: 'torch', type: 'back', emoji: '⛰️' },
    { id: 'telescope', lives: 0, direction: '', requirements: 'higher-ground', type: 'back', emoji: '🔭' },
    { id: 'rocks', lives: 0, direction: '', requirements: 'higher-ground', type: 'back', emoji: '🧱' },

    // Реализованы частично:
    // 2 карты сокровищ
    // шторм
    // пираты/компас
    // мираж
    { id: 'pig', lives: -2, direction: '', requirements: 'spear', type: 'back', emoji: '🐷' },
];

// Initial deck of cards (front side)
export const INITIAL_FRONT_DECK = [
    // Реализованы частично:
    { id: 'shelter', lives: 2, backId: 'vines', type: 'front', emoji: '🏠', description: 'Защищает от шторма' },
    { id: 'spear', lives: 0, backId: 'sticks', type: 'front', emoji: '🗡️', description: 'Защищает от кабана' },
    { id: 'ship-sighted', lives: 0, backId: 'telescope', type: 'front', emoji: '🚢', description: 'Корабль после угла поплывет дальше, но только один раз' },

    // Реализованы полностью:
    { id: 'fish', lives: 3, backId: 'hook', type: 'front', emoji: '🐟' },
    { id: 'waterfall', lives: 2, backId: 'water', type: 'front', emoji: '🌊' },
    { id: 'coconuts', lives: 2, backId: 'palm-trees', type: 'front', emoji: '🥥' },
    { id: 'meat', lives: 3, backId: 'pig', type: 'front', emoji: '🍽️' },
    { id: 'torch', lives: 0, backId: 'flint', type: 'front', emoji: '🔥' },
    { id: 'sos', lives: 0, backId: 'rocks', type: 'front', emoji: '🆘', description: 'Если корабль пересекает этот ряд, то вы выигрываете!' },
    { id: 'lit-beacon', lives: 0, backId: 'higher-ground', type: 'front', emoji: '🔥', description: 'Если корабль пересекает этот колонку, то вы выигрываете!' },
    { id: 'message', lives: 0, backId: 'bottle', type: 'front', emoji: '📜', description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то вы выигрываете!' },
];

// Initial ship card
export const INITIAL_SHIP = {
    type: 'ship',
    direction: undefined,
    id: 'ship',
    position: undefined,
    skipMove: true,
    hasTurned: false,
    emoji: '⛵',
    getEmoji() {
        if (!this.direction) return this.emoji;
        const arrows = {
            'NE': '⬇️',
            'SE': '⬅️', 
            'SW': '⬆️',
            'NW': '➡️'
        };
        return `${this.emoji}${arrows[this.direction]}`;
    },
    cornerCoordinates: {
        topLeft: [0, 0],
        topRight: [0, 0],
        bottomLeft: [0, 0],
        bottomRight: [0, 0]
    }
};

// Initial game state
export const INITIAL_STATE = {
    lives: 16,
    deck: [...INITIAL_DECK],
    frontDeck: [...INITIAL_FRONT_DECK],
    shipCard: { ...INITIAL_SHIP },
    occupiedPositions: new Map(),
    playerPosition: '0,0',
    gameOverMessage: null,
    isVictory: false
}; 