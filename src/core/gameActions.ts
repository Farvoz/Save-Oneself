import { ShipCornerManager } from './ShipCornerManager';
import { GameContext } from './initial';
import { GameCard, Direction } from './Card';
import { ShipCard } from './ShipCard';
import { Position, PositionSystem } from './PositionSystem';
import { ship, updateLives } from './cardData';

interface MovePlayerResult {
    playerPosition: Position;
    positionSystem: PositionSystem;
    deck: GameCard[];
    lives: number;
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

export const decreaseLive = (lives: number) => {
    return updateLives(lives, -1);
}

// Move the player to a new position
export const movePlayer = (context: GameContext, newPosition: Position): MovePlayerResult => {
    const newPositionSystem = context.positionSystem;
    const newDeck = context.deck;
    const newLives = context.lives;
    const hasPlacedCard = context.hasPlacedCard;
    let movesLeft = context.movesLeft;

    const card = newPositionSystem.getPosition(newPosition);

    // если карта не существует, то placeCard
    if (!card && context.deck.length === 0) {
        return {
            gameOverMessage: 'Игра окончена! Колода пуста.',
            isVictory: false,
            playerPosition: newPosition,
            positionSystem: newPositionSystem,
            deck: newDeck,
            lives: newLives,
            hasPlacedCard,
            movesLeft,
            hasMoved: true
        };
    }

    // Уменьшаем количество оставшихся ходов
    movesLeft--;

    // Если карта есть, просто обновляем позицию игрока
    return {
        playerPosition: newPosition,
        positionSystem: newPositionSystem,
        deck: newDeck,
        lives: newLives,
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

    // Клонируем positionSystem и добавляем новую карту
    const newPositionSystem = context.positionSystem.clone();
    newPositionSystem.setPosition(pos, cardObj);
    
    return {
        positionSystem: newPositionSystem,
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

    const newShipCard = new ShipCard(ship, cornerManager);

    // Клонируем positionSystem и добавляем корабль
    const newPositionSystem = positionSystem.clone();
    newPositionSystem.setPosition(shipPosition, newShipCard);

    return {
        shipCard: newShipCard,
        positionSystem: newPositionSystem
    };
};

// Move the ship
export const moveShip = (shipCard: ShipCard, positionSystem: PositionSystem): MoveShipResult => {
    const shipPos = positionSystem.getShipPosition()!;

    // Смещаем корабль в новое положение
    const newPosition = shipCard.cornerManager.getNextShipPosition(shipPos);

    // Удаляем корабль со старой позиции и устанавливаем на новую
    positionSystem.moveShip(newPosition);

    return {
        shipCard: shipCard,
        positionSystem: positionSystem
    };
};

// Check if a position is valid for card moving
export const isPlayerValidPosition = (context: GameContext, pos: Position): boolean => {
    if (!context.playerPosition) {
        return pos.row === 0 && pos.col === 0;
    }
    
    if (context.positionSystem.isOutOfBounds(pos)) return false;

    if (context.playerPosition) {
        const isAdjacent = context.positionSystem.isAdjacent(context.playerPosition, pos);
        if (!isAdjacent) return false;
    }
    
    const shipCard = context.positionSystem.getShipCard();
    if (shipCard) {
        // Проверяем, не выходит ли позиция за пределы прямоугольника, образованного угловыми точками
        if (!shipCard.cornerManager.isPlayerValidPosition(pos)) {
            return false;
        }
    }

    // Проверяем, не пытаемся ли мы выложить карту, когда уже выложили карту в этом раунде
    if (!context.positionSystem.hasPosition(pos) && context.hasPlacedCard) {
        return false;
    }
    
    return true;
};

// Check if there are any flippable cards on the board
export const hasFlippableCards = (context: GameContext): boolean => {
    for (const [, card] of context.positionSystem.occupiedPositions) {
        if (card.canFlip(context) && card.getCurrentType() !== 'ship') {
            return true;
        }
    }
    return false;
};

// Check if the game is won
// return boolean
export const checkVictory = (context: GameContext): boolean => {
    const shipPos = context.positionSystem.getShipPosition();
    if (!shipPos) return false;
    
    const sosResult = context.positionSystem.findCardById('sos');
    const beaconResult = context.positionSystem.findCardById('lit-beacon');
    const messageResult = context.positionSystem.findCardById('message');
    
    const sosVictory = sosResult && shipPos.row === sosResult.position.row;
    const beaconVictory = beaconResult && shipPos.col === beaconResult.position.col;
    
    // Check message victory condition
    let messageVictory = false;
    if (messageResult) {
        const msgPos = messageResult.position;
        
        // Check if message card is not in a corner
        const shipCard = context.positionSystem.getShipCard();
        if (!shipCard?.cornerManager?.isIslandCornerCard(msgPos)) {
            const isAdjacent = context.positionSystem.isAdjacent(shipPos, msgPos);
            messageVictory = isAdjacent;
        }
    }
    
    return sosVictory || beaconVictory || messageVictory;
};

// Check if the game is lost (ship is out of bounds)
export const checkDefeat = (context: GameContext): boolean => {
    const shipPos = context.positionSystem.getShipPosition();
    const shipCard = context.positionSystem.getShipCard();
    return shipCard && shipPos
        ? shipCard.cornerManager.isShipOutOfBounds(shipPos) 
        : false;
};

// Calculate final score
export const calculateScore = (context: GameContext): number => {
    let score = 0;
    
    // Add scores from flipped cards
    const scoreCards = context.positionSystem.findAllBy(card => Boolean(card.getCurrentScore())).map(result => result.card);
    score += scoreCards.reduce((acc, card) => acc + Number(card.getCurrentScore()), 0);
    
    // Add remaining lives
    score += context.lives;
    
    // Add bonus points for every 4 placed cards
    const placedCardsCount = context.positionSystem.countNonShipCards();
    score += Math.floor(placedCardsCount / 4);
    
    return score;
}; 