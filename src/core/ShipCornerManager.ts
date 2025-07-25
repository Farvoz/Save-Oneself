import { Position } from './PositionSystem';

type ShipDirection = 'NW' | 'NE' | 'SW' | 'SE';

interface Bounds {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
}

interface CornerCoordinates {
    topLeft: [number, number];
    topRight: [number, number];
    bottomLeft: [number, number];
    bottomRight: [number, number];
}

// Является частью ShipCard
export class ShipCornerManager {
    private direction: ShipDirection;
    private bounds: Bounds;
    private cornerCoordinates: CornerCoordinates;

    constructor(direction: ShipDirection, bounds: Bounds) {
        this.direction = direction;
        this.bounds = bounds;
        this.cornerCoordinates = this.calculateCornerCoordinates();
    }

    private calculateCornerCoordinates(): CornerCoordinates {
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

    isFinalCornerShipPosition(pos: Position): boolean {
        const { topLeft, topRight, bottomLeft, bottomRight } = this.cornerCoordinates;
        
        switch(this.direction) {
            case 'NE': return bottomRight[0] + 1 === pos.row;
            case 'SE': return bottomLeft[1] - 1 === pos.col;
            case 'SW': return topLeft[0] - 1 === pos.row;
            case 'NW': return topRight[1] + 1 === pos.col;
        }
    }

    isCornerCard(pos: Position): boolean {
        const { topLeft, topRight, bottomLeft, bottomRight } = this.cornerCoordinates;

        return pos.equals(new Position(topLeft[0], topLeft[1])) ||
               pos.equals(new Position(topRight[0], topRight[1])) ||
               pos.equals(new Position(bottomLeft[0], bottomLeft[1])) ||
               pos.equals(new Position(bottomRight[0], bottomRight[1]));
    }

    isPlayerValidPosition(pos: Position): boolean {
        const { topLeft, bottomLeft, bottomRight } = this.cornerCoordinates;

        return !(pos.row < topLeft[0] || 
                pos.row > bottomLeft[0] || 
                pos.col < topLeft[1] || 
                pos.col > bottomRight[1]);
    }

    getNextDirection(): ShipDirection {
        switch(this.direction) {
            case 'NE': return 'SE';
            case 'SE': return 'SW';
            case 'SW': return 'NW';
            case 'NW': return 'NE';
        }
    }

    getStartShipPosition(): Position {
        const { minRow, maxRow, minCol, maxCol } = this.bounds;
        
        switch(this.direction) {
            case 'NW': return new Position(minRow - 1, minCol - 1);
            case 'NE': return new Position(minRow - 1, maxCol + 1);
            case 'SW': return new Position(maxRow + 1, minCol - 1);
            case 'SE': return new Position(maxRow + 1, maxCol + 1);
        }
    }

    // Helper function to calculate new ship position based on direction
    getNextShipPosition = (pos: Position, direction: ShipDirection): Position => {
        let newRow = pos.row, newCol = pos.col;
        
        switch(direction) {
            case 'NE': newRow++; break;
            case 'SE': newCol--; break;
            case 'SW': newRow--; break;
            case 'NW': newCol++; break;
        }
        
        return new Position(newRow, newCol);
    };

    isShipOutOfBounds(shipPosition: Position | null): boolean {
        if (!shipPosition) return false;

        const { topLeft, topRight, bottomLeft, bottomRight } = this.cornerCoordinates;
        
        const minRow = Math.min(topLeft[0], bottomLeft[0]);
        const maxRow = Math.max(topRight[0], bottomRight[0]);
        const minCol = Math.min(topLeft[1], topRight[1]);
        const maxCol = Math.max(bottomLeft[1], bottomRight[1]);

        return shipPosition.row < minRow - 1 || shipPosition.row > maxRow + 1 || 
               shipPosition.col < minCol - 1 || shipPosition.col > maxCol + 1;
    }
} 