// Initial deck of cards (back side)
export const INITIAL_DECK = [
    { lives: 0, direction: 'NE', id: 'hook', requirements: 'water', type: 'back', emoji: '🎣' },
    { lives: 2, direction: '', id: 'water', requirements: 'telescope', type: 'back', emoji: '💧' },
    { lives: 0, direction: '', id: 'flint', requirements: 'vines', type: 'back', emoji: '⚡' },
    { lives: 0, direction: 'SW', id: 'vines', requirements: 'palm-trees', type: 'back', emoji: '🌿' },
    { lives: 0, direction: 'SE', id: 'palm-trees', requirements: 'rocks', type: 'back', emoji: '🌴' },
    { lives: 0, direction: 'NW', id: 'sticks', requirements: 'flint', type: 'back', emoji: '🥢' },
    { lives: 0, direction: '', id: 'telescope', requirements: 'higher-ground', type: 'back', emoji: '🔭' },
    { lives: 0, direction: '', id: 'rocks', requirements: 'higher-ground', type: 'back', emoji: '🧱' },
    { lives: 0, direction: '', id: 'higher-ground', requirements: 'torch', type: 'back', emoji: '⛰️' },
    { lives: 0, direction: '', id: 'bottle', requirements: '_ship-set-sail', type: 'back', emoji: '🍾' },
];

// Initial deck of cards (front side)
export const INITIAL_FRONT_DECK = [
    { lives: 3, backId: 'hook', id: 'fish', type: 'front', emoji: '🐟' },
    { lives: 2, backId: 'water', id: 'waterfall', type: 'front', emoji: '🌊' },
    { lives: 0, backId: 'flint', id: 'torch', type: 'front', emoji: '🔥' },
    { lives: 2, backId: 'palm-trees', id: 'coconuts', type: 'front', emoji: '🥥' },
    { lives: 0, backId: 'sticks', id: 'spear', type: 'front', emoji: '🗡️' },
    { lives: 2, backId: 'vines', id: 'shelter', type: 'front', emoji: '🏠' },
    { lives: 0, backId: 'telescope', id: 'ship-sighted', type: 'front', emoji: '🚢' },
    { lives: 0, backId: 'rocks', id: 'sos', type: 'front', emoji: '🆘', description: 'Если корабль пересекает этот ряд, то вы выигрываете!' },
    { lives: 0, backId: 'higher-ground', id: 'lit-beacon', type: 'front', emoji: '🔥', description: 'Если корабль пересекает этот колонку, то вы выигрываете!' },
    { lives: 0, backId: 'bottle', id: 'message', type: 'front', emoji: '📜', description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то вы выигрываете!' },
];

// Initial ship card
export const INITIAL_SHIP = {
    type: 'ship',
    direction: undefined,
    id: 'ship',
    position: undefined,
    skipMove: true,
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
    moves: 0
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