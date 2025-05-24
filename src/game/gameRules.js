// Game rules and validation functions

// Check if a position is valid for card moving
export const isValidPosition = (context, row, col) => {
    // Special case for first card moving
    if (!context.playerPosition && row === 0 && col === 0) return true;

    if (row < -3 || row > 3 || col < -3 || col > 3) return false;
    if (Math.abs(row) === 3 && Math.abs(col) === 3) return false;
    
    if (!hasMaxRowsOrColumns(context, row, col)) return false;

    if (context.playerPosition) {
        const [currentRow, currentCol] = context.playerPosition.split(',').map(Number);
        const isAdjacent = Math.abs(row - currentRow) + Math.abs(col - currentCol) === 1;
        if (!isAdjacent) return false;
    }
    
    if (context.shipCard.direction) {
        let minRow = 3, maxRow = -3, minCol = 3, maxCol = -3;
        context.occupiedPositions.forEach((card, pos) => {
            if (card.id === 'ship') return;
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
export const checkVictory = (context) => {
    let sosPosition = null;
    let beaconPosition = null;
    
    for (const [pos, card] of context.occupiedPositions) {
        if (card.type === 'front') {
            if (card.id === 'sos') sosPosition = pos.split(',').map(Number);
            else if (card.id === 'lit-beacon') beaconPosition = pos.split(',').map(Number);
        }
    }
    
    if (!context.shipCard.position || !context.shipCard.skipMove) return false;
    
    const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
    const sosVictory = sosPosition && shipRow === sosPosition[0];
    const beaconVictory = beaconPosition && shipCol === beaconPosition[1];
    
    return sosVictory || beaconVictory;
};

// Helper function to check if adding a card would exceed row/column limits
const hasMaxRowsOrColumns = (context, row, col) => {
    const positions = Array.from(context.occupiedPositions.entries())
        .filter(([_, card]) => card !== context.shipCard)
        .map(([pos]) => pos.split(',').map(Number));
    positions.push([row, col]);
    
    const uniqueRows = [...new Set(positions.map(pos => pos[0]))];
    const uniqueCols = [...new Set(positions.map(pos => pos[1]))];
    
    return uniqueRows.length <= 4 && uniqueCols.length <= 4;
}; 