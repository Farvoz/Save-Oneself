import { ShipCornerManager } from './ShipCornerManager';
import { GameContext } from './gameData';
import { GameCard, ShipCard, Direction } from './Card';
import { Position, PositionSystem } from './PositionSystem';
import { ship } from './cardData';

interface MovePlayerResult {
    playerPosition: Position;
    positionSystem: PositionSystem;
    deck: GameCard[];
    lives: number;
    shipCard: ShipCard;
    hasPlacedCard: boolean;
    movesLeft: number;
    hasMoved: boolean;
    gameOverMessage?: string;
    isVictory?: boolean;
}

interface ShuffleDeckResult {
    deck: GameCard[];
}

interface PlaceCardResult {
    positionSystem: PositionSystem;
    deck: GameCard[];
    cardObj: GameCard;
    lives: number;
}

interface PlaceShipResult {
    shipCard: ShipCard;
    positionSystem: PositionSystem;
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

    const newShipCard = new ShipCard(ship, direction, shipPosition, cornerManager);

    positionSystem.setPosition(shipPosition, newShipCard);

    return {
        shipCard: newShipCard,
        positionSystem
    };
};

// Handle ship-sighted card effect
export const handleShipSightedEffect = (context: GameContext): { newDirection: Direction, hasTurned: boolean } => {
    const hasShipSighted = context.positionSystem.findCardById('ship-sighted');
    const isAtCorner = context.shipCard?.cornerManager?.isFinalCornerShipPosition(context.shipCard.position!) ?? false;

    if (hasShipSighted && !context.shipCard?.hasTurned && isAtCorner && context.shipCard?.cornerManager) {
        return {
            newDirection: context.shipCard.cornerManager.getNextDirection(),
            hasTurned: true
        };
    }

    return {
        newDirection: context.shipCard!.getCurrentDirection()!,
        hasTurned: Boolean(context.shipCard?.hasTurned || (hasShipSighted && isAtCorner))
    };
};

// Move the ship
export const moveShip = (context: GameContext): MoveShipResult => {
    if (!context.shipCard?.position || !context.shipCard?.getCurrentDirection()) {
        return {
            shipCard: context.shipCard!,
            positionSystem: context.positionSystem
        };
    }

    // Если корабль должен пропустить ход, просто сбрасываем флаг
    if (context.shipCard.skipMove) {
        context.shipCard.skipMove = false;

        return {
            shipCard: context.shipCard,
            positionSystem: context.positionSystem
        };
    }

    const shipPos = context.shipCard.position;

    // Handle ship-sighted effect
    const { newDirection, hasTurned } = handleShipSightedEffect(context);

    // Смещаем корабль в новое положение
    const newPosition = context.shipCard.cornerManager!.getNextShipPosition(shipPos, newDirection);

    // Обновляем все значения
    context.shipCard.position = newPosition;
    context.shipCard.direction = newDirection;
    context.shipCard.hasTurned = hasTurned;

    context.positionSystem.swapPositions(shipPos, newPosition);

    return {
        shipCard: context.shipCard,
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
