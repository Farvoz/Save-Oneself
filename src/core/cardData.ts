import { Direction, CardType, CardSide } from './Card';

type CardKey = 'vines' | 'hook' | 'water' | 'flint' | 'palmTrees' | 'sticks' | 'bottle' | 
    'higherGround' | 'telescope' | 'rocks' | 'pig' | 'storm' | 'mirage' | 'pirates' | 
    'mapRow' | 'mapCol';

type CardData = {
    [key in CardKey]: {
        back: CardSide;
        front: CardSide;
    }
};

// Card data objects
export const CARD_DATA: CardData = {
    vines: {
        back: {
            id: 'vines',
            lives: 0,
            direction: 'SW' as Direction,
            requirements: 'palm-trees',
            type: 'back' as CardType,
            emoji: '🌿',
            description: 'Позволяет сделать убежище'
        },
        front: {
            id: 'shelter',
            lives: 2,
            score: 2,
            type: 'front' as CardType,
            emoji: '🏠',
            description: 'Защищает от шторма'
        }
    },
    hook: {
        back: {
            id: 'hook',
            lives: 0,
            direction: 'NE' as Direction,
            requirements: 'water',
            type: 'back' as CardType,
            emoji: '🎣',
            description: 'Позволяет добыть рыбу'
        },
        front: {
            id: 'fish',
            lives: 3,
            type: 'front' as CardType,
            emoji: '🐟'
        }
    },
    water: {
        back: {
            id: 'water',
            lives: 2,
            requirements: 'telescope',
            type: 'back' as CardType,
            emoji: '💧',
            description: 'Позволяет освежиться'
        },
        front: {
            id: 'waterfall',
            lives: 2,
            type: 'front' as CardType,
            emoji: '🌊'
        }
    },
    flint: {
        back: {
            id: 'flint',
            lives: 0,
            requirements: 'vines',
            type: 'back' as CardType,
            emoji: '⚡',
            description: 'Позволяет сделать огонь'
        },
        front: {
            id: 'torch',
            lives: 0,
            score: 2,
            type: 'front' as CardType,
            emoji: '🕯️'
        }
    },
    palmTrees: {
        back: {
            id: 'palm-trees',
            lives: 0,
            direction: 'SE' as Direction,
            requirements: 'rocks',
            type: 'back' as CardType,
            emoji: '🌴',
            description: 'Позволяет добыть кокосы'
        },
        front: {
            id: 'coconuts',
            lives: 2,
            type: 'front' as CardType,
            emoji: '🥥'
        }
    },
    sticks: {
        back: {
            id: 'sticks',
            lives: 0,
            direction: 'NW' as Direction,
            requirements: 'flint',
            type: 'back' as CardType,
            emoji: '🥢',
            description: 'Позволяет сделать копье для охоты'
        },
        front: {
            id: 'spear',
            lives: 0,
            score: 2,
            type: 'front' as CardType,
            emoji: '🗡️',
            description: 'Защищает от кабана'
        }
    },
    bottle: {
        back: {
            id: 'bottle',
            lives: 0,
            requirements: '_ship-set-sail',
            type: 'back' as CardType,
            emoji: '🍾',
            description: 'Позволяет отправить сообщение, если не угловая карта'
        },
        front: {
            id: 'message',
            lives: 0,
            score: 3,
            type: 'front' as CardType,
            emoji: '📜',
            description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то вы выигрываете!'
        }
    },
    higherGround: {
        back: {
            id: 'higher-ground',
            lives: 0,
            requirements: 'torch',
            type: 'back' as CardType,
            emoji: '⛰️',
            description: 'Здесь доступно много действий'
        },
        front: {
            id: 'lit-beacon',
            lives: 0,
            score: 7,
            type: 'front' as CardType,
            emoji: '🔥',
            description: 'Если корабль пересекает этот колонку, то вы выигрываете!'
        }
    },
    telescope: {
        back: {
            id: 'telescope',
            lives: 0,
            requirements: 'higher-ground',
            type: 'back' as CardType,
            emoji: '🔭',
            description: 'Позволяет увидеть полное движение корабля'
        },
        front: {
            id: 'ship-sighted',
            lives: 0,
            score: 1,
            type: 'front' as CardType,
            emoji: '🚢',
            description: 'Корабль после угла поплывет дальше, но только один раз'
        }
    },
    rocks: {
        back: {
            id: 'rocks',
            lives: 0,
            requirements: 'higher-ground',
            type: 'back' as CardType,
            emoji: '🧱',
            description: 'Позволяет выложить SOS в ряд'
        },
        front: {
            id: 'sos',
            lives: 0,
            score: 5,
            type: 'front' as CardType,
            emoji: '🆘',
            description: 'Если корабль пересекает этот ряд, то вы выигрываете!'
        }
    },
    pig: {
        back: {
            id: 'pig',
            lives: -2,
            requirements: 'spear',
            type: 'back' as CardType,
            emoji: '🐷',
            description: 'После добычи, даёт мясо'
        },
        front: {
            id: 'meat',
            lives: 3,
            type: 'front' as CardType,
            emoji: '🍽️'
        }
    },
    storm: {
        back: {
            id: 'storm',
            lives: -2,
            requirements: '_13-turn',
            type: 'back' as CardType,
            emoji: '🌧️',
            description: 'Можно защититься в убежище'
        },
        front: {
            id: 'tornado',
            lives: -3,
            type: 'front' as CardType,
            emoji: '🌪️',
            description: 'Уничтожает убежище и костер, а затем переворачивается обратно'
        }
    },
    mirage: {
        back: {
            id: 'mirage',
            lives: 0,
            requirements: '_swap',
            type: 'back' as CardType,
            emoji: '🌫️',
            description: 'Сразу же заменяет самую дальнюю карту и переворачивается'
        },
        front: {
            id: 'sea-serpent',
            lives: 0,
            type: 'front' as CardType,
            emoji: '🐍',
            description: 'Корабль перескочет соседнюю клетку'
        }
    },
    pirates: {
        back: {
            id: 'pirates',
            lives: 0,
            requirements: '_ship-sailing',
            type: 'back' as CardType,
            emoji: '🏴‍☠️',
            description: 'Срабатывает, когда корабль уже плывет'
        },
        front: {
            id: 'compass',
            lives: 0,
            type: 'front' as CardType,
            emoji: '🧭',
            description: 'Даёт дополнительный ход на выложенную карту'
        }
    },
    mapRow: {
        back: {
            id: 'map-r',
            lives: 0,
            requirements: '_map',
            type: 'back' as CardType,
            emoji: '👈🗺️👉',
            description: 'Сокровище где-то в этом ряду'
        },
        front: {
            id: 'rum',
            lives: 1,
            type: 'front' as CardType,
            emoji: '🥃'
        }
    },
    mapCol: {
        back: {
            id: 'map-c',
            lives: 0,
            requirements: '_map',
            type: 'back' as CardType,
            emoji: '👇🗺️☝️',
            description: 'Сокровище где-то в этой колонке'
        },
        front: {
            id: 'treasure',
            lives: 0,
            score: 10,
            type: 'front' as CardType,
            emoji: '💎'
        }
    },
} as const; 

export const ship: CardSide = {
    id: 'ship',
    lives: 0,
    type: 'ship' as CardType,
    emoji: '⛵',
} as const; 