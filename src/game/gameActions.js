import { checkVictory } from './gameRules';

// Shuffle the deck
export const shuffleDeck = (context) => {
    const deck = [...context.deck];
    deck.sort(() => Math.random() - 0.5);
    return { deck };
};

// Place a card on the board
export const placeCard = (context, row, col) => {
    const newOccupiedPositions = new Map(context.occupiedPositions);
    const cardObj = context.deck[context.deck.length - 1];
    const newDeck = context.deck.slice(0, -1);
    
    newOccupiedPositions.set(`${row},${col}`, cardObj);
    
    // Update lives
    const newLives = Math.min(16, context.lives + cardObj.lives);
    
    // Check for ship placement
    let newShipCard = { ...context.shipCard };
    if (cardObj.direction && ['NW', 'NE', 'SW', 'SE'].includes(cardObj.direction) && !newShipCard.direction) {
        newShipCard = placeShip(context, cardObj.direction);
    }
    
    return {
        occupiedPositions: newOccupiedPositions,
        deck: newDeck,
        lives: newLives,
        shipCard: newShipCard
    };
};

// Place the ship on the board
const placeShip = (context, direction) => {
    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
    let shipRow, shipCol;

    const cardPositions = Array.from(context.occupiedPositions.entries())
        .filter(([_, card]) => card !== context.shipCard)
        .map(([pos]) => pos.split(',').map(Number));

    if (cardPositions.length === 0) return context.shipCard;

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

    return {
        ...context.shipCard,
        direction,
        position: `${shipRow},${shipCol}`,
        moves: 0
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
        return context.shipCard;
    }

    const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
    let newRow = shipRow, newCol = shipCol;

    switch(context.shipCard.direction) {
        case 'NE': newRow++; break;
        case 'SE': newCol--; break;
        case 'SW': newRow--; break;
        case 'NW': newCol++; break;
    }

    const newShipCard = {
        ...context.shipCard,
        position: `${newRow},${newCol}`,
        moves: context.shipCard.moves + 1
    };

    // Check for game over conditions
    if (newShipCard.moves >= 5) {
        throw new Error('GAME_OVER_SHIP_TOO_FAR');
    }

    if (checkVictory({ ...context, shipCard: newShipCard })) {
        throw new Error('GAME_OVER_VICTORY');
    }

    return newShipCard;
};

// Decrease lives
export const decreaseLives = (context) => {
    const newLives = Math.max(0, context.lives - 1);
    
    if (newLives <= 0) {
        throw new Error('GAME_OVER_NO_LIVES');
    }
    
    return { lives: newLives };
}; 