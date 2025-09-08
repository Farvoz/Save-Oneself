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

interface UpdateLivesResult {
    lives: number;
}

// Update lives (increase or decrease)
export const updateLives = (oldLives: number, lives: number): UpdateLivesResult => {
    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16
    
    return { lives: newLives };
};

// Card data objects
export const CARD_DATA: CardData = {
    vines: {
        back: {
            id: 'vines',
            direction: 'SW' as Direction,
            requirements: 'palm-trees',
            requirementsText: 'нужна 🌴',
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
            requirementsText: 'нужна 💧',
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
            requirementsText: 'нужна 🔭',
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
            requirementsText: 'нужна 🌿',
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
            requirementsText: 'нужна 🧱',
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
            requirementsText: 'нужна ⚡',
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
            requirementsText: 'нужен корабль на паузе',
            type: 'back' as CardType,
            emoji: '🍾',
            description: 'Позволяет отправить сообщение, если не угловая карта',
            canFlip: (context) => {
                const shipCard = context.positionSystem.getShipCard();
                return shipCard !== null && shipCard.skipMove;
            }
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
            requirementsText: 'нужна 🕯️',
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
            requirementsText: 'нужно быть на ⛰️',
            type: 'back' as CardType,
            emoji: '🔭',
            description: 'Позволяет увидеть полное движение корабля',
            canFlip: (context) => {
                // Проверяем, что игрок находится на higher-ground
                const playerCard = context.positionSystem.getPosition(context.playerPosition!);
                if (!playerCard || playerCard.getCurrentId() !== 'higher-ground') {
                    return false;
                }
                return true;
            }
        },
        front: {
            id: 'ship-sighted',
            score: 1,
            type: 'front' as CardType,
            emoji: '🚢',
            description: 'Корабль после угла поплывет дальше, но только один раз',
            onBeforeShipMove: (context) => {
                const shipPos = context.positionSystem.getShipPosition();
                const shipCard = context.positionSystem.getShipCard();
                if (!shipPos || !shipCard?.getCurrentDirection()) {
                    return context;
                }

                const isAtCorner = shipCard.cornerManager?.isFinalCornerShipPosition(shipPos) ?? false;

                if (!shipCard.hasTurned && isAtCorner && shipCard.cornerManager) {
                    // Корабль на углу и еще не поворачивал - меняем направление
                    const newDirection = shipCard.cornerManager.getNextDirection();
                    shipCard.direction = newDirection;
                    shipCard.hasTurned = true;
                }

                return context;
            }
        }
    },
    rocks: {
        back: {
            id: 'rocks',
            requirementsText: 'нужно быть на ⛰️',
            type: 'back' as CardType,
            emoji: '🧱',
            description: 'Позволяет выложить SOS в ряд',
            canFlip: (context) => {
                // Проверяем, что игрок находится на higher-ground
                const playerCard = context.positionSystem.getPosition(context.playerPosition!);
                if (!playerCard || playerCard.getCurrentId() !== 'higher-ground') {
                    return false;
                }
                return true;
            }
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
            requirementsText: 'нужна 🗡️',
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
            requirementsText: '13 карта',
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
            requirementsText: 'найти пересечение',
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
                const shipPos = context.positionSystem.getShipPosition();
                if (!shipPos) return context;
                const adjacentPositions = context.positionSystem.getAdjacentPositions(shipPos);
                const isAdjacent = adjacentPositions.some(adjPos => {
                    const card = context.positionSystem.getPosition(adjPos);
                    return card && card.getCurrentId() === 'sea-serpent';
                });
                const shipCard = context.positionSystem.getShipCard();
                if (isAdjacent && shipCard?.cornerManager) {
                    const extraPosition = shipCard.cornerManager.getNextShipPosition(
                        shipPos,
                        shipCard.getCurrentDirection()!
                    );
                    // Обновляем позицию корабля в positionSystem
                    context.positionSystem.setPosition(extraPosition, shipCard);
                    context.positionSystem.swapPositions(shipPos, extraPosition);
                    return {
                        ...context,
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
            requirementsText: 'ждать отплытие',
            type: 'back' as CardType,
            emoji: '🏴‍☠️',
            description: 'Срабатывает, когда корабль уже плывет',
            onBeforeShipMove: (context) => {
                const playerCard = context.positionSystem.getPosition(context.playerPosition!);
                const shipCard = context.positionSystem.getShipCard();
                if (shipCard && !shipCard.skipMove && playerCard?.getCurrentId() === 'pirates') {
                    // flip the pirates card
                    const newContext = playerCard!.flip(context);

                    newContext.positionSystem.removeShipPosition();

                    return {
                        ...newContext,
                        positionSystem: newContext.positionSystem
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
            type: 'back' as CardType,
            emoji: '👈🗺️👉',
            description: 'Сокровище где-то в этом ряду',
            canFlip: (context) => {
                // Both map cards must be on the board
                const mapRResult = context.positionSystem.findCardById('map-r');
                const mapCResult = context.positionSystem.findCardById('map-c');

                if (!mapRResult || !mapCResult) return false;

                // Player must be at the intersection of map-r row and map-c column
                return mapRResult.position.row === context.playerPosition!.row && 
                       mapCResult.position.col === context.playerPosition!.col;
            }
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
            type: 'back' as CardType,
            emoji: '👇🗺️☝️',
            description: 'Сокровище где-то в этой колонке',
            canFlip: (context) => {
                // Both map cards must be on the board
                const mapRResult = context.positionSystem.findCardById('map-r');
                const mapCResult = context.positionSystem.findCardById('map-c');

                if (!mapRResult || !mapCResult) return false;

                // Player must be at the intersection of map-r row and map-c column
                return mapRResult.position.row === context.playerPosition!.row && 
                       mapCResult.position.col === context.playerPosition!.col;
            }
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