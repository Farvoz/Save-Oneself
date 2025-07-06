import { Direction, CardType, CardSide } from './Card';
import { updateLives } from './gameActions';

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
            description: 'После добычи, даёт мясо',
            onPlace: (context) => {
                // Если есть spear, урон не наносится
                const isProtected = context.positionSystem.findCardById('spear');
                if (!isProtected) {
                    const { lives } = updateLives(context.lives, -2);
                    return { ...context, lives };
                }
                return context;
            }
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
            description: 'Можно защититься в убежище',
            onPlace: (context) => {
                // Если есть shelter, урон не наносится
                const isProtected = context.positionSystem.findCardById('shelter');
                if (!isProtected) {
                    const { lives } = updateLives(context.lives, -2);
                    return { ...context, lives };
                }
                return context;
            },
            onRoundStart: (context) => {
                if (context.positionSystem.countNonShipCards() === 13) {
                    const stormResult = context.positionSystem.findCardById('storm');
                    if (stormResult) {
                        stormResult.card.flip();
                    }
                }
                return context;
            }
        },
        front: {
            id: 'tornado',
            lives: -3,
            type: 'front' as CardType,
            emoji: '🌪️',
            description: 'Уничтожает убежище и костер, а затем переворачивается обратно',
            onFlip: (context) => {
                // tornado flips back, and also flips shelter and lit beacon back
                if (context.positionSystem.countNonShipCards() === 13) {
                    // flip tornado back
                    const tornadoCard = context.positionSystem.getPosition(context.playerPosition!);
                    if (tornadoCard) tornadoCard.flip();
                    // flip shelter and lit beacon back
                    const shelterResult = context.positionSystem.findCardById('shelter');
                    const litBeaconResult = context.positionSystem.findCardById('lit-beacon');
                    if (shelterResult) shelterResult.card.flip();
                    if (litBeaconResult) litBeaconResult.card.flip();
                }
                return context;
            }
        }
    },
    mirage: {
        back: {
            id: 'mirage',
            lives: 0,
            requirements: '_swap',
            type: 'back' as CardType,
            emoji: '🌫️',
            description: 'Сразу же заменяет самую дальнюю карту и переворачивается',
            onPlace: (context) => {
                const farthestPos = context.positionSystem.findFarthestPosition(context.playerPosition!);
                if (farthestPos) {
                    context.positionSystem.swapPositions(context.playerPosition!, farthestPos);
                    // flip the mirage card after swap
                    const card = context.positionSystem.getPosition(farthestPos);
                    if (card) card.flip();
                }
                return { ...context, positionSystem: context.positionSystem };
            }
        },
        front: {
            id: 'sea-serpent',
            lives: 0,
            type: 'front' as CardType,
            emoji: '🐍',
            description: 'Корабль перескочет соседнюю клетку',
            onShipMove: (context) => {
                if (!context.shipCard?.position) return context;
                const adjacentPositions = context.positionSystem.getAdjacentPositions(context.shipCard.position);
                const isAdjacent = adjacentPositions.some(adjPos => {
                    const card = context.positionSystem.getPosition(adjPos);
                    return card && card.getCurrentId() === 'sea-serpent';
                });
                if (isAdjacent && context.shipCard.cornerManager) {
                    const extraPosition = context.shipCard.cornerManager.getNextShipPosition(
                        context.shipCard.position,
                        context.shipCard.getCurrentDirection()!
                    );
                    const extraShipCard = context.shipCard;
                    extraShipCard.position = extraPosition;
                    context.positionSystem.swapPositions(context.shipCard.position, extraPosition);
                    return {
                        ...context,
                        shipCard: extraShipCard,
                        positionSystem: context.positionSystem
                    };
                }
                return context;
            }
        }
    },
    pirates: {
        back: {
            id: 'pirates',
            lives: 0,
            requirements: '_ship-sailing',
            type: 'back' as CardType,
            emoji: '🏴‍☠️',
            description: 'Срабатывает, когда корабль уже плывет',
            onPlace: (context) => {
                if (context.shipCard && !context.shipCard.getCurrentSide().skipMove) {
                    context.positionSystem.removePosition(context.shipCard.position);
                    // flip the pirates card
                    const piratesCard = context.positionSystem.getPosition(context.playerPosition!);
                    if (piratesCard) piratesCard.flip();
                    return {
                        ...context,
                        positionSystem: context.positionSystem,
                        shipCard: undefined
                    };
                }
                return context;
            }
        },
        front: {
            id: 'compass',
            lives: 0,
            type: 'front' as CardType,
            emoji: '🧭',
            description: 'Даёт дополнительный ход на выложенную карту',
            onRoundStart: (context) => {
                // Если компас есть на поле, movesLeft = 2
                return { ...context, movesLeft: 2 };
            }
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
            emoji: '🥃',
            onFlip: (context) => {
                // flip both map cards and add 1 life (rum effect)
                const card = context.positionSystem.getPosition(context.playerPosition!);
                if (card) {
                    // flip the other map card
                    const otherMapId = 'map-c';
                    const otherMapResult = context.positionSystem.findCardById(otherMapId);
                    if (otherMapResult) otherMapResult.card.flip();
                    // add 1 life
                    const { lives } = updateLives(context.lives, 1);
                    return { ...context, lives };
                }
                return context;
            }
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
            emoji: '💎',
            onFlip: (context) => {
                // flip both map cards and add 1 life (rum effect)
                const card = context.positionSystem.getPosition(context.playerPosition!);
                if (card) {
                    // flip the other map card
                    const otherMapId = 'map-r';
                    const otherMapResult = context.positionSystem.findCardById(otherMapId);
                    if (otherMapResult) otherMapResult.card.flip();
                    // add 1 life
                    const { lives } = updateLives(context.lives, 1);
                    return { ...context, lives };
                }
                return context;
            }
        }
    },
} as const; 

export const ship: CardSide = {
    id: 'ship',
    lives: 0,
    type: 'ship' as CardType,
    emoji: '⛵',
} as const; 