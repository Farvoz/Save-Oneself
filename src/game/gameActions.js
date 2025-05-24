import { checkVictory } from './gameRules';
import { INITIAL_SHIP } from './gameData';
// Move the player to a new position
export const movePlayer = (context, row, col) => {
    const newPosition = `${row},${col}`;
    
    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition
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
    
    newOccupiedPositions.set(`${row},${col}`, cardObj);
    
    return {
        occupiedPositions: newOccupiedPositions,
        deck: newDeck,
        cardObj: cardObj
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

    switch(direction) {
        case 'NW': shipRow = minRow - 1; shipCol = minCol - 1; break;
        case 'NE': shipRow = minRow - 1; shipCol = maxCol + 1; break;
        case 'SW': shipRow = maxRow + 1; shipCol = minCol - 1; break;
        case 'SE': shipRow = maxRow + 1; shipCol = maxCol + 1; break;
    }

    const shipPosition = `${shipRow},${shipCol}`;
    const newShipCard = {
        ...INITIAL_SHIP,
        direction,
        position: shipPosition,
        moves: 0,
        type: 'ship',
        skipMove: true
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
    const newOccupiedPositions = new Map(context.occupiedPositions);
    const cardObj = newOccupiedPositions.get(`${row},${col}`);
    
    if (!cardObj) return { occupiedPositions: newOccupiedPositions };
    
    const frontCard = context.frontDeck.find(card => card.backId === cardObj.id);
    if (!frontCard) return { occupiedPositions: newOccupiedPositions };
    
    const flippedCard = {
        ...cardObj,
        type: frontCard.type,
        id: frontCard.id,
        lives: frontCard.lives,
        emoji: frontCard.emoji
    };
    delete flippedCard.requirements;
    delete flippedCard.direction;
    
    newOccupiedPositions.set(`${row},${col}`, flippedCard);
    
    // Update lives
    const newLives = Math.min(16, context.lives + frontCard.lives);
    
    return {
        occupiedPositions: newOccupiedPositions,
        lives: newLives
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

    switch(context.shipCard.direction) {
        case 'NE': newRow++; break;
        case 'SE': newCol--; break;
        case 'SW': newRow--; break;
        case 'NW': newCol++; break;
    }

    const newPosition = `${newRow},${newCol}`;
    const newShipCard = {
        ...context.shipCard,
        position: newPosition,
        moves: context.shipCard.moves + 1
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

// Decrease lives
export const decreaseLives = (context) => {
    const newLives = Math.max(0, context.lives - 1);
    
    if (newLives <= 0) {
        throw new Error('GAME_OVER_NO_LIVES');
    }
    
    return { lives: newLives };
};

// Увеличивает жизни на Х
export const increaseLives = (context, lives) => {
    return { lives: Math.min(16, context.lives + lives) };
};
