// Position System
// This system handles all position-related operations

import { GameCard } from './Card';

export class Position {
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    toString(): string {
        return `${this.row},${this.col}`;
    }

    static fromString(str: string): Position {
        const [row, col] = str.split(',').map(Number);
        return new Position(row, col);
    }

    equals(other: Position): boolean {
        return this.row === other.row && this.col === other.col;
    }

    // Возвращает количество клеток, если игрок перемещается
    distanceTo(other: Position): number {
        return Math.abs(this.row - other.row) + Math.abs(this.col - other.col);
    }

    isValid(): boolean {
        return Number.isInteger(this.row) && Number.isInteger(this.col);
    }
}

export class PositionSystem {
    MAX_COLUMNS = 4;
    MAX_ROWS = 4;
    occupiedPositions: Map<string, GameCard>;
    
    constructor() {
        this.occupiedPositions = new Map();
    }

    // Методы для работы с позицией корабля
    getShipPosition(): Position | null {
        const shipResults = this.findAllBy(card => card.getCurrentType() === 'ship');
        return shipResults.length > 0 ? shipResults[0].position : null;
    }

    removeShipPosition(): void {
        const shipResults = this.findAllBy(card => card.getCurrentType() === 'ship');
        if (shipResults.length > 0) {
            this.removePosition(shipResults[0].position);
        }
    }

    setPosition(pos: Position, value: GameCard): void {
        if (value === undefined) {
            throw new Error('Value is undefined');
        }
        
        this.occupiedPositions.set(pos.toString(), value);
    }

    getPosition(pos: Position): GameCard | undefined {
        return this.occupiedPositions.get(pos.toString());
    }

    hasPosition(pos: Position): boolean {
        return this.occupiedPositions.has(pos.toString());
    }

    removePosition(pos: Position): void {
        this.occupiedPositions.delete(pos.toString());
    }

    swapPositions(pos1: Position, pos2: Position): void {
        const value1 = this.getPosition(pos1);
        const value2 = this.getPosition(pos2);

        if (value1 !== undefined) {
            this.setPosition(pos2, value1);
        } else {
            this.removePosition(pos2);
        }

        if (value2 !== undefined) {
            this.setPosition(pos1, value2);
        } else {
            this.removePosition(pos1);
        }
    }

    // Вычисляет границы поля, состоящего из карт и корабля
    getBounds(): { minRow: number; maxRow: number; minCol: number; maxCol: number; width: number; height: number } {
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

    findCardById(cardId: string): { position: Position; card: GameCard } | null {
        for (const [posStr, card] of this.occupiedPositions.entries()) {
            if (card.getCurrentId() === cardId) {
                return {
                    position: Position.fromString(posStr),
                    card
                };
            }
        }
        return null;
    }

    findAllBy(func: (card: GameCard) => boolean): Array<{ position: Position; card: GameCard }> {
        const result: Array<{ position: Position; card: GameCard }> = [];
        for (const [posStr, card] of this.occupiedPositions.entries()) {
            if (func(card)) {
                result.push({ position: Position.fromString(posStr), card });
            }   
        }
        return result;
    }

    findFarthestPosition(fromPos: Position): Position | null {
        let maxDistance = -1;
        let farthestPosition: Position | null = null;

        for (const [posStr, card] of this.occupiedPositions.entries()) {
            // Исключаем карты корабля из поиска
            if (card.getCurrentType() === 'ship') {
                continue;
            }
            
            const pos = Position.fromString(posStr);
            const distance = fromPos.distanceTo(pos);
            
            if (distance > maxDistance) {
                maxDistance = distance;
                farthestPosition = pos;
            }
        }

        return farthestPosition;
    }

    getAdjacentPositions(pos: Position): Position[] {
        const adjacent: Position[] = [];
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

    isAdjacent(pos1: Position, pos2: Position): boolean {
        return pos1.distanceTo(pos2) === 1;
    }

    isOutOfBounds(pos: Position): boolean {
        const positions = this.findAllBy(card => card.getCurrentType() !== 'ship').map(card => card.position);
        positions.push(pos);
        
        const uniqueRows = [...new Set(positions.map(pos => pos.row))];
        const uniqueCols = [...new Set(positions.map(pos => pos.col))];
        
        return uniqueRows.length > 4 || uniqueCols.length > 4;
    }

    countNonShipCards(): number {
        return this.findAllBy(card => card.getCurrentType() !== 'ship').length;
    }

    // Клонирует PositionSystem
    clone(): PositionSystem {
        const cloned = new PositionSystem();
        for (const [posStr, card] of this.occupiedPositions.entries()) {
            cloned.occupiedPositions.set(posStr, card);
        }
        return cloned;
    }
} 