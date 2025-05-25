// Game rules and validation functions

// Функция для проверки, является ли позиция угловой
export const isCorner = (cornerCoordinates, row, col) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = cornerCoordinates;

    return (row === topLeft[0] && col === topLeft[1]) ||
           (row === topRight[0] && col === topRight[1]) ||
           (row === bottomLeft[0] && col === bottomLeft[1]) ||
           (row === bottomRight[0] && col === bottomRight[1]);
};

// Check if a position is valid for card moving
export const isValidPosition = (context, row, col) => {
    if (!context.playerPosition && row === 0 && col === 0) return true;
    
    if (!hasMaxRowsOrColumns(context, row, col)) return false;

    if (context.playerPosition) {
        const [currentRow, currentCol] = context.playerPosition.split(',').map(Number);
        const isAdjacent = Math.abs(row - currentRow) + Math.abs(col - currentCol) === 1;
        if (!isAdjacent) return false;
    }
    
    if (context.shipCard.direction) {
        let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;

        context.occupiedPositions.forEach((card, pos) => {
            if (card.type === 'ship') return;
            const [cardRow, cardCol] = pos.split(',').map(Number);
            minRow = Math.min(minRow, cardRow);
            maxRow = Math.max(maxRow, cardRow);
            minCol = Math.min(minCol, cardCol);
            maxCol = Math.max(maxCol, cardCol);
        });

        switch(context.shipCard.direction) {
            case 'NE': if (row < minRow || col > maxCol) return false; break;
            case 'SE': if (row > maxRow || col > maxCol) return false; break;
            case 'SW': if (row > maxRow || col < minCol) return false; break;
            case 'NW': if (row < minRow || col < minCol) return false; break;
        }
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
            const [playerRow, playerCol] = context.playerPosition.split(',').map(Number);
            const playerCard = context.occupiedPositions.get(`${playerRow},${playerCol}`);
            if (!playerCard || playerCard.id !== 'higher-ground') {
                return false;
            }
        }
        
        for (const [_, otherCard] of context.occupiedPositions) {
            if (otherCard.id === card.requirements) {
                return true;
            }
        }
        return false;
    }
    
    return true;
};

// Check if there are any flippable cards on the board
export const hasFlippableCards = (context) => {
    for (const [_, card] of context.occupiedPositions) {
        if (card.type === 'back' && canFlipCard(context, card)) {
            return true;
        }
    }
    return false;
};

// Check if the game is won
// return boolean
export const checkVictory = (context) => {
    let sosPosition = null;
    let beaconPosition = null;
    let messagePosition = null;
    
    for (const [pos, card] of context.occupiedPositions) {
        if (card.id === 'sos') sosPosition = pos.split(',').map(Number);
        else if (card.id === 'lit-beacon') beaconPosition = pos.split(',').map(Number);
        else if (card.id === 'message') messagePosition = pos.split(',').map(Number);
    }
    
    if (!context.shipCard.position) return false;
    
    const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
    const sosVictory = sosPosition && shipRow === sosPosition[0];
    const beaconVictory = beaconPosition && shipCol === beaconPosition[1];
    
    // Check message victory condition
    let messageVictory = false;
    if (messagePosition) {
        const [msgRow, msgCol] = messagePosition;
        
        // Check if message card is not in a corner
        const isCorner = isCorner(context.shipCard.cornerCoordinates, msgRow, msgCol);
        
        if (!isCorner) {
            // Check if ship is adjacent to message card
            const isAdjacent = Math.abs(shipRow - msgRow) + Math.abs(shipCol - msgCol) === 1;
            messageVictory = isAdjacent;
        }
    }
    
    return sosVictory || beaconVictory || messageVictory;
};

// Helper function to check if adding a card would exceed row/column limits
const hasMaxRowsOrColumns = (context, row, col) => {
    const positions = Array.from(context.occupiedPositions.entries())
        .filter(([_, card]) => card.type !== 'ship')
        .map(([pos]) => pos.split(',').map(Number));
    positions.push([row, col]);
    
    const uniqueRows = [...new Set(positions.map(pos => pos[0]))];
    const uniqueCols = [...new Set(positions.map(pos => pos[1]))];
    
    return uniqueRows.length <= 4 && uniqueCols.length <= 4;
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