import { INITIAL_FRONT_DECK, INITIAL_SHIP } from './gameData';
import { ShipCornerManager } from './ShipCornerManager';

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
    }

    // Уменьшаем количество оставшихся ходов
    movesLeft--;

    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition,
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
    const cardObj = context.deck[context.deck.length - 1];
    const newDeck = context.deck.slice(0, -1);
    let newLives = context.lives;

    context.positionSystem.setPosition(pos, cardObj);
    
    return {
        positionSystem: context.positionSystem,
        deck: newDeck,
        cardObj: cardObj,
        lives: newLives
    };
};

// Place the ship on the board
export const placeShip = (positionSystem, direction) => {
    const bounds = positionSystem.getBounds();

    // Create corner manager to calculate coordinates
    const cornerManager = new ShipCornerManager(direction, bounds);
    const shipPosition = cornerManager.getStartShipPosition();

    const newShipCard = {
        ...INITIAL_SHIP,
        direction,
        position: shipPosition,
        cornerManager
    };

    positionSystem.setPosition(shipPosition, newShipCard);

    return {
        shipCard: newShipCard,
        positionSystem: positionSystem
    };
};

// Flip a card
export const flipCard = (context, pos) => {
    const cardObj = context.positionSystem.getPosition(pos);
    const frontCard = INITIAL_FRONT_DECK.find(card => card.backId === cardObj.id);
    
    // Размещает перевернутую карту на поле
    context.positionSystem.setPosition(pos, frontCard);
    
    return {
        positionSystem: context.positionSystem,
        lives: context.lives
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

    const shipPos = context.shipCard.position;
    let newDirection = context.shipCard.direction;

    // Проверяем, существует ли карта "ship-sighted"
    const hasShipSighted = context.positionSystem.findCardById('ship-sighted');

    const isAtCorner = context.shipCard.cornerManager.isFinalCornerShipPosition(shipPos);
    // Если карта "ship-sighted" существует и корабль ещё не повернулся, проверяем, достиг ли корабль угла
    if (hasShipSighted && !context.shipCard.hasTurned && isAtCorner) {
        // Меняем направление на следующее по часовой стрелке
        newDirection = context.shipCard.cornerManager.getNextDirection();
    }

    // Смещаем корабль в новое положение
    const newPosition = context.shipCard.cornerManager.getNextShipPosition(shipPos, newDirection);

    // Обновляем все значения
    const newShipCard = {
        ...context.shipCard,
        position: newPosition,
        direction: newDirection,
        hasTurned: context.shipCard.hasTurned || (hasShipSighted && isAtCorner)
    };

    context.positionSystem.swapPositions(shipPos, newPosition);

    return {
        shipCard: newShipCard,
        positionSystem: context.positionSystem
    };
};

// Update lives (increase or decrease)
export const updateLives = (oldLives, lives) => {
    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16
    
    return { lives: newLives };
};
