import { Direction, CardType, CardSide } from './Card';
import { gameLogger } from './gameLogger';
import type { GameContext } from './initial';
import { InventoryItem } from './Inventory';

type CardKey = 'vines' | 'hook' | 'water' | 'flint' | 'palmTrees' | 'sticks' | 'bottle' | 
    'higherGround' | 'telescope' | 'rocks' | 'pig' | 'storm' | 'mirage' | 'pirates' | 'mapRow' | 'mapCol';

type CardData = {
    [key in CardKey]: {
        back: CardSide;
        front: CardSide;
    }
};

interface UpdateLivesResult {
    lives: number;
    hasGivenLives?: boolean;
}

// Update lives (increase or decrease)
export const updateLives = (oldLives: number, lives: number, hasGivenLives?: boolean): UpdateLivesResult => {
    // Для положительных жизней проверяем, не давала ли карта уже жизни
    if (lives > 0 && hasGivenLives) {
        gameLogger.info('Карта уже дала жизни, пропускаем', { lives: oldLives });
        return { lives: oldLives, hasGivenLives: true };
    }

    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16

    if (lives < 0) {
        gameLogger.info('Жизни уменьшены на ' + Math.abs(lives), { lives: newLives });
    } else {
        gameLogger.info('Жизни увеличены на ' + lives, { lives: newLives });
    }
    
    return { 
        lives: newLives, 
        hasGivenLives: lives > 0 ? true : hasGivenLives 
    };
};

// Вспомогательная функция для обновления жизней с проверкой карты
export const updateLivesWithCardCheck = (context: GameContext, cardId: string, lives: number): GameContext => {
    const hasGivenLives = context.cardsGivenLives.has(cardId);
    const { lives: newLives, hasGivenLives: newHasGivenLives } = updateLives(context.lives, lives, hasGivenLives);
    
    const newCardsGivenLives = new Set(context.cardsGivenLives);
    if (lives > 0 && newHasGivenLives) {
        newCardsGivenLives.add(cardId);
    }
    
    return {
        ...context,
        lives: newLives,
        cardsGivenLives: newCardsGivenLives
    };
};

const mapCardSide: CardSide = {
    id: 'map',
    russianName: 'Карта',
    type: 'back' as CardType,
    emoji: '🗺️',
    description: 'Полная карта сокровищ! Теперь я знаю, где искать сокровище!',
    addToInventory: true,
    canActivate: (context) => {
        // Обе части карты должны быть на поле
        const mapRResult = context.positionSystem.findCardById('map-r');
        const mapCResult = context.positionSystem.findCardById('map-c');

        if (!mapRResult || !mapCResult) return false;

        // Игрок должен быть на пересечении ряда map-r и колонки map-c
        return mapRResult.position.row === context.playerPosition!.row && 
               mapCResult.position.col === context.playerPosition!.col;
    },
    onPlace: (context) => {
        // Переворачиваем обе карты на поле
        const mapRResult = context.positionSystem.findCardById('map-r');
        const mapCResult = context.positionSystem.findCardById('map-c');
        
        let newContext = { ...context };
        
        if (mapRResult) {
            newContext = mapRResult.card.flip(newContext);
        }
        
        if (mapCResult) {
            newContext = mapCResult.card.flip(newContext);
        }
        
        // Удаляем карту из инвентаря после активации
        newContext = {
            ...newContext,
            inventory: newContext.inventory.removeById('map')
        };
        
        return newContext;
    }
};

// Card data objects
export const CARD_DATA: CardData = {
    vines: {
        back: {
            id: 'vines',
            russianName: 'Лианы',
            direction: 'SW' as Direction,
            requirements: 'palm-trees',
            requirementsText: 'нужна 🌴',
            type: 'back' as CardType,
            emoji: '🌿',
            description: 'В этих листьях можно спрятаться от шторма',
            addToInventory: true,
        },
        front: {
            id: 'shelter',
            russianName: 'Убежище',
            lives: 2,
            score: 2,
            type: 'front' as CardType,
            emoji: '🏠',
            description: 'Защищает от шторма',
            addToInventory: true,
            onPlace: (context) => {
                return updateLivesWithCardCheck(context, 'shelter', 2);
            }
        }
    },
    hook: {
        back: {
            id: 'hook',
            russianName: 'Крючок',
            direction: 'NE' as Direction,
            requirements: 'water',
            requirementsText: 'нужна 💧',
            type: 'back' as CardType,
            emoji: '🎣',
            description: 'Позволяет добыть питательную рыбу',
            addToInventory: true,
        },
        front: {
            id: 'fish',
            russianName: 'Рыба',
            lives: 3,
            type: 'front' as CardType,
            emoji: '🐟',
            description: 'Вкуснотища! Смогу ещё прожить на этом острове!',
            addToInventory: true,
            onPlace: (context) => {
                return updateLivesWithCardCheck(context, 'fish', 3);
            }
        }
    },
    water: {
        back: {
            id: 'water',
            russianName: 'Вода',
            lives: 2,
            requirements: 'telescope',
            requirementsText: 'нужна 🔭',
            type: 'back' as CardType,
            emoji: '💧',
            description: 'Позволяет освежиться и набрать сил',
            addToInventory: true,
            onPlace: (context) => {
                return updateLivesWithCardCheck(context, 'water', 2);
            }
        },
        front: {
            id: 'waterfall',
            russianName: 'Водопад',
            lives: 2,
            type: 'front' as CardType,
            emoji: '🌊',
            description: 'Здесь можно освежиться и набрать сил',
            addToInventory: true,
            onPlace: (context) => {
                return updateLivesWithCardCheck(context, 'waterfall', 2);
            }
        }
    },
    flint: {
        back: {
            id: 'flint',
            russianName: 'Кремень',
            requirements: 'vines',
            requirementsText: 'нужна 🌿',
            type: 'back' as CardType,
            emoji: '⚡',
            description: 'Можно сжечь эти листья и сделать костер',
            addToInventory: true,
        },
        front: {
            id: 'torch',
            russianName: 'Факел',
            score: 2,
            type: 'front' as CardType,
            emoji: '🕯️',
            description: 'Этот факел теперь можно отнести на вершину горы!',
            addToInventory: true,
        }
    },
    palmTrees: {
        back: {
            id: 'palm-trees',
            russianName: 'Пальмы',
            direction: 'SE' as Direction,
            requirements: 'rocks',
            requirementsText: 'нужна 🧱',
            type: 'back' as CardType,
            emoji: '🌴',
            description: 'А что я там вижу? Кокосы!',
            addToInventory: true,
        },
        front: {
            id: 'coconuts',
            russianName: 'Кокосы',
            lives: 2,
            type: 'front' as CardType,
            emoji: '🥥',
            description: 'Ммм, как вкусно!',
            addToInventory: true,
            onPlace: (context) => {
                return updateLivesWithCardCheck(context, 'coconut', 2);
            }
        }
    },
    sticks: {
        back: {
            id: 'sticks',
            russianName: 'Ветки',
            direction: 'NW' as Direction,
            requirements: 'flint',
            requirementsText: 'нужна ⚡',
            type: 'back' as CardType,
            emoji: '🥢',
            description: 'Хм, эти ветки могут пригодиться для охоты',
            addToInventory: true,
        },
        front: {
            id: 'spear',
            russianName: 'Копье',
            score: 2,
            type: 'front' as CardType,
            emoji: '🗡️',
            description: 'Теперь мне не страшен кабан! Скорее наоборот :)',
            addToInventory: true,
        }
    },
    bottle: {
        back: {
            id: 'bottle',
            russianName: 'Бутылка',
            requirementsText: 'нужен корабль в первой клетке',
            type: 'back' as CardType,
            emoji: '🍾',
            description: 'Кажется, я смогу оставить здесь сообщение! Главное, чтобы не на углу!',
            addToInventory: false,
            canActivate: (context) => {
                const shipCard = context.positionSystem.getShipCard();
                return shipCard !== null && shipCard.skipMove;
            }
        },
        front: {
            id: 'message',
            russianName: 'Сообщение',
            score: 3,
            type: 'front' as CardType,
            emoji: '📜',
            description: 'Если корабль пройдет рядом с этой клеткой и она не угловая, то я выиграю!',
            addToInventory: false,
            onShipMove: (context) => {
                if (context.gameOverMessage) return context;
                const shipPos = context.positionSystem.getShipPosition();
                const messageResult = context.positionSystem.findCardById('message');
                if (!shipPos || !messageResult) return context;

                const shipCard = context.positionSystem.getShipCard();
                const isCorner = shipCard?.cornerManager?.isIslandCornerCard(messageResult.position) ?? false;
                if (isCorner) return context;

                const isAdjacent = context.positionSystem.isAdjacent(shipPos, messageResult.position);
                if (isAdjacent) {
                    return {
                        ...context,
                        gameOverMessage: 'Победа! Корабль нашёл моё сообщение!',
                        isVictory: true
                    };
                }
                return context;
            }
        }
    },
    higherGround: {
        back: {
            id: 'higher-ground',
            russianName: 'Возвышенность',
            requirements: 'torch',
            requirementsText: 'нужна 🕯️',
            type: 'back' as CardType,
            emoji: '⛰️',
            description: 'Отсюда открывается потрясающий вид на остров!',
            addToInventory: false,
        },
        front: {
            id: 'lit-beacon',
            russianName: 'Костёр',
            score: 7,
            type: 'front' as CardType,
            emoji: '🔥',
            description: 'Если корабль пересекает эту колонку, то я выиграю!',
            addToInventory: false,
            onShipMove: (context) => {
                if (context.gameOverMessage) return context;
                const shipPos = context.positionSystem.getShipPosition();
                const beaconResult = context.positionSystem.findCardById('lit-beacon');
                if (shipPos && beaconResult && shipPos.col === beaconResult.position.col) {
                    return {
                        ...context,
                        gameOverMessage: 'Победа! Корабль заметил костёр!',
                        isVictory: true
                    };
                }
                return context;
            }
        }
    },
    telescope: {
        back: {
            id: 'telescope',
            russianName: 'Подзорная труба',
            requirementsText: 'нужно быть на ⛰️',
            type: 'back' as CardType,
            emoji: '🔭',
            description: 'Теперь я смогу увидеть полное движение корабля! Хм, он огибает остров?',
            addToInventory: true,
            canActivate: (context) => {
                // Проверяем, что игрок находится на higher-ground
                const playerCard = context.positionSystem.getCard(context.playerPosition!);
                if (!playerCard || playerCard.getCurrentId() !== 'higher-ground') {
                    return false;
                }
                return true;
            }
        },
        front: {
            id: 'ship-sighted',
            russianName: 'Корабль замечен',
            score: 1,
            type: 'front' as CardType,
            emoji: '🚢',
            description: 'Корабль после угла поплывет дальше, но только один раз',
            addToInventory: true,
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
            russianName: 'Камни',
            requirementsText: 'нужно быть на ⛰️',
            type: 'back' as CardType,
            emoji: '🧱',
            description: 'Я смогу подать SOS в этом ряду! Но как лучше увидеть склон?',
            addToInventory: false,
            canActivate: (context) => {
                // Проверяем, что игрок находится на higher-ground
                const playerCard = context.positionSystem.getCard(context.playerPosition!);
                if (!playerCard || playerCard.getCurrentId() !== 'higher-ground') {
                    return false;
                }
                return true;
            }
        },
        front: {
            id: 'sos',
            russianName: 'SOS',
            score: 5,
            type: 'front' as CardType,
            emoji: '🆘',
            description: 'Если корабль пересекает этот ряд, то я выиграю!',
            addToInventory: false,
            onShipMove: (context) => {
                if (context.gameOverMessage) return context;
                const shipPos = context.positionSystem.getShipPosition();
                const sosResult = context.positionSystem.findCardById('sos');
                if (shipPos && sosResult && shipPos.row === sosResult.position.row) {
                    return {
                        ...context,
                        gameOverMessage: 'Победа! Корабль заметил сигнал SOS!',
                        isVictory: true
                    };
                }
                return context;
            }
        }
    },
    pig: {
        back: {
            id: 'pig',
            russianName: 'Кабан',
            lives: -2,
            requirements: 'spear',
            requirementsText: 'нужна 🗡️',
            type: 'back' as CardType,
            emoji: '🐷',
            description: 'Дикий кабан меня поранил! А что, если я его добуду?',
            addToInventory: false,
            onPlace: (context) => {
                // Если есть spear или torch, урон не наносится
                const isProtected = context.inventory.findById('spear') || context.inventory.findById('torch');
                if (!isProtected) {
                    const { lives } = updateLives(context.lives, -2, false);
                    return { ...context, lives };
                }
                return context;
            }
        },
        front: {
            id: 'meat',
            russianName: 'Мясо',
            lives: 3,
            type: 'front' as CardType,
            emoji: '🍽️',
            description: 'Ммм, то-то же!',
            addToInventory: false,
            onPlace: (context) => {
                return updateLivesWithCardCheck(context, 'meat', 3);
            }
        }
    },
    storm: {
        back: {
            id: 'storm',
            russianName: 'Шторм',
            lives: -2,
            requirementsText: '13 карта',
            type: 'back' as CardType,
            emoji: '🌧️',
            description: 'Меня настиг шторм! Где бы мне укрыться... Что, это приближается торнадо?!',
            addToInventory: false,
            onPlace: (context) => {
                // Если есть shelter, урон не наносится
                const isProtected = context.inventory.findById('shelter');
                if (!isProtected) {
                    const { lives } = updateLives(context.lives, -2, false);
                    return { ...context, lives };
                }
                return context;
            },
            afterPlace: (context) => {
                let newContext = context;
                if (context.positionSystem.countNonShipCards() === 13) {
                    const stormResult = context.positionSystem.findCardById('storm');
                    if (stormResult) {
                        newContext = stormResult.card.flip(context);
                    }
                }
                return newContext;
            }
        },
        front: {
            id: 'tornado',
            russianName: 'Торнадо',
            lives: -3,
            type: 'front' as CardType,
            emoji: '🌪️',
            description: 'Уничтожает убежище и костер, а затем переворачивается обратно',
            addToInventory: false,
            onPlace: (context) => {
                let newLives = context.lives;
                let newContext = context;

                const tornadoResult = context.positionSystem.findCardById('tornado');
                const playerPosition = context.playerPosition;

                if (tornadoResult?.position.equals(playerPosition!)) {
                    const { lives } = updateLives(context.lives, -3, false);
                    newLives = lives;
                }

                // flip shelter and lit beacon back
                const shelterItem = context.inventory.findById('shelter');
                if (shelterItem) newContext = shelterItem.activate(newContext);

                const litBeaconResult = context.positionSystem.findCardById('lit-beacon');
                if (litBeaconResult) newContext = litBeaconResult.card.flip(newContext);
                
                // flip tornado back
                newContext = tornadoResult!.card.flip(newContext);

                return { ...newContext, lives: newLives };
            }
        }
    },
    mirage: {
        back: {
            id: 'mirage',
            russianName: 'Мираж',
            requirementsText: 'при вскрытии',
            type: 'back' as CardType,
            emoji: '🌫️',
            description: 'Сразу же заменяет самую дальнюю карту и переворачивается',
            addToInventory: false,
            onPlace: (context) => {
                const farthestPos = context.positionSystem.findFarthestPosition(context.playerPosition!);
                let newContext = context;

                if (farthestPos) {
                    newContext.positionSystem.swapPositions(context.playerPosition!, farthestPos);

                    // Срабатывает эффект onPlace у замененной карты, если не единственная карта на поле
                    const swappedCard = context.positionSystem.getCard(context.playerPosition!);
                    if (swappedCard && newContext.positionSystem.countNonShipCards() !== 1) {
                        newContext = swappedCard.getCurrentSide().onPlace?.(newContext) ?? newContext;
                    }   

                    // flip the mirage card after swap
                    const card = context.positionSystem.getCard(farthestPos);
                    if (card) newContext = card.flip(newContext);
                }
                return { ...newContext, positionSystem: newContext.positionSystem };
            }
        },
        front: {
            id: 'sea-serpent',
            russianName: 'Морской змей',
            type: 'front' as CardType,
            emoji: '🐍',
            description: 'Корабль перескочет соседнюю клетку - лучше не оставлять на берегу',
            addToInventory: false,
            onShipMove: (context) => {
                const shipPos = context.positionSystem.getShipPosition();
                if (!shipPos) return context;
                const adjacentPositions = context.positionSystem.getAdjacentPositions(shipPos);
                const isAdjacent = adjacentPositions.some(adjPos => {
                    const card = context.positionSystem.getCard(adjPos);
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
            russianName: 'Пираты',
            requirementsText: 'ждать отплытие корабля',
            type: 'back' as CardType,
            emoji: '🏴‍☠️',
            description: 'Кажется, я вижу пиратов? Тогда нам не по пути...',
            addToInventory: true,
            onBeforeShipMove: (context) => {
                const thisItem = context.inventory.findById('pirates');
                const shipCard = context.positionSystem.getShipCard();
                
                if (shipCard && !shipCard.skipMove) {
                    const newContext = thisItem!.activate(context);

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
            russianName: 'Компас',
            type: 'front' as CardType,
            emoji: '🧭',
            description: 'Удача! Я нашел компас! Теперь смогу быстрее двигаться по изученным местам!',
            addToInventory: true,
            onRoundStart: (context) => {
                // Если компас есть на поле, movesLeft = 2
                return { ...context, movesLeft: 2 };
            }
        }
    },
    mapRow: {
        back: {
            id: 'map-r',
            russianName: 'Карта сокровищ 1/2',
            type: 'back' as CardType,
            emoji: '👈🗺️👉',    
            description: 'Я нашел часть карты! Кажется, сокровище где-то в этом ряду',
            addToInventory: false,
            clickable: false,
            canActivate: (context) => {
                // Both map cards must be on the board
                const mapRResult = context.positionSystem.findCardById('map-r');
                const mapCResult = context.positionSystem.findCardById('map-c');

                if (!mapRResult || !mapCResult) return false;

                // Player must be at the intersection of map-r row and map-c column
                return mapRResult.position.row === context.playerPosition!.row && 
                       mapCResult.position.col === context.playerPosition!.col;
            },
            onPlace: (context) => {
                // Проверяем, есть ли вторая часть карты (map-c)
                const mapCResult = context.positionSystem.findCardById('map-c');
                const mapInInventory = context.inventory.findById('map');

                if (mapCResult && !mapInInventory) {
                    // Если есть вторая часть, добавляем карту в инвентарь
                    const mapInventoryItem = new InventoryItem(mapCardSide, mapCardSide);
                    
                    return {
                        ...context,
                        inventory: context.inventory.add(mapInventoryItem)
                    };
                }
                
                return context;
            }
        },
        front: {
            id: 'rum',
            russianName: 'Ром',
            lives: 1,
            type: 'front' as CardType,
            emoji: '🥃',
            description: 'Ром! Можно набрать сил!',
            addToInventory: false,
            onPlace: (context) => {
                const card = context.positionSystem.getCard(context.playerPosition!);
                if (card) {
                    return updateLivesWithCardCheck(context, 'rum', 1);
                }
                return context;
            }
        }
    },
    mapCol: {
        back: {
            id: 'map-c',
            russianName: 'Карта сокровищ 2/2',
            type: 'back' as CardType,   
            emoji: '👇🗺️☝️',
            description: 'Я нашел часть карты! Кажется, сокровище где-то в этой колонке',
            addToInventory: false,
            clickable: false,
            canActivate: (context) => {
                // Both map cards must be on the board
                const mapRResult = context.positionSystem.findCardById('map-r');
                const mapCResult = context.positionSystem.findCardById('map-c');

                if (!mapRResult || !mapCResult) return false;

                // Player must be at the intersection of map-r row and map-c column
                return mapRResult.position.row === context.playerPosition!.row && 
                       mapCResult.position.col === context.playerPosition!.col;
            },
            onPlace: (context) => {
                // Проверяем, есть ли первая часть карты (map-r)
                const mapRResult = context.positionSystem.findCardById('map-r');
                const mapInInventory = context.inventory.findById('map');
                
                if (mapRResult && !mapInInventory) {
                    // Если есть первая часть, добавляем карту в инвентарь
                    const mapInventoryItem = new InventoryItem(mapCardSide, mapCardSide);
                    
                    return {
                        ...context,
                        inventory: context.inventory.add(mapInventoryItem)
                    };
                }
                
                return context;
            }
        },
        front: {
            id: 'treasure',
            russianName: 'Сокровище',
            score: 10,
            type: 'front' as CardType,
            emoji: '💎',    
            description: 'Тепер это сокровище моё! Осталось только выбраться с острова...',
            addToInventory: false,
        }
    },
} as const; 

export const ship: CardSide = {
    id: 'ship',
    russianName: 'Корабль',
    type: 'ship' as CardType,
    emoji: '⛵',
    description: 'Корабль плывет вдоль берега. Нужно как-то привлечь его внимание!',
    addToInventory: false,
} as const; 