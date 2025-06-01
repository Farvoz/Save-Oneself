// Файл с игровыми предикатами
import { Position } from './positionSystem';

// Check if a position is valid for card moving
export const isPlayerValidPosition = (context, pos) => {
    if (!context.playerPosition) {
        return pos.row === 0 && pos.col === 0;
    }
    
    if (context.positionSystem.isOutOfBounds(pos)) return false;

    if (context.playerPosition) {
        const currentPos = Position.fromString(context.playerPosition);
        const isAdjacent = context.positionSystem.isAdjacent(currentPos, pos);
        if (!isAdjacent) return false;
    }
    
    if (context.shipCard.cornerManager) {
        // Проверяем, не выходит ли позиция за пределы прямоугольника, образованного угловыми точками
        if (!context.shipCard.cornerManager.isPlayerValidPosition(pos)) {
            return false;
        }
    }

    // Проверяем, не пытаемся ли мы выложить карту, когда уже выложили карту в этом раунде
    if (!context.positionSystem.hasPosition(pos) && context.hasPlacedCard) {
        return false;
    }
    
    return true;
};

// Check if a card can be flipped
export const canFlipCard = (context, card) => {
    if (card.type === 'front') return false;
    
    if (card.requirements) {
        if (card.requirements === '_ship-set-sail') {
            return context.shipCard.direction !== undefined && context.shipCard.skipMove;
        }
        
        // Check if player is on higher-ground when required
        if (card.requirements === 'higher-ground' || card.id === 'higher-ground') {
            const playerPos = Position.fromString(context.playerPosition);
            const playerCard = context.positionSystem.getPosition(playerPos);
            if (!playerCard || playerCard.id !== 'higher-ground') {
                return false;
            }
        }

        // Check map card requirements
        if (card.requirements === '_map') {
            // Both map cards must be on the board
            const mapRResult = context.positionSystem.findCardById('map-r');
            const mapCResult = context.positionSystem.findCardById('map-c');

            if (!mapRResult || !mapCResult) return false;

            // Player must be at the intersection of map-r row and map-c column
            const playerPos = Position.fromString(context.playerPosition);

            // Player must be at the intersection
            return mapRResult.position.row === playerPos.row && mapCResult.position.col === playerPos.col;
        }
        
        return context.positionSystem.findCardById(card.requirements) !== null;
    }
    
    return true;
};

// Check if there are any flippable cards on the board
export const hasFlippableCards = (context) => {
    for (const [_, card] of context.positionSystem.occupiedPositions) {
        if (card.type === 'back' && canFlipCard(context, card)) {
            return true;
        }
    }
    return false;
};

// Check if the game is won
// return boolean
export const checkVictory = (context) => {
    const sosResult = context.positionSystem.findCardById('sos');
    const beaconResult = context.positionSystem.findCardById('lit-beacon');
    const messageResult = context.positionSystem.findCardById('message');
    
    if (!context.shipCard.position) return false;
    
    const shipPos = Position.fromString(context.shipCard.position);
    const sosVictory = sosResult && shipPos.row === sosResult.position.row;
    const beaconVictory = beaconResult && shipPos.col === beaconResult.position.col;
    
    // Check message victory condition
    let messageVictory = false;
    if (messageResult) {
        const msgPos = messageResult.position;
        
        // Check if message card is not in a corner
        if (!context.shipCard.cornerManager.isCornerCard(msgPos)) {
            const isAdjacent = context.positionSystem.isAdjacent(shipPos, msgPos);
            messageVictory = isAdjacent;
        }
    }
    
    return sosVictory || beaconVictory || messageVictory;
};

// Calculate final score
export const calculateScore = (context) => {
    let score = 0;
    
    // Add scores from flipped cards
    const scoreCards = context.positionSystem.findAllBy(card => card.score).map(card => card.card);
    score += scoreCards.reduce((acc, card) => acc + Number(card.score), 0);
    
    // Add remaining lives
    score += context.lives;
    
    // Add bonus points for every 4 placed cards
    const placedCardsCount = context.positionSystem.countNonShipCards();
    score += Math.floor(placedCardsCount / 4);
    
    return score;
}; 