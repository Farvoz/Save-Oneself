// Initial deck of cards (back side)
export const INITIAL_DECK = [
    // Реализованы полностью:
    { id: 'vines', lives: 0, direction: 'SW', requirements: 'palm-trees', type: 'back', emoji: '🌿', description: 'Позволяет сделать убежище' },
    { id: 'hook', lives: 0, direction: 'NE', requirements: 'water', type: 'back', emoji: '🎣', description: 'Позволяет добыть рыбу' },
    { id: 'water', lives: 2, direction: '', requirements: 'telescope', type: 'back', emoji: '💧', description: 'Позволяет освежиться' },
    { id: 'flint', lives: 0, direction: '', requirements: 'vines', type: 'back', emoji: '⚡', description: 'Позволяет сделать огонь' },
    { id: 'palm-trees', lives: 0, direction: 'SE', requirements: 'rocks', type: 'back', emoji: '🌴', description: 'Позволяет добыть кокосы' },
    { id: 'sticks', lives: 0, direction: 'NW', requirements: 'flint', type: 'back', emoji: '🥢', description: 'Позволяет сделать копье для охоты' },
    { id: 'bottle', lives: 0, direction: '', requirements: '_ship-set-sail', type: 'back', emoji: '🍾', description: 'Позволяет отправить сообщение, если не угловая карта' },
    { id: 'higher-ground', lives: 0, direction: '', requirements: 'torch', type: 'back', emoji: '⛰️', description: 'Здесь доступно много действий' },
    { id: 'telescope', lives: 0, direction: '', requirements: 'higher-ground', type: 'back', emoji: '🔭', description: 'Позволяет увидеть полное движение корабля' },
    { id: 'rocks', lives: 0, direction: '', requirements: 'higher-ground', type: 'back', emoji: '🧱', description: 'Позволяет выложить SOS в ряд' },
    { id: 'pig', lives: -2, direction: '', requirements: 'spear', type: 'back', emoji: '🐷', description: 'После добычи, даёт мясо' },

    // Реализованы частично:

    // Как только переворачивается тринадцатая карта, то шторм переворачивается (даже если шторм сама является тринадцатой картой)
    { id: 'storm', lives: -2, direction: '', requirements: '_13-turn', type: 'back', emoji: '🌧️', description: 'Можно защититься в убежище' },
    // 2 карты сокровищ
    // шторм
    // пираты/компас
    // мираж
];

// Initial deck of cards (front side)
export const INITIAL_FRONT_DECK = [
    // Реализованы частично:

    { id: 'tornado', lives: -3, backId: 'storm', type: 'front', emoji: '🌪️', description: 'Уничтожает убежище и костер, а затем переворачивается обратно' },

    // Реализованы полностью:
    { id: 'fish', lives: 3, backId: 'hook', type: 'front', emoji: '🐟' },
    { id: 'waterfall', lives: 2, backId: 'water', type: 'front', emoji: '🌊' },
    { id: 'coconuts', lives: 2, backId: 'palm-trees', type: 'front', emoji: '🥥' },
    { id: 'meat', lives: 3, backId: 'pig', type: 'front', emoji: '🍽️' },
    { id: 'torch', lives: 0, backId: 'flint', type: 'front', emoji: '🔥' },
    { id: 'ship-sighted', lives: 0, backId: 'telescope', type: 'front', emoji: '🚢', description: 'Корабль после угла поплывет дальше, но только один раз' },
    { id: 'shelter', lives: 2, backId: 'vines', type: 'front', emoji: '🏠', description: 'Защищает от шторма' },
    { id: 'spear', lives: 0, backId: 'sticks', type: 'front', emoji: '🗡️', description: 'Защищает от кабана' },
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
    // Изначально поле максимальное
    cornerCoordinates: {
        topLeft: [-3, -3],
        topRight: [-3, 3],
        bottomLeft: [3, -3],
        bottomRight: [3, 3]
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
    isVictory: false,
    shouldCheckStorm: false
}; 