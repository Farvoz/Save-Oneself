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
            description: 'В этих листьях можно спрятаться от шторма',
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
            description: 'Позволяет добыть питательную рыбу'
        },
        front: {
            id: 'fish',
            lives: 3,
            type: 'front' as CardType,
            emoji: '🐟',
            description: 'Вкуснотища! Смогу ещё прожить на этом острове!',
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
            description: 'Позволяет освежиться и набрать сил',
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
            description: 'Здесь можно освежиться и набрать сил',
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
            description: 'Можно сжечь эти листья и сделать костер'
        },
        front: {
            id: 'torch',
            score: 2,
            type: 'front' as CardType,
            emoji: '🕯️',
            description: 'Этот факел теперь можно отнести на вершину горы!'
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
            description: 'А что я там вижу? Кокосы!'
        },
        front: {
            id: 'coconuts',
            lives: 2,
            type: 'front' as CardType,
            emoji: '🥥',
            description: 'Ммм, как вкусно!',
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
            description: 'Хм, эти ветки могут пригодиться для охоты'
        },
        front: {
            id: 'spear',
            score: 2,
            type: 'front' as CardType,
            emoji: '🗡️',
            description: 'Теперь мне не страшен кабан! Скорее наоборот :)'
        }
    },
    bottle: {
        back: {
            id: 'bottle',
            requirementsText: 'нужен корабль на паузе',
            type: 'back' as CardType,
            emoji: '🍾',
            description: 'Кажется, я смогу оставить здесь сообщение! Главное, чтобы не на углу!',
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
            description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то я выиграю!'
        }
    },
    higherGround: {
        back: {
            id: 'higher-ground',
            requirements: 'torch',
            requirementsText: 'нужна 🕯️',
            type: 'back' as CardType,
            emoji: '⛰️',
            description: 'Отсюда открывается потрясающий вид на остров!'
        },
        front: {
            id: 'lit-beacon',
            score: 7,
            type: 'front' as CardType,
            emoji: '🔥',
            description: 'Если корабль пересекает эту колонку, то я выиграю!'
        }
    },
    telescope: {
        back: {
            id: 'telescope',
            requirementsText: 'нужно быть на ⛰️',
            type: 'back' as CardType,
            emoji: '🔭',
            description: 'Теперь я смогу увидеть полное движение корабля! Хм, он огибает остров?',
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
                if (!shipPos || !shipCard?.cornerManager.direction) {
                    return context;
                }

                const isAtCorner = shipCard.cornerManager?.isFinalCornerShipPosition(shipPos) ?? false;

                if (!shipCard.hasTurned && isAtCorner && shipCard.cornerManager) {
                    // Корабль на углу и еще не поворачивал - меняем направление
                    const newDirection = shipCard.cornerManager.getNextDirection();
                    shipCard.cornerManager.direction = newDirection;
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
            description: 'Я смогу подать SOS в этом ряду! Но как лучше увидеть склон?',
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
            description: 'Если корабль пересекает этот ряд, то я выиграю!'
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
            description: 'Дикий кабан меня поранил! А что, если я его добуду?',
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
            description: 'Ммм, то-то же!',
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
            description: 'Меня настиг шторм! Где бы мне укрыться... Что, это приближается торнадо?!',
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
                    const tornadoCard = context.positionSystem.findCardById('tornado');
                    if (tornadoCard) tornadoCard.card.flip(context);
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
            description: 'Корабль перескочет соседнюю клетку - лучше не оставлять на берегу',
            onShipMove: (context) => {
                const shipPos = context.positionSystem.getShipPosition();
                if (!shipPos) return context;
                const adjacentPositions = context.positionSystem.getAdjacentPositions(shipPos);
                const isAdjacent = adjacentPositions.some(adjPos => {
                    const card = context.positionSystem.getPosition(adjPos);
                    return card && card.getCurrentId() === 'sea-serpent';
                });
                const shipCard = context.positionSystem.getShipCard();
                if (isAdjacent && shipCard) {
                    const extraPosition = shipCard.cornerManager.getNextShipPosition(
                        shipPos
                    );
                    // Обновляем позицию корабля в positionSystem
                    context.positionSystem.moveShip(extraPosition);
                    
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
            description: 'Кажется, я вижу пиратов? Тогда нам не по пути...',
            onBeforeShipMove: (context) => {
                const thisCard = context.positionSystem.findCardById('pirates');
                const shipCard = context.positionSystem.getShipCard();
                
                if (shipCard && !shipCard.skipMove) {
                    const newContext = thisCard!.card.flip(context);

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
            description: 'Удача! Я нашел компас! Теперь смогу быстрее двигаться по изученным местам!',
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
            description: 'Я нашел часть карты! Кажется, сокровище где-то в этом ряду',
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
            description: 'Ром! Можно набрать сил!',
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
            description: 'Я нашел часть карты! Кажется, сокровище где-то в этой колонке',
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
            description: 'Тепер это сокровище моё! Осталось только выбраться с острова...',
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
    description: 'Корабль плывет вдоль берега',
} as const; 