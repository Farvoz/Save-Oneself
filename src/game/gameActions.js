import { INITIAL_DECK, INITIAL_FRONT_DECK, INITIAL_SHIP } from './gameData';
import { gameLogger } from './gameLogger';
import { isCornerShip, findCardOnBoard, findCardPositionById } from './gameRules';


// Helper function to count non-ship cards on the board
export const countNonShipCards = (occupiedPositions) => {
    return Array.from(occupiedPositions.values())
        .filter(card => card.type !== 'ship').length;
};

// Helper function to find storm card position
export const findStormCardPosition = (occupiedPositions) => {
    for (const [pos, card] of occupiedPositions.entries()) {
        if (card.id === 'storm') {
            return pos;
        }
    }
    return null;
};

// Helper function to find the farthest card position from a given position
export const findFarthestCardPosition = (occupiedPositions, fromRow, fromCol) => {
    let maxDistance = -1;
    let farthestPosition = null;

    for (const [pos, card] of occupiedPositions.entries()) {
        if (card.type === 'ship') continue; // Skip ship card

        const [row, col] = pos.split(',').map(Number);
        const distance = Math.abs(row - fromRow) + Math.abs(col - fromCol);
        
        if (distance > maxDistance) {
            maxDistance = distance;
            farthestPosition = pos;
        }
    }

    return farthestPosition;
};

// Helper function to handle negative card effects
export const handleNegativeEffects = (card, occupiedPositions, lives) => {
    if (card.lives < 0) {
        // Check if there's protection from negative effects
        const isProtected = findCardOnBoard(occupiedPositions, 'spear') && card.id === 'pig' 
            || findCardOnBoard(occupiedPositions, 'shelter') && card.id === 'storm';

        if (!isProtected) {
            const { lives: newLives } = updateLives(lives, card.lives);
            return newLives;
        }
    }
    return lives;
};

// Move the player to a new position
export const movePlayer = (context, row, col) => {
    const newPosition = `${row},${col}`;
    let newOccupiedPositions = context.occupiedPositions;
    let newDeck = context.deck;
    let newLives = context.lives;
    let newShipCard = context.shipCard;
    let hasPlacedCard = context.hasPlacedCard;
    let movesLeft = context.movesLeft;

    let card = newOccupiedPositions.get(`${row},${col}`);

    // если карта не существует, то placeCard
    if (!card) {
        // если колода пуста, то игра окончена
        if (context.deck.length === 0) {
            return {
                gameOverMessage: 'Игра окончена! Колода пуста.',
                isVictory: false
            };
        }

        const { occupiedPositions, deck, cardObj, lives } = placeCard(context, row, col);
        newOccupiedPositions = occupiedPositions;
        newDeck = deck;
        card = cardObj;
        newLives = lives;
        hasPlacedCard = true;

        // --- Эффекты при вскрытии карты ---

        // Если выложена карта mirage, меняем её местами с самой дальней картой
        // А также должен сработать эффект перемещённой карты
        if (card.id === 'mirage') {
            const farthestPos = findFarthestCardPosition(newOccupiedPositions, row, col);
            const farthestCard = newOccupiedPositions.get(farthestPos);
            if (farthestPos) {
                // Меняем карты местами
                newOccupiedPositions.set(newPosition, farthestCard);
                // Переворачиваем mirage
                const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'mirage');
                newOccupiedPositions.set(farthestPos, frontCard);
            }

            // Применяем эффект перемещённой карты
            newLives = handleNegativeEffects(farthestCard, newOccupiedPositions, newLives);
        }

        // если карта с направлением и нет других кораблей, то размещается корабль
        if (card.direction && !context.shipCard.direction) {
            const { shipCard, occupiedPositions } = placeShip(newOccupiedPositions, card.direction);
            newOccupiedPositions = occupiedPositions;
            newShipCard = shipCard;
        }
    }

    // --- Эффекты при перемещении игрока ---

    // если карта с отрицательными жизнями, то уменьшается жизнь (каждый раз)
    newLives = handleNegativeEffects(card, newOccupiedPositions, newLives);
    
    // Проверяем эффект пиратов
    if (card.id === 'pirates' && !context.shipCard.skipMove) {
        // Удаляем корабль из игры
        newOccupiedPositions.delete(context.shipCard.position);
        newShipCard = { ...INITIAL_SHIP };
        
        // Переворачиваем карту пиратов
        const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'pirates');
        newOccupiedPositions.set(newPosition, frontCard);
    }

    // Уменьшаем количество оставшихся ходов
    movesLeft--;

    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition,
        occupiedPositions: newOccupiedPositions,
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
export const placeCard = (context, row, col) => {
    let newOccupiedPositions = new Map(context.occupiedPositions);
    const cardObj = context.deck[context.deck.length - 1];
    const newDeck = context.deck.slice(0, -1);
    let newLives = context.lives;

    newOccupiedPositions.set(`${row},${col}`, cardObj);

    // если карта с жизнями, то восстанавливается жизнь (только 1 раз при вскрытии)
    if (cardObj.lives > 0) {
        const { lives } = updateLives(context.lives, cardObj.lives);
        newLives = lives;
    }
    
    return {
        occupiedPositions: newOccupiedPositions,
        deck: newDeck,
        cardObj: cardObj,
        lives: newLives
    };
};

// Place the ship on the board
export const placeShip = (occupiedPositions, direction) => {
    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
    let shipRow, shipCol;

    const cardPositions = Array.from(occupiedPositions.entries())
        .filter(([_, card]) => card.type !== 'ship')
        .map(([pos]) => pos.split(',').map(Number));

    cardPositions.forEach(([row, col]) => {
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
    });

    // Set corner coordinates based on direction
    let cornerCoordinates;
    switch(direction) {
        case 'NW': 
            shipRow = minRow - 1; 
            shipCol = minCol - 1;
            cornerCoordinates = {
                topLeft: [minRow, minCol],
                topRight: [minRow, minCol + 3],
                bottomLeft: [minRow + 3, minCol],
                bottomRight: [minRow + 3, minCol + 3]
            };
            break;
        case 'NE': 
            shipRow = minRow - 1; 
            shipCol = maxCol + 1;
            cornerCoordinates = {
                topLeft: [minRow, maxCol - 3],
                topRight: [minRow, maxCol],
                bottomLeft: [minRow + 3, maxCol - 3],
                bottomRight: [minRow + 3, maxCol]
            };
            break;
        case 'SW': 
            shipRow = maxRow + 1; 
            shipCol = minCol - 1;
            cornerCoordinates = {
                topLeft: [maxRow - 3, minCol],
                topRight: [maxRow - 3, minCol + 3],
                bottomLeft: [maxRow, minCol],
                bottomRight: [maxRow, minCol + 3]
            };
            break;
        case 'SE': 
            shipRow = maxRow + 1; 
            shipCol = maxCol + 1;
            cornerCoordinates = {
                topLeft: [maxRow - 3, maxCol - 3],
                topRight: [maxRow - 3, maxCol],
                bottomLeft: [maxRow, maxCol - 3],
                bottomRight: [maxRow, maxCol]
            };
            break;
    }

    const shipPosition = `${shipRow},${shipCol}`;
    const newShipCard = {
        ...INITIAL_SHIP,
        direction,
        position: shipPosition,
        cornerCoordinates // Add corner coordinates to ship card
    };

    // Add ship to occupied positions
    const newOccupiedPositions = new Map(occupiedPositions);
    newOccupiedPositions.set(shipPosition, newShipCard);

    return {
        shipCard: newShipCard,
        occupiedPositions: newOccupiedPositions
    };
};

// Flip a card
export const flipCard = (context, row, col) => {
    const cardObj = context.occupiedPositions.get(`${row},${col}`);
    const frontCard = INITIAL_FRONT_DECK.find(card => card.backId === cardObj.id);
    
    // Размещает перевернутую карту на поле
    const newOccupiedPositions = new Map(context.occupiedPositions);
    newOccupiedPositions.set(`${row},${col}`, frontCard);
    
    // Обновляет жизни
    const { lives } = updateLives(context.lives, frontCard.lives);
    let newLives = lives;

    // Если это tornado, то переворачиваем обратно
    if (countNonShipCards(newOccupiedPositions) === 13 && frontCard.id === 'tornado') {
        newOccupiedPositions.set(`${row},${col}`, cardObj);

        // А также переворачивает обратно shelter и lit beacon
        const shelterPos = findCardPositionById(newOccupiedPositions, 'shelter');
        const litBeaconPos = findCardPositionById(newOccupiedPositions, 'lit-beacon');
        if (shelterPos) {
            newOccupiedPositions.set(shelterPos, INITIAL_DECK.find(card => card.id === 'vines'));
        }
        if (litBeaconPos) {
            newOccupiedPositions.set(litBeaconPos, INITIAL_DECK.find(card => card.id === 'higher-ground'));
        }
    }

    // Если это одна из карт сокровищ, переворачиваем обе
    if (cardObj.id === 'map-r' || cardObj.id === 'map-c') {
        // Находим и переворачиваем вторую карту сокровищ
        const otherMapId = cardObj.id === 'map-r' ? 'map-c' : 'map-r';
        const otherMapPos = findCardPositionById(newOccupiedPositions, otherMapId);
        const otherFrontCard = INITIAL_FRONT_DECK.find(card => card.backId === otherMapId);
        newOccupiedPositions.set(otherMapPos, otherFrontCard);

        // Увеличиваем количество жизней на 1
        const { lives } = updateLives(newLives, 1);
        newLives = lives
    }
    
    return {
        occupiedPositions: newOccupiedPositions,
        lives: newLives
    };
};

// Helper function to calculate new ship position based on direction
const calculateNewShipPosition = (row, col, direction) => {
    let newRow = row, newCol = col;
    
    switch(direction) {
        case 'NE': newRow++; break;
        case 'SE': newCol--; break;
        case 'SW': newRow--; break;
        case 'NW': newCol++; break;
    }
    
    return { newRow, newCol };
};

// Helper function to handle sea serpent extra move
const handleSeaSerpentExtraMove = (shipCard, occupiedPositions, row, col, direction) => {
    const adjacentPositions = [
        `${row + 1},${col}`,
        `${row - 1},${col}`,
        `${row},${col + 1}`,
        `${row},${col - 1}`
    ];

    const hasSeaSerpent = adjacentPositions.some(pos => {
        const card = occupiedPositions.get(pos);
        return card && card.id === 'sea-serpent';
    });

    if (!hasSeaSerpent) {
        return {
            shipCard,
            occupiedPositions
        };
    }

    const { newRow: extraRow, newCol: extraCol } = calculateNewShipPosition(row, col, direction);
    const extraPosition = `${extraRow},${extraCol}`;
    const extraShipCard = {
        ...shipCard,
        position: extraPosition
    };

    // Update occupied positions
    const newOccupiedPositions = new Map(occupiedPositions);
    newOccupiedPositions.delete(shipCard.position); // Remove previous position
    newOccupiedPositions.set(extraPosition, extraShipCard); // Add new position

    return {
        shipCard: extraShipCard,
        occupiedPositions: newOccupiedPositions
    };
};

// Move the ship
export const moveShip = (context) => {
    if (!context.shipCard.position || !context.shipCard.direction) {
        return {
            shipCard: context.shipCard,
            occupiedPositions: context.occupiedPositions
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
            occupiedPositions: context.occupiedPositions
        };
    }

    // Проверяем эффект пиратов: если на поле уже есть карта пиратов, то корабль уходит из игры и карта пиратов переворачивается
    if (findCardOnBoard(context.occupiedPositions, 'pirates')) {
        gameLogger.info('Это пираты! Ждем другой корабль');

        const newOccupiedPositions = new Map(context.occupiedPositions);
        newOccupiedPositions.delete(context.shipCard.position);
        const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'pirates');

        const piratesPos = findCardPositionById(newOccupiedPositions, 'pirates');
        newOccupiedPositions.set(piratesPos, frontCard);

        return {
            shipCard: INITIAL_SHIP,
            occupiedPositions: newOccupiedPositions
        };
    }

    const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
    let newDirection = context.shipCard.direction;

    // Проверяем, существует ли карта "ship-sighted"
    const hasShipSighted = findCardOnBoard(context.occupiedPositions, 'ship-sighted');

    const isAtCorner = isCornerShip(context.shipCard, shipRow, shipCol);
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
    const { newRow, newCol } = calculateNewShipPosition(shipRow, shipCol, newDirection);

    // Обновляем все значения
    const newPosition = `${newRow},${newCol}`;
    const newShipCard = {
        ...context.shipCard,
        position: newPosition,
        direction: newDirection,
        hasTurned: context.shipCard.hasTurned || (hasShipSighted && isAtCorner)
    };

    // Update occupied positions
    const newOccupiedPositions = new Map(context.occupiedPositions);
    newOccupiedPositions.delete(context.shipCard.position); // Remove old position
    newOccupiedPositions.set(newPosition, newShipCard); // Add new position

    // Проверяем эффект sea-serpent и делаем дополнительный ход если нужно
    return handleSeaSerpentExtraMove(newShipCard, newOccupiedPositions, newRow, newCol, newDirection);
};

// Update lives (increase or decrease)
export const updateLives = (oldLives, lives) => {
    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16
    
    return { lives: newLives };
};
