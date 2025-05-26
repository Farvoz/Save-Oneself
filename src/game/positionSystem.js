// Position Management System
// This system handles all position-related operations

export class Position {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    toString() {
        return `${this.row},${this.col}`;
    }

    static fromString(str) {
        const [row, col] = str.split(',').map(Number);
        return new Position(row, col);
    }

    equals(other) {
        return this.row === other.row && this.col === other.col;
    }

    distanceTo(other) {
        return Math.abs(this.row - other.row) + Math.abs(this.col - other.col);
    }

    isValid() {
        return Number.isInteger(this.row) && Number.isInteger(this.col);
    }
}

export class PositionSystem {
    constructor() {
        this.occupiedPositions = new Map();
    }

    setPosition(pos, value) {
        this.occupiedPositions.set(pos.toString(), value);
    }

    getPosition(pos) {
        return this.occupiedPositions.get(pos.toString());
    }

    hasPosition(pos) {
        return this.occupiedPositions.has(pos.toString());
    }

    removePosition(pos) {
        this.occupiedPositions.delete(pos.toString());
    }

    swapPositions(pos1, pos2) {
        const value1 = this.getPosition(pos1);
        const value2 = this.getPosition(pos2);
        this.setPosition(pos1, value2);
        this.setPosition(pos2, value1);
    }

    getBounds() {
        let minRow = Infinity, maxRow = -Infinity;
        let minCol = Infinity, maxCol = -Infinity;

        for (const posStr of this.occupiedPositions.keys()) {
            const pos = Position.fromString(posStr);
            minRow = Math.min(minRow, pos.row);
            maxRow = Math.max(maxRow, pos.row);
            minCol = Math.min(minCol, pos.col);
            maxCol = Math.max(maxCol, pos.col);
        }

        return {
            minRow,
            maxRow,
            minCol,
            maxCol,
            width: maxCol - minCol + 1,
            height: maxRow - minRow + 1
        };
    }

    findCardById(cardId) {
        for (const [posStr, card] of this.occupiedPositions.entries()) {
            if (card.id === cardId) {
                return {
                    position: Position.fromString(posStr),
                    card
                };
            }
        }
        return null;
    }

    findFarthestPosition(fromPos) {
        let maxDistance = -1;
        let farthestPosition = null;

        for (const posStr of this.occupiedPositions.keys()) {
            const pos = Position.fromString(posStr);
            const distance = fromPos.distanceTo(pos);
            
            if (distance > maxDistance) {
                maxDistance = distance;
                farthestPosition = pos;
            }
        }

        return farthestPosition;
    }

    getAdjacentPositions(pos) {
        const adjacent = [];
        const directions = [
            { row: -1, col: 0 },  // up
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 },  // left
            { row: 0, col: 1 }    // right
        ];

        for (const dir of directions) {
            const newPos = new Position(pos.row + dir.row, pos.col + dir.col);
            if (this.hasPosition(newPos)) {
                adjacent.push(newPos);
            }
        }

        return adjacent;
    }

    isOutOfBounds(pos, margin = 0) {
        const bounds = this.getBounds();
        return pos.row < bounds.minRow - margin ||
               pos.row > bounds.maxRow + margin ||
               pos.col < bounds.minCol - margin ||
               pos.col > bounds.maxCol + margin;
    }
} 