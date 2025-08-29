import { GameContext } from './gameData';
import { Position } from './PositionSystem';
import { GameCard } from './Card';

// Файл с игровыми предикатами

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
    
    if (context.shipCard?.cornerManager) {
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
export const canFlipCard = (context: GameContext, card: GameCard): boolean => {
    if (card.getCurrentType() === 'front') return false;
    
    const requirements = card.getRequirements();
    if (requirements) {
        if (requirements === '_ship-set-sail') {
            return context.shipCard?.direction !== undefined && context.shipCard?.skipMove;
        }
        
        // Check if player is on higher-ground when required
        if (requirements === 'higher-ground' || card.getCurrentId() === 'higher-ground') {
            const playerCard = context.positionSystem.getPosition(context.playerPosition!);
            if (!playerCard || playerCard.getCurrentId() !== 'higher-ground') {
                return false;
            }
        }

        // Check map card requirements
        if (requirements === '_map') {
            // Both map cards must be on the board
            const mapRResult = context.positionSystem.findCardById('map-r');
            const mapCResult = context.positionSystem.findCardById('map-c');

            if (!mapRResult || !mapCResult) return false;

            // Player must be at the intersection of map-r row and map-c column
            return mapRResult.position.row === context.playerPosition!.row && 
                   mapCResult.position.col === context.playerPosition!.col;
        }
        
        return context.positionSystem.findCardById(requirements) !== null;
    }
    
    return true;
};

// Check if there are any flippable cards on the board
export const hasFlippableCards = (context: GameContext): boolean => {
    for (const [, card] of context.positionSystem.occupiedPositions) {
        if (canFlipCard(context, card) && card.getCurrentType() !== 'ship') {
            return true;
        }
    }
    return false;
};

// Check if the game is won
// return boolean
export const checkVictory = (context: GameContext): boolean => {
    const shipPos = context.shipCard?.position;
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
        if (!context.shipCard?.cornerManager?.isCornerCard(msgPos)) {
            const isAdjacent = context.positionSystem.isAdjacent(shipPos, msgPos);
            messageVictory = isAdjacent;
        }
    }
    
    return sosVictory || beaconVictory || messageVictory;
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