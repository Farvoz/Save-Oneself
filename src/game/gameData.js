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
    { lives: 0, backId: 'rocks', id: 'sos', type: 'front', emoji: '🆘' },
    { lives: 0, backId: 'higher-ground', id: 'lit-beacon', type: 'front', emoji: '🔥' },
    { lives: 0, backId: 'bottle', id: 'message', type: 'front', emoji: '📜' },
];

// Initial ship card
export const INITIAL_SHIP = {
    type: 'ship',
    lives: 0,
    direction: undefined,
    id: 'ship',
    position: undefined,
    skipMove: true,
    emoji: '⛵',
    moves: 0
};

// Initial game state
export const INITIAL_STATE = {
    lives: 16,
    deck: [...INITIAL_DECK],
    frontDeck: [...INITIAL_FRONT_DECK],
    shipCard: { ...INITIAL_SHIP },
    occupiedPositions: new Map(),
    playerPosition: null,
    gameOverMessage: null,
    isVictory: false
}; 