import { INITIAL_FRONT_DECK } from './gameData';
import { ShipCornerManager } from './ShipCornerManager';
import { GameContext, Card, ShipCard, CardType, Direction } from './gameData';
import { Position, PositionSystem } from './PositionSystem';

interface MovePlayerResult {
    playerPosition: Position;
    positionSystem: PositionSystem;
    deck: Card[];
    lives: number;
    shipCard: ShipCard;
    hasPlacedCard: boolean;
    movesLeft: number;
    hasMoved: boolean;
    gameOverMessage?: string;
    isVictory?: boolean;
}

interface ShuffleDeckResult {
    deck: Card[];
}

interface PlaceCardResult {
    positionSystem: PositionSystem;
    deck: Card[];
    cardObj: Card;
    lives: number;
}

interface PlaceShipResult {
    shipCard: ShipCard;
    positionSystem: PositionSystem;
}

interface FlipCardResult {
    positionSystem: PositionSystem;
    lives: number;
}

interface MoveShipResult {
    shipCard: ShipCard;
    positionSystem: PositionSystem;
}

interface UpdateLivesResult {
    lives: number;
}

// Move the player to a new position
export const movePlayer = (context: GameContext, newPosition: Position): MovePlayerResult => {
    const newPositionSystem = context.positionSystem;
    const newDeck = context.deck;
    const newLives = context.lives;
    const newShipCard = context.shipCard;
    const hasPlacedCard = context.hasPlacedCard;
    let movesLeft = context.movesLeft;

    const card = newPositionSystem.getPosition(newPosition);

    // если карта не существует, то placeCard
    if (!card) {
        // если колода пуста, то игра окончена
        if (context.deck.length === 0) {
            return {
                gameOverMessage: 'Игра окончена! Колода пуста.',
                isVictory: false,
                playerPosition: newPosition,
                positionSystem: newPositionSystem,
                deck: newDeck,
                lives: newLives,
                shipCard: newShipCard!,
                hasPlacedCard,
                movesLeft,
                hasMoved: true
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
        shipCard: newShipCard!,
        hasPlacedCard,
        movesLeft,
        hasMoved: true
    };
};

// Shuffle the deck
export const shuffleDeck = (context: GameContext): ShuffleDeckResult => {
    const deck = [...context.deck];
    deck.sort(() => Math.random() - 0.5);
    return { deck };
};

// Place a card on the board
export const placeCard = (context: GameContext, pos: Position): PlaceCardResult => {
    const cardObj = context.deck[context.deck.length - 1];
    const newDeck = context.deck.slice(0, -1);
    const newLives = context.lives;

    context.positionSystem.setPosition(pos, cardObj);
    
    return {
        positionSystem: context.positionSystem,
        deck: newDeck,
        cardObj,
        lives: newLives
    };
};

// Place the ship on the board
export const placeShip = (positionSystem: PositionSystem, direction: Direction): PlaceShipResult => {
    const bounds = positionSystem.getBounds();

    // Create corner manager to calculate coordinates
    const cornerManager = new ShipCornerManager(direction, bounds);
    const shipPosition = cornerManager.getStartShipPosition();

    const newShipCard: ShipCard = {
        type: 'ship',
        direction,
        id: 'ship',
        position: shipPosition,
        skipMove: true,
        hasTurned: false,
        emoji: '⛵',
        cornerManager,
        lives: 0,
        getEmoji() {
            if (!this.direction) return this.emoji;
            const arrows = {
                'NE': '⬇️',
                'SE': '⬅️', 
                'SW': '⬆️',
                'NW': '➡️'
            };
            return `${this.emoji}${arrows[this.direction]}`;
        }
    };

    positionSystem.setPosition(shipPosition, newShipCard);

    return {
        shipCard: newShipCard,
        positionSystem
    };
};

// Flip a card
export const flipCard = (context: GameContext, pos: Position): FlipCardResult => {
    const cardObj = context.positionSystem.getPosition(pos);
    if (!cardObj) {
        throw new Error('Card not found at position');
    }
    const frontCard = INITIAL_FRONT_DECK.find(card => card.backId === cardObj.id);
    if (!frontCard) {
        throw new Error('Front card not found for back card');
    }
    
    // Размещает перевернутую карту на поле
    const flippedCard: Card = {
        ...frontCard,
        type: 'front' as CardType
    };
    context.positionSystem.setPosition(pos, flippedCard);
    
    return {
        positionSystem: context.positionSystem,
        lives: context.lives
    };
};

// Move the ship
export const moveShip = (context: GameContext): MoveShipResult => {
    if (!context.shipCard?.position || !context.shipCard?.direction) {
        return {
            shipCard: context.shipCard!,
            positionSystem: context.positionSystem
        };
    }

    // Если корабль должен пропустить ход, просто сбрасываем флаг
    if (context.shipCard.skipMove) {
        const newShipCard: ShipCard = {
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

    const isAtCorner = context.shipCard.cornerManager?.isFinalCornerShipPosition(shipPos) ?? false;
    // Если карта "ship-sighted" существует и корабль ещё не повернулся, проверяем, достиг ли корабль угла
    if (hasShipSighted && !context.shipCard.hasTurned && isAtCorner && context.shipCard.cornerManager) {
        // Меняем направление на следующее по часовой стрелке
        newDirection = context.shipCard.cornerManager.getNextDirection();
    }

    // Смещаем корабль в новое положение
    const newPosition = context.shipCard.cornerManager!.getNextShipPosition(shipPos, newDirection);

    // Обновляем все значения
    const newShipCard: ShipCard = {
        ...context.shipCard,
        position: newPosition,
        direction: newDirection,
        hasTurned: Boolean(context.shipCard.hasTurned || (hasShipSighted && isAtCorner))
    };

    context.positionSystem.swapPositions(shipPos, newPosition);

    return {
        shipCard: newShipCard,
        positionSystem: context.positionSystem
    };
};

// Update lives (increase or decrease)
export const updateLives = (oldLives: number, lives: number): UpdateLivesResult => {
    const newLives = lives < 0 
        ? Math.max(0, oldLives + lives)  // Decrease lives but not below 0
        : Math.min(16, oldLives + lives); // Increase lives but not above 16
    
    return { lives: newLives };
};
