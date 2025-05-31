// Файл с игровыми предикатами
import { Position } from './positionSystem';

// Функция для проверки, является ли позиция угловой
export const isCornerCard = (cornerCoordinates, pos) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = cornerCoordinates;

    return pos.equals(new Position(topLeft[0], topLeft[1])) ||
           pos.equals(new Position(topRight[0], topRight[1])) ||
           pos.equals(new Position(bottomLeft[0], bottomLeft[1])) ||
           pos.equals(new Position(bottomRight[0], bottomRight[1]));
};

// Для каждого направления смотрим свой угол
export const isCornerShip = (shipCard, pos) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = shipCard.cornerCoordinates;
    
    switch(shipCard.direction) {
        case 'NE': return bottomRight[0] + 1 === pos.row;
        case 'SE': return bottomLeft[1] - 1 === pos.col;
        case 'SW': return topLeft[0] - 1 === pos.row;
        case 'NW': return topRight[1] + 1 === pos.col;
    }
};

// Check if a position is valid for card moving
export const isValidPosition = (context, pos) => {
    if (!context.playerPosition && pos.row === 0 && pos.col === 0) return true;
    
    if (!context.positionSystem.hasMaxRowsOrColumns(pos)) return false;

    if (context.playerPosition) {
        const currentPos = Position.fromString(context.playerPosition);
        const isAdjacent = context.positionSystem.isAdjacent(currentPos, pos);
        if (!isAdjacent) return false;
    }
    
    // Проверяем, не выходит ли позиция за пределы прямоугольника, образованного угловыми точками
    const { topLeft, bottomLeft, bottomRight } = context.shipCard.cornerCoordinates;

    if (pos.row < topLeft[0] || pos.row > bottomLeft[0] || pos.col < topLeft[1] || pos.col > bottomRight[1]) {
        return false;
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
        if (!isCornerCard(context.shipCard.cornerCoordinates, msgPos)) {
            const isAdjacent = context.positionSystem.isAdjacent(shipPos, msgPos);
            messageVictory = isAdjacent;
        }
    }
    
    return sosVictory || beaconVictory || messageVictory;
};


export const isShipOutOfBounds = (context) => {
    if (!context.shipCard?.position || !context.shipCard?.cornerCoordinates) {
        return false;
    }

    const { topLeft, topRight, bottomLeft, bottomRight } = context.shipCard.cornerCoordinates;
    const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
    
    const minRow = Math.min(topLeft[0], bottomLeft[0]);
    const maxRow = Math.max(topRight[0], bottomRight[0]);
    const minCol = Math.min(topLeft[1], topRight[1]);
    const maxCol = Math.max(bottomLeft[1], bottomRight[1]);

    return shipRow < minRow - 1 || shipRow > maxRow + 1 || 
           shipCol < minCol - 1 || shipCol > maxCol + 1;
};

// Calculate final score
export const calculateScore = (context) => {
    let score = 0;
    
    // Add scores from flipped cards
    const scoreCards = context.positionSystem.findAllBy(card => card.type === 'front' && card.score);
    score += scoreCards.reduce((acc, card) => acc + card.score, 0);
    
    // Add remaining lives
    score += context.lives;
    
    // Add bonus points for every 4 placed cards
    const placedCardsCount = context.positionSystem.countNonShipCards();
    score += Math.floor(placedCardsCount / 4);
    
    return score;
}; 