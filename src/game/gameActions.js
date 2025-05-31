import { INITIAL_FRONT_DECK, INITIAL_SHIP } from './gameData';
import { gameLogger } from './gameLogger';
import { isCornerShip } from './gameRules';
import { Position, PositionSystem } from './positionSystem';


// Helper function to handle negative card effects
export const handleNegativeEffects = (card, positionSystem, lives) => {
    if (card.lives < 0) {
        // Check if there's protection from negative effects
        const isProtected = positionSystem.findCardById('spear') && card.id === 'pig' 
            || positionSystem.findCardById('shelter') && card.id === 'storm';

        if (!isProtected) {
            const { lives: newLives } = updateLives(lives, card.lives);
            return newLives;
        }
    }
    return lives;
};

// Move the player to a new position
export const movePlayer = (context, newPosition) => {
    let newPositionSystem = context.positionSystem;
    let newDeck = context.deck;
    let newLives = context.lives;
    let newShipCard = context.shipCard;
    let hasPlacedCard = context.hasPlacedCard;
    let movesLeft = context.movesLeft;

    let card = newPositionSystem.getPosition(newPosition);

    // если карта не существует, то placeCard
    if (!card) {
        // если колода пуста, то игра окончена
        if (context.deck.length === 0) {
            return {
                gameOverMessage: 'Игра окончена! Колода пуста.',
                isVictory: false
            };
        }

        const { positionSystem, deck, cardObj, lives } = placeCard(context, newPosition);
        newPositionSystem = positionSystem;
        newDeck = deck;
        card = cardObj;
        newLives = lives;
        hasPlacedCard = true;

        // --- Эффекты при вскрытии карты ---

        // Если выложена карта mirage, меняем её местами с самой дальней картой
        // А также должен сработать эффект перемещённой карты
        if (card.id === 'mirage') {
            const farthestPos = newPositionSystem.findFarthestPosition(newPosition);
            const farthestCard = newPositionSystem.getPosition(farthestPos);
            if (farthestPos) {
                // Меняем карты местами
                newPositionSystem.swapPositions(newPosition, farthestPos);
                // Переворачиваем mirage
                const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'mirage');
                newPositionSystem.setPosition(farthestPos, frontCard);
            }

            // Применяем эффект перемещённой карты
            newLives = handleNegativeEffects(farthestCard, newPositionSystem, newLives);
        }

        // если карта с направлением и нет других кораблей, то размещается корабль
        if (card.direction && !context.shipCard.direction) {
            const { shipCard, positionSystem } = placeShip(newPositionSystem, card.direction);
            newPositionSystem = positionSystem;
            newShipCard = shipCard;
        }
    }

    // --- Эффекты при перемещении игрока ---

    // если карта с отрицательными жизнями, то уменьшается жизнь (каждый раз)
    newLives = handleNegativeEffects(card, newPositionSystem, newLives);
    
    // Проверяем эффект пиратов
    if (card.id === 'pirates' && !context.shipCard.skipMove) {
        // Удаляем корабль из игры
        newPositionSystem.removePosition(Position.fromString(context.shipCard.position));
        newShipCard = { ...INITIAL_SHIP };
        
        // Переворачиваем карту пиратов
        const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'pirates');
        newPositionSystem.setPosition(newPosition, frontCard);
    }

    // Уменьшаем количество оставшихся ходов
    movesLeft--;

    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition.toString(),
        positionSystem: newPositionSystem,
        deck: newDeck,
        lives: newLives,
        shipCard: newShipCard,
        hasPlacedCard,
        movesLeft,
        hasMoved: true
    };
};

// Shuffle the deck
export const shuffleDeck = (context) => {
    const deck = [...context.deck];
    deck.sort(() => Math.random() - 0.5);
    return { deck };
};

// Place a card on the board
export const placeCard = (context, pos) => {
    const newPositionSystem = new PositionSystem();
    context.positionSystem.occupiedPositions.forEach((value, key) => {
        newPositionSystem.occupiedPositions.set(key, value);
    });

    const cardObj = context.deck[context.deck.length - 1];
    const newDeck = context.deck.slice(0, -1);
    let newLives = context.lives;

    newPositionSystem.setPosition(pos, cardObj);

    // если карта с жизнями, то восстанавливается жизнь (только 1 раз при вскрытии)
    if (cardObj.lives > 0) {
        const { lives } = updateLives(context.lives, cardObj.lives);
        newLives = lives;
    }
    
    return {
        positionSystem: newPositionSystem,
        deck: newDeck,
        cardObj: cardObj,
        lives: newLives
    };
};

// Place the ship on the board
export const placeShip = (positionSystem, direction) => {
    const bounds = positionSystem.getBounds();
    let shipRow, shipCol;

    // Set corner coordinates based on direction
    let cornerCoordinates;
    switch(direction) {
        case 'NW': 
            shipRow = bounds.minRow - 1; 
            shipCol = bounds.minCol - 1;
            cornerCoordinates = {
                topLeft: [bounds.minRow, bounds.minCol],
                topRight: [bounds.minRow, bounds.minCol + 3],
                bottomLeft: [bounds.minRow + 3, bounds.minCol],
                bottomRight: [bounds.minRow + 3, bounds.minCol + 3]
            };
            break;
        case 'NE': 
            shipRow = bounds.minRow - 1; 
            shipCol = bounds.maxCol + 1;
            cornerCoordinates = {
                topLeft: [bounds.minRow, bounds.maxCol - 3],
                topRight: [bounds.minRow, bounds.maxCol],
                bottomLeft: [bounds.minRow + 3, bounds.maxCol - 3],
                bottomRight: [bounds.minRow + 3, bounds.maxCol]
            };
            break;
        case 'SW': 
            shipRow = bounds.maxRow + 1; 
            shipCol = bounds.minCol - 1;
            cornerCoordinates = {
                topLeft: [bounds.maxRow - 3, bounds.minCol],
                topRight: [bounds.maxRow - 3, bounds.minCol + 3],
                bottomLeft: [bounds.maxRow, bounds.minCol],
                bottomRight: [bounds.maxRow, bounds.minCol + 3]
            };
            break;
        case 'SE': 
            shipRow = bounds.maxRow + 1; 
            shipCol = bounds.maxCol + 1;
            cornerCoordinates = {
                topLeft: [bounds.maxRow - 3, bounds.maxCol - 3],
                topRight: [bounds.maxRow - 3, bounds.maxCol],
                bottomLeft: [bounds.maxRow, bounds.maxCol - 3],
                bottomRight: [bounds.maxRow, bounds.maxCol]
            };
            break;
    }

    const shipPosition = new Position(shipRow, shipCol);
    const newShipCard = {
        ...INITIAL_SHIP,
        direction,
        position: shipPosition.toString(),
        cornerCoordinates
    };

    // Add ship to occupied positions
    const newPositionSystem = new PositionSystem();
    positionSystem.occupiedPositions.forEach((value, key) => {
        newPositionSystem.occupiedPositions.set(key, value);
    });
    newPositionSystem.setPosition(shipPosition, newShipCard);

    return {
        shipCard: newShipCard,
        positionSystem: newPositionSystem
    };
};

// Flip a card
export const flipCard = (context, pos) => {
    const cardObj = context.positionSystem.getPosition(pos);
    const frontCard = INITIAL_FRONT_DECK.find(card => card.backId === cardObj.id);
    
    // Размещает перевернутую карту на поле
    context.positionSystem.setPosition(pos, frontCard);
    
    // Обновляет жизни
    const { lives } = updateLives(context.lives, frontCard.lives);
    let newLives = lives;

    // Если это tornado, то переворачиваем обратно
    if (context.positionSystem.countNonShipCards() === 13 && frontCard.id === 'tornado') {
        context.positionSystem.setPosition(pos, cardObj);

        // А также переворачивает обратно shelter и lit beacon
        const shelterResult = context.positionSystem.findCardById('shelter');
        const litBeaconResult = context.positionSystem.findCardById('lit-beacon');
        if (shelterResult) {
            context.positionSystem.setPosition(shelterResult.position, INITIAL_DECK.find(card => card.id === 'vines'));
        }
        if (litBeaconResult) {
            context.positionSystem.setPosition(litBeaconResult.position, INITIAL_DECK.find(card => card.id === 'higher-ground'));
        }
    }

    // Если это одна из карт сокровищ, переворачиваем обе
    if (cardObj.id === 'map-r' || cardObj.id === 'map-c') {
        // Находим и переворачиваем вторую карту сокровищ
        const otherMapId = cardObj.id === 'map-r' ? 'map-c' : 'map-r';
        const otherMapResult = context.positionSystem.findCardById(otherMapId);
        const otherFrontCard = INITIAL_FRONT_DECK.find(card => card.backId === otherMapId);
        context.positionSystem.setPosition(otherMapResult.position, otherFrontCard);

        // Увеличиваем количество жизней на 1 - эффект rum
        const { lives } = updateLives(newLives, 1);
        newLives = lives
    }
    
    return {
        positionSystem: context.positionSystem,
        lives: newLives
    };
};

// Helper function to calculate new ship position based on direction
const calculateNewShipPosition = (pos, direction) => {
    let newRow = pos.row, newCol = pos.col;
    
    switch(direction) {
        case 'NE': newRow++; break;
        case 'SE': newCol--; break;
        case 'SW': newRow--; break;
        case 'NW': newCol++; break;
    }
    
    return new Position(newRow, newCol);
};

// Helper function to handle sea serpent extra move
const handleSeaSerpentExtraMove = (shipCard, positionSystem, pos, direction) => {
    const adjacentPositions = positionSystem.getAdjacentPositions(pos);

    const hasSeaSerpent = adjacentPositions.some(adjPos => {
        const card = positionSystem.getPosition(adjPos);
        return card && card.id === 'sea-serpent';
    });

    if (!hasSeaSerpent) {
        return {
            shipCard,
            positionSystem
        };
    }

    const extraPosition = calculateNewShipPosition(pos, direction);
    const extraShipCard = {
        ...shipCard,
        position: extraPosition.toString()
    };

    // Update occupied positions
    const newPositionSystem = new PositionSystem();
    positionSystem.occupiedPositions.forEach((value, key) => {
        newPositionSystem.occupiedPositions.set(key, value);
    });
    newPositionSystem.removePosition(Position.fromString(shipCard.position));
    newPositionSystem.setPosition(extraPosition, extraShipCard);

    return {
        shipCard: extraShipCard,
        positionSystem: newPositionSystem
    };
};


// Move the ship
export const moveShip = (context) => {
    if (!context.shipCard.position || !context.shipCard.direction) {
        return {
            shipCard: context.shipCard,
            positionSystem: context.positionSystem
        };
    }

    // Если корабль должен пропустить ход, просто сбрасываем флаг
    if (context.shipCard.skipMove) {
        const newShipCard = {
            ...context.shipCard,
            skipMove: false
        };
        return {
            shipCard: newShipCard,
            positionSystem: context.positionSystem
        };
    }

    // Проверяем эффект пиратов: если на поле уже есть карта пиратов, то корабль уходит из игры и карта пиратов переворачивается
    if (context.positionSystem.findCardById('pirates')) {
        gameLogger.info('Это пираты! Ждем другой корабль');

        const newPositionSystem = new PositionSystem();
        context.positionSystem.occupiedPositions.forEach((value, key) => {
            newPositionSystem.occupiedPositions.set(key, value);
        });
        newPositionSystem.removePosition(Position.fromString(context.shipCard.position));
        const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'pirates');

        const piratesResult = newPositionSystem.findCardById('pirates');
        if (piratesResult) {
            newPositionSystem.setPosition(piratesResult.position, frontCard);
        }

        return {
            shipCard: INITIAL_SHIP,
            positionSystem: newPositionSystem
        };
    }

    const shipPos = Position.fromString(context.shipCard.position);
    let newDirection = context.shipCard.direction;

    // Проверяем, существует ли карта "ship-sighted"
    const hasShipSighted = context.positionSystem.findCardById('ship-sighted');

    const isAtCorner = isCornerShip(context.shipCard, shipPos.row, shipPos.col);
    // Если карта "ship-sighted" существует и корабль ещё не повернулся, проверяем, достиг ли корабль угла
    if (hasShipSighted && context.shipCard.cornerCoordinates && !context.shipCard.hasTurned && isAtCorner) {
        // Меняем направление на следующее по часовой стрелке
        switch(context.shipCard.direction) {
            case 'NE': newDirection = 'SE'; break;
            case 'SE': newDirection = 'SW'; break;
            case 'SW': newDirection = 'NW'; break;
            case 'NW': newDirection = 'NE'; break;
        }
    }

    // Смещаем корабль в новое положение
    const newPosition = calculateNewShipPosition(shipPos, newDirection);

    // Обновляем все значения
    const newShipCard = {
        ...context.shipCard,
        position: newPosition.toString(),
        direction: newDirection,
        hasTurned: context.shipCard.hasTurned || (hasShipSighted && isAtCorner)
    };

    // Update occupied positions
    const newPositionSystem = new PositionSystem();
    context.positionSystem.occupiedPositions.forEach((value, key) => {
        newPositionSystem.occupiedPositions.set(key, value);
    });
    newPositionSystem.removePosition(shipPos);
    newPositionSystem.setPosition(newPosition, newShipCard);

    // Проверяем эффект sea-serpent и делаем дополнительный ход если нужно
    return handleSeaSerpentExtraMove(newShipCard, newPositionSystem, newPosition, newDirection);
};

// Update lives (increase or decrease)
export const updateLives = (oldLives, lives) => {
    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16
    
    return { lives: newLives };
};
