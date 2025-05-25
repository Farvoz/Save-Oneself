import { INITIAL_DECK, INITIAL_FRONT_DECK, INITIAL_SHIP } from './gameData';
import { isCornerShip } from './gameRules';

// Helper function to find a card on the board
export const findCardOnBoard = (occupiedPositions, cardId) => {
    return Array.from(occupiedPositions.values())
        .some(card => card.id === cardId);
};

export const findCardPositionById = (occupiedPositions, cardId) => {
    for (const [pos, card] of occupiedPositions.entries()) {
        if (card.id === cardId) {
            return pos;
        }
    }
    return null;
};

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

// Move the player to a new position
export const movePlayer = (context, row, col) => {
    const newPosition = `${row},${col}`;
    let newOccupiedPositions = context.occupiedPositions;
    let newDeck = context.deck;
    let newLives = context.lives;
    let newShipCard = context.shipCard;
    let shouldCheckStorm = false;

    let card = context.occupiedPositions.get(`${row},${col}`);

    // если колода пуста, то игра окончена
    if (context.deck.length === 0) {
        return {
            gameOverMessage: 'Игра окончена! Колода пуста.',
            isVictory: false
        };
    }

    // если карта не существует, то placeCard
    if (!card) {
        const { occupiedPositions, deck, cardObj, lives } = placeCard(context, row, col);
        newOccupiedPositions = occupiedPositions;
        newDeck = deck;
        card = cardObj;
        newLives = lives;
        
        // Проверяем, является ли это 13-й картой
        const totalCards = countNonShipCards(newOccupiedPositions);
        if (totalCards === 13) {
            shouldCheckStorm = true;
        }
    }

    // --- Эффекты при вскрытии карты ---

    // если карта с отрицательными жизнями, то уменьшается жизнь (каждый раз)
    if (card.lives < 0) {
        // Check if there's protection from negative effects
        const isProtected = findCardOnBoard(newOccupiedPositions, 'spear') && card.id === 'pig' 
            || findCardOnBoard(newOccupiedPositions, 'shelter') && card.id === 'storm';

        if (!isProtected) {
            const { lives } = updateLives(newLives, card.lives);
            newLives = lives;
        }
    }

    // если карта с направлением и нет других кораблей, то размещается корабль
    if (card.direction && !context.shipCard.direction) {
        const { shipCard, occupiedPositions } = placeShip(newOccupiedPositions, card.direction);
        newOccupiedPositions = occupiedPositions;
        newShipCard = shipCard;
    }

    // --- Конец эффектов при вскрытии карты ---
    
    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition,
        occupiedPositions: newOccupiedPositions,
        deck: newDeck,
        lives: newLives,
        shipCard: newShipCard,
        shouldCheckStorm
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
        type: 'ship',
        skipMove: true,
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
    
    return {
        occupiedPositions: newOccupiedPositions,
        lives: lives
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

    const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
    let newRow = shipRow, newCol = shipCol;
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
    switch(newDirection) {
        case 'NE': newRow++; break;
        case 'SE': newCol--; break;
        case 'SW': newRow--; break;
        case 'NW': newCol++; break;
    }

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

    return {
        shipCard: newShipCard,
        occupiedPositions: newOccupiedPositions
    };
};
// Update lives (increase or decrease)
export const updateLives = (oldLives, lives) => {
    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16
    
    return { lives: newLives };
};
