import { INITIAL_SHIP } from './gameData';
import { isShipOutOfBounds } from './gameRules';

// Helper function to find a card on the board
export const findCardOnBoard = (occupiedPositions, cardId) => {
    return Array.from(occupiedPositions.values())
        .some(card => card.id === cardId);
};

// Move the player to a new position
export const movePlayer = (context, row, col) => {
    const newPosition = `${row},${col}`;
    let newOccupiedPositions = context.occupiedPositions;
    let newDeck = context.deck;
    let newLives = context.lives;
    let newShipCard = context.shipCard;

    let card = context.occupiedPositions.get(`${row},${col}`);

    // если карта не существует, то placeCard
    if (!card) {
        const { occupiedPositions, deck, cardObj, lives } = placeCard(context, row, col);
        newOccupiedPositions = occupiedPositions;
        newDeck = deck;
        card = cardObj;
        newLives = lives;
    }

    // если карта с отрицательными жизнями, то уменьшается жизнь (каждый раз)
    if (card.lives < 0) {
        // Check if there's protection from negative effects
        const isProtected = findCardOnBoard(context.occupiedPositions, 'spear') && card.id === 'pig' 
            || findCardOnBoard(context.occupiedPositions, 'shelter') && card.id === 'storm';

        if (!isProtected) {
            const { lives } = decreaseLives(newLives, card.lives);
            newLives = lives;
        }
    }

    // если карта с направлением и нет других кораблей, то размещается корабль
    if (card.direction && !context.shipCard.direction) {
        const { shipCard, occupiedPositions } = placeShip(newOccupiedPositions, card.direction);
        newOccupiedPositions = occupiedPositions;
        newShipCard = shipCard;
    }
    
    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition,
        occupiedPositions: newOccupiedPositions,
        deck: newDeck,
        lives: newLives,
        shipCard: newShipCard
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
        const { lives } = increaseLives(context.lives, cardObj.lives);
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
        emoji: frontCard.emoji,
        description: frontCard.description
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
    let newDirection = context.shipCard.direction;

    // Check if ship-sighted card exists
    const hasShipSighted = findCardOnBoard(context.occupiedPositions, 'ship-sighted');

    // If ship-sighted exists and ship hasn't turned yet, check if ship reached a corner
    if (hasShipSighted && context.shipCard.cornerCoordinates && !context.shipCard.hasTurned) {
        const { topLeft, topRight, bottomLeft, bottomRight } = context.shipCard.cornerCoordinates;
        const isAtCorner = (
            (shipRow === topLeft[0] && shipCol === topLeft[1]) ||
            (shipRow === topRight[0] && shipCol === topRight[1]) ||
            (shipRow === bottomLeft[0] && shipCol === bottomLeft[1]) ||
            (shipRow === bottomRight[0] && shipCol === bottomRight[1])
        );

        if (isAtCorner) {
            // Change direction based on current direction
            switch(context.shipCard.direction) {
                case 'NE': newDirection = 'SE'; break;
                case 'SE': newDirection = 'SW'; break;
                case 'SW': newDirection = 'NW'; break;
                case 'NW': newDirection = 'NE'; break;
            }
        }
    }

    switch(newDirection) {
        case 'NE': newRow++; break;
        case 'SE': newCol--; break;
        case 'SW': newRow--; break;
        case 'NW': newCol++; break;
    }

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

// Decrease lives
export const decreaseLives = (oldLives, lives = -1) => {
    const newLives = Math.max(0, oldLives + lives);
    
    return { lives: newLives };
};

// Увеличивает жизни на Х
export const increaseLives = (oldLives, lives) => {
    return { lives: Math.min(16, oldLives + lives) };
};
