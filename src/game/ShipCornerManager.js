import { Position } from './positionSystem';

// Является частью ShipCard
export class ShipCornerManager {
    constructor(direction, bounds) {
        this.direction = direction;
        this.bounds = bounds;
        this.cornerCoordinates = this.calculateCornerCoordinates();
    }

    calculateCornerCoordinates() {
        const { minRow, maxRow, minCol, maxCol } = this.bounds;
        
        switch(this.direction) {
            case 'NW': 
                return {
                    topLeft: [minRow, minCol],
                    topRight: [minRow, minCol + 3],
                    bottomLeft: [minRow + 3, minCol],
                    bottomRight: [minRow + 3, minCol + 3]
                };
            case 'NE': 
                return {
                    topLeft: [minRow, maxCol - 3],
                    topRight: [minRow, maxCol],
                    bottomLeft: [minRow + 3, maxCol - 3],
                    bottomRight: [minRow + 3, maxCol]
                };
            case 'SW': 
                return {
                    topLeft: [maxRow - 3, minCol],
                    topRight: [maxRow - 3, minCol + 3],
                    bottomLeft: [maxRow, minCol],
                    bottomRight: [maxRow, minCol + 3]
                };
            case 'SE': 
                return {
                    topLeft: [maxRow - 3, maxCol - 3],
                    topRight: [maxRow - 3, maxCol],
                    bottomLeft: [maxRow, maxCol - 3],
                    bottomRight: [maxRow, maxCol]
                };
        }
    }

    isFinalCornerShipPosition(pos) {
        const { topLeft, topRight, bottomLeft, bottomRight } = this.cornerCoordinates;
        
        switch(this.direction) {
            case 'NE': return bottomRight[0] + 1 === pos.row;
            case 'SE': return bottomLeft[1] - 1 === pos.col;
            case 'SW': return topLeft[0] - 1 === pos.row;
            case 'NW': return topRight[1] + 1 === pos.col;
        }
    }

    isCornerCard(pos) {
        const { topLeft, topRight, bottomLeft, bottomRight } = this.cornerCoordinates;

        return pos.equals(new Position(topLeft[0], topLeft[1])) ||
               pos.equals(new Position(topRight[0], topRight[1])) ||
               pos.equals(new Position(bottomLeft[0], bottomLeft[1])) ||
               pos.equals(new Position(bottomRight[0], bottomRight[1]));
    }

    isPlayerValidPosition(pos) {
        const { topLeft, bottomLeft, bottomRight } = this.cornerCoordinates;

        return !(pos.row < topLeft[0] || 
                pos.row > bottomLeft[0] || 
                pos.col < topLeft[1] || 
                pos.col > bottomRight[1]);
    }

    getNextDirection() {
        switch(this.direction) {
            case 'NE': return 'SE';
            case 'SE': return 'SW';
            case 'SW': return 'NW';
            case 'NW': return 'NE';
        }
    }

    getStartShipPosition() {
        const { minRow, maxRow, minCol, maxCol } = this.bounds;
        
        switch(this.direction) {
            case 'NW': return new Position(minRow - 1, minCol - 1);
            case 'NE': return new Position(minRow - 1, maxCol + 1);
            case 'SW': return new Position(maxRow + 1, minCol - 1);
            case 'SE': return new Position(maxRow + 1, maxCol + 1);
        }
    }

    // Helper function to calculate new ship position based on direction
    getNextShipPosition = (pos, direction) => {
        let newRow = pos.row, newCol = pos.col;
        
        switch(direction) {
            case 'NE': newRow++; break;
            case 'SE': newCol--; break;
            case 'SW': newRow--; break;
            case 'NW': newCol++; break;
        }
        
        return new Position(newRow, newCol);
    };

    isShipOutOfBounds(shipPosition) {
        if (!shipPosition) return false;

        const [shipRow, shipCol] = shipPosition.split(',').map(Number);
        const { topLeft, topRight, bottomLeft, bottomRight } = this.cornerCoordinates;
        
        const minRow = Math.min(topLeft[0], bottomLeft[0]);
        const maxRow = Math.max(topRight[0], bottomRight[0]);
        const minCol = Math.min(topLeft[1], topRight[1]);
        const maxCol = Math.max(bottomLeft[1], bottomRight[1]);

        return shipRow < minRow - 1 || shipRow > maxRow + 1 || 
               shipCol < minCol - 1 || shipCol > maxCol + 1;
    }
} 