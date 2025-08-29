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
            direction: 'SW' as Direction,
            requirements: 'palm-trees',
            type: 'back' as CardType,
            emoji: '🌿',
            description: 'Позволяет сделать убежище',
            onFlip: (context) => {
                const { lives } = updateLives(context.lives, 2);
                return { ...context, lives };
            }
        },
        front: {
            id: 'shelter',
            lives: 2,
            score: 2,
            type: 'front' as CardType,
            emoji: '🏠',
            description: 'Защищает от шторма',
            onFlip: (context) => {
                const { lives } = updateLives(context.lives, 2);
                return { ...context, lives };
            }
        }
    },
    hook: {
        back: {
            id: 'hook',
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
            emoji: '🐟',
            onFlip: (context) => {
                const { lives } = updateLives(context.lives, 3);
                return { ...context, lives };
            }
        }
    },
    water: {
        back: {
            id: 'water',
            lives: 2,
            requirements: 'telescope',
            type: 'back' as CardType,
            emoji: '💧',
            description: 'Позволяет освежиться',
            onPlace: (context) => {
                const { lives } = updateLives(context.lives, 2);
                return { ...context, lives };
            }
        },
        front: {
            id: 'waterfall',
            lives: 2,
            type: 'front' as CardType,
            emoji: '🌊',
            onFlip: (context) => {
                const { lives } = updateLives(context.lives, 2);
                return { ...context, lives };
            }
        }
    },
    flint: {
        back: {
            id: 'flint',
            requirements: 'vines',
            type: 'back' as CardType,
            emoji: '⚡',
            description: 'Позволяет сделать огонь'
        },
        front: {
            id: 'torch',
            score: 2,
            type: 'front' as CardType,
            emoji: '🕯️'
        }
    },
    palmTrees: {
        back: {
            id: 'palm-trees',
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
            emoji: '🥥',
            onFlip: (context) => {
                const { lives } = updateLives(context.lives, 2);
                return { ...context, lives };
            }
        }
    },
    sticks: {
        back: {
            id: 'sticks',
            direction: 'NW' as Direction,
            requirements: 'flint',
            type: 'back' as CardType,
            emoji: '🥢',
            description: 'Позволяет сделать копье для охоты'
        },
        front: {
            id: 'spear',
            score: 2,
            type: 'front' as CardType,
            emoji: '🗡️',
            description: 'Защищает от кабана'
        }
    },
    bottle: {
        back: {
            id: 'bottle',
            requirements: '_ship-set-sail',
            type: 'back' as CardType,
            emoji: '🍾',
            description: 'Позволяет отправить сообщение, если не угловая карта'
        },
        front: {
            id: 'message',
            score: 3,
            type: 'front' as CardType,
            emoji: '📜',
            description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то вы выигрываете!'
        }
    },
    higherGround: {
        back: {
            id: 'higher-ground',
            requirements: 'torch',
            type: 'back' as CardType,
            emoji: '⛰️',
            description: 'Здесь доступно много действий'
        },
        front: {
            id: 'lit-beacon',
            score: 7,
            type: 'front' as CardType,
            emoji: '🔥',
            description: 'Если корабль пересекает этот колонку, то вы выигрываете!'
        }
    },
    telescope: {
        back: {
            id: 'telescope',
            requirements: 'higher-ground',
            type: 'back' as CardType,
            emoji: '🔭',
            description: 'Позволяет увидеть полное движение корабля'
        },
        front: {
            id: 'ship-sighted',
            score: 1,
            type: 'front' as CardType,
            emoji: '🚢',
            description: 'Корабль после угла поплывет дальше, но только один раз',
            onBeforeShipMove: (context) => {
                if (!context.shipCard?.position || !context.shipCard?.getCurrentDirection()) {
                    return context;
                }

                const isAtCorner = context.shipCard.cornerManager?.isFinalCornerShipPosition(context.shipCard.position) ?? false;

                if (!context.shipCard.hasTurned && isAtCorner && context.shipCard.cornerManager) {
                    // Корабль на углу и еще не поворачивал - меняем направление
                    const newDirection = context.shipCard.cornerManager.getNextDirection();
                    context.shipCard.direction = newDirection;
                    context.shipCard.hasTurned = true;
                }

                return context;
            }
        }
    },
    rocks: {
        back: {
            id: 'rocks',
            requirements: 'higher-ground',
            type: 'back' as CardType,
            emoji: '🧱',
            description: 'Позволяет выложить SOS в ряд'
        },
        front: {
            id: 'sos',
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
            emoji: '🍽️',
            onFlip: (context) => {
                const { lives } = updateLives(context.lives, 3);
                return { ...context, lives };
            }
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
                        stormResult.card.flip(context);
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
                const { lives } = updateLives(context.lives, -3);

                // tornado flips back, and also flips shelter and lit beacon back
                if (context.positionSystem.countNonShipCards() === 13) {
                    // flip tornado back
                    const tornadoCard = context.positionSystem.getPosition(context.playerPosition!);
                    if (tornadoCard) tornadoCard.flip(context);
                    // flip shelter and lit beacon back
                    const shelterResult = context.positionSystem.findCardById('shelter');
                    const litBeaconResult = context.positionSystem.findCardById('lit-beacon');
                    if (shelterResult) shelterResult.card.flip(context);
                    if (litBeaconResult) litBeaconResult.card.flip(context);
                }
                return { ...context, lives };
            }
        }
    },
    mirage: {
        back: {
            id: 'mirage',
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
                    if (card) card.flip(context);
                }
                return { ...context, positionSystem: context.positionSystem };
            }
        },
        front: {
            id: 'sea-serpent',
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
            requirements: '_ship-sailing',
            type: 'back' as CardType,
            emoji: '🏴‍☠️',
            description: 'Срабатывает, когда корабль уже плывет',
            onPlace: (context) => {
                if (context.shipCard && !context.shipCard.getCurrentSide().skipMove) {
                    context.positionSystem.removePosition(context.shipCard.position);
                    // flip the pirates card
                    const piratesCard = context.positionSystem.getPosition(context.playerPosition!);
                    if (piratesCard) piratesCard.flip(context);
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
                    if (otherMapResult) otherMapResult.card.flip(context);
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
            requirements: '_map',
            type: 'back' as CardType,
            emoji: '👇🗺️☝️',
            description: 'Сокровище где-то в этой колонке'
        },
        front: {
            id: 'treasure',
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
                    if (otherMapResult) otherMapResult.card.flip(context);
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
    type: 'ship' as CardType,
    emoji: '⛵',
} as const; 