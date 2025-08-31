import { ShipCornerManager } from '../../core/ShipCornerManager';
import { Position } from '../../core/PositionSystem';

describe('ShipCornerManager', () => {
    // Интерес в том, чтобы границы были меньше 3 по всем сторонам
    const bounds = {
        minRow: 1,
        maxRow: 2,
        minCol: 1,
        maxCol: 2
    };

    describe('calculateIslandBounds', () => {
        test('should calculate correct coordinates for NW direction', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Тестируем через публичные методы вместо прямого доступа к islandBounds
            expect(manager.isIslandCornerCard(new Position(1, 1))).toBe(true);  // topLeft
            expect(manager.isIslandCornerCard(new Position(1, 4))).toBe(true);  // topRight
            expect(manager.isIslandCornerCard(new Position(4, 1))).toBe(true);  // bottomLeft
            expect(manager.isIslandCornerCard(new Position(4, 4))).toBe(true);  // bottomRight
        });

        test('should calculate correct coordinates for NE direction', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isIslandCornerCard(new Position(1, -1))).toBe(true);  // topLeft
            expect(manager.isIslandCornerCard(new Position(1, 2))).toBe(true);   // topRight
            expect(manager.isIslandCornerCard(new Position(4, -1))).toBe(true);  // bottomLeft
            expect(manager.isIslandCornerCard(new Position(4, 2))).toBe(true);   // bottomRight
        });

        test('should calculate correct coordinates for SW direction', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isIslandCornerCard(new Position(-1, 1))).toBe(true);  // topLeft
            expect(manager.isIslandCornerCard(new Position(-1, 4))).toBe(true);  // topRight
            expect(manager.isIslandCornerCard(new Position(2, 1))).toBe(true);   // bottomLeft
            expect(manager.isIslandCornerCard(new Position(2, 4))).toBe(true);   // bottomRight
        });

        test('should calculate correct coordinates for SE direction', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isIslandCornerCard(new Position(-1, -1))).toBe(true); // topLeft
            expect(manager.isIslandCornerCard(new Position(-1, 2))).toBe(true);  // topRight
            expect(manager.isIslandCornerCard(new Position(2, -1))).toBe(true);  // bottomLeft
            expect(manager.isIslandCornerCard(new Position(2, 2))).toBe(true);   // bottomRight
        });
    });

    describe('getStartShipPosition', () => {
        test('should return correct ship position for NW direction', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(0, 0));
        });

        test('should return correct ship position for NE direction', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(0, 3));
        });

        test('should return correct ship position for SW direction', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(3, 0));
        });

        test('should return correct ship position for SE direction', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(3, 3));
        });
    });

    describe('isFinalCornerShipPosition', () => {
        test('should identify corner ship positions for NW direction', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(0, 5))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(0, 3))).toBe(false);
        });

        test('should identify corner ship positions for NE direction', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(5, 3))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(3, 3))).toBe(false);
        });

        test('should identify corner ship positions for SW direction', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(-2, 0))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(0, 0))).toBe(false);
        });

        test('should identify corner ship positions for SE direction', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(3, -2))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(3, 0))).toBe(false);
        });
    });

    describe('isPlayerValidPosition', () => {
        test('should validate positions within bounds', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isPlayerValidPosition(new Position(1, 1))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(4, 4))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(1, 2))).toBe(true);
        });

        test('should invalidate positions outside bounds', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isPlayerValidPosition(new Position(0, 0))).toBe(false);
            expect(manager.isPlayerValidPosition(new Position(0, 4))).toBe(false);
            expect(manager.isPlayerValidPosition(new Position(1, 5))).toBe(false);
        });
    });

    describe('getNextDirection', () => {
        test('should return next direction clockwise', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.getNextDirection()).toBe('SE');

            const manager2 = new ShipCornerManager('SE', bounds);
            expect(manager2.getNextDirection()).toBe('SW');

            const manager3 = new ShipCornerManager('SW', bounds);
            expect(manager3.getNextDirection()).toBe('NW');

            const manager4 = new ShipCornerManager('NW', bounds);
            expect(manager4.getNextDirection()).toBe('NE');
        });
    });

    describe('isShipOutOfBounds', () => {
        test('should return false when ship has no position', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isShipOutOfBounds(null)).toBe(false);
        });

        test('should detect when ship is out of bounds for NW direction', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isShipOutOfBounds(new Position(0, 6))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(0, 0))).toBe(false);
        });

        test('should detect when ship is out of bounds for NE direction', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isShipOutOfBounds(new Position(5, 6))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(5, 3))).toBe(false);
        });

        test('should detect when ship is out of bounds for SW direction', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isShipOutOfBounds(new Position(-3, 0))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(3, 0))).toBe(false);
        });

        test('should detect when ship is out of bounds for SE direction', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isShipOutOfBounds(new Position(5, -1))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(3, 3))).toBe(false);
        });
    });

    describe('getNextShipPosition', () => {
        test('should calculate next position for NE direction', () => {
            const manager = new ShipCornerManager('NE', bounds);
            const currentPos = new Position(2, 3);
            const nextPos = manager.getNextShipPosition(currentPos, 'NE');
            expect(nextPos).toEqual(new Position(3, 3));
        });

        test('should calculate next position for SE direction', () => {
            const manager = new ShipCornerManager('SE', bounds);
            const currentPos = new Position(3, 2);
            const nextPos = manager.getNextShipPosition(currentPos, 'SE');
            expect(nextPos).toEqual(new Position(3, 1));
        });

        test('should calculate next position for SW direction', () => {
            const manager = new ShipCornerManager('SW', bounds);
            const currentPos = new Position(2, 1);
            const nextPos = manager.getNextShipPosition(currentPos, 'SW');
            expect(nextPos).toEqual(new Position(1, 1));
        });

        test('should calculate next position for NW direction', () => {
            const manager = new ShipCornerManager('NW', bounds);
            const currentPos = new Position(1, 2);
            const nextPos = manager.getNextShipPosition(currentPos, 'NW');
            expect(nextPos).toEqual(new Position(1, 3));
        });

        test('should handle zero coordinates', () => {
            const manager = new ShipCornerManager('NW', bounds);
            const currentPos = new Position(0, 0);
            const nextPos = manager.getNextShipPosition(currentPos, 'NE');
            expect(nextPos).toEqual(new Position(1, 0));
        });

        test('should handle negative coordinates', () => {
            const manager = new ShipCornerManager('SW', bounds);
            const currentPos = new Position(-1, -1);
            const nextPos = manager.getNextShipPosition(currentPos, 'SW');
            expect(nextPos).toEqual(new Position(-2, -1));
        });
    });

    describe('isPlayerValidPosition - edge cases', () => {
        test('should validate positions exactly on island boundaries', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Границы острова для NW: topLeft(1,1), topRight(1,4), bottomLeft(4,1), bottomRight(4,4)
            expect(manager.isPlayerValidPosition(new Position(1, 1))).toBe(true);  // topLeft
            expect(manager.isPlayerValidPosition(new Position(1, 4))).toBe(true);  // topRight
            expect(manager.isPlayerValidPosition(new Position(4, 1))).toBe(true);  // bottomLeft
            expect(manager.isPlayerValidPosition(new Position(4, 4))).toBe(true);  // bottomRight
        });

        test('should invalidate positions outside island in all directions', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // За пределами острова
            expect(manager.isPlayerValidPosition(new Position(0, 1))).toBe(false);  // выше
            expect(manager.isPlayerValidPosition(new Position(5, 1))).toBe(false);  // ниже
            expect(manager.isPlayerValidPosition(new Position(1, 0))).toBe(false);  // левее
            expect(manager.isPlayerValidPosition(new Position(1, 5))).toBe(false);  // правее
        });

        test('should validate positions inside island boundaries', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Внутри острова
            expect(manager.isPlayerValidPosition(new Position(2, 2))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(3, 3))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(1, 2))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(2, 1))).toBe(true);
        });

        test('should handle edge cases for different directions', () => {
            const managerNE = new ShipCornerManager('NE', bounds);
            // Для NE: topLeft(1,-1), topRight(1,2), bottomLeft(4,-1), bottomRight(4,2)
            expect(managerNE.isPlayerValidPosition(new Position(1, -1))).toBe(true);  // topLeft
            expect(managerNE.isPlayerValidPosition(new Position(1, 2))).toBe(true);   // topRight
            expect(managerNE.isPlayerValidPosition(new Position(4, -1))).toBe(true);  // bottomLeft
            expect(managerNE.isPlayerValidPosition(new Position(4, 2))).toBe(true);   // bottomRight
            expect(managerNE.isPlayerValidPosition(new Position(1, -2))).toBe(false); // левее
            expect(managerNE.isPlayerValidPosition(new Position(1, 3))).toBe(false);  // правее
        });
    });

    describe('isShipOutOfBounds - edge cases', () => {
        test('should return false when ship is exactly on boundary', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Границы допустимой зоны для корабля: minRow-1 до maxRow+1, minCol-1 до maxCol+1
            // Для bounds {1,2,1,2} допустимая зона: 0-5, 0-5
            expect(manager.isShipOutOfBounds(new Position(0, 0))).toBe(false);   // на границе
            expect(manager.isShipOutOfBounds(new Position(0, 5))).toBe(false);   // на границе
            expect(manager.isShipOutOfBounds(new Position(5, 0))).toBe(false);   // на границе
            expect(manager.isShipOutOfBounds(new Position(5, 5))).toBe(false);   // на границе
        });

        test('should return false when ship is inside island', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Корабль внутри острова (1-2, 1-2)
            expect(manager.isShipOutOfBounds(new Position(1, 1))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(1, 2))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(2, 1))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(2, 2))).toBe(false);
        });

        test('should return false when ship is in valid ship area', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Валидная зона для корабля: 0-5, 0-5
            expect(manager.isShipOutOfBounds(new Position(0, 1))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(1, 0))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(5, 2))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(2, 5))).toBe(false);
        });

        test('should detect ship out of bounds for all directions', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // За пределами допустимой зоны (0-(1-4)-5, 0-(1-4)-5)
            expect(manager.isShipOutOfBounds(new Position(-1, 0))).toBe(true);   // выше
            expect(manager.isShipOutOfBounds(new Position(6, 0))).toBe(true);    // ниже
            expect(manager.isShipOutOfBounds(new Position(0, -1))).toBe(true);   // левее
            expect(manager.isShipOutOfBounds(new Position(0, 6))).toBe(true);    // правее
            expect(manager.isShipOutOfBounds(new Position(-1, -1))).toBe(true);  // диагонально выше-левее
            expect(manager.isShipOutOfBounds(new Position(6, 6))).toBe(true);    // диагонально ниже-правее
        });

        test('should handle edge cases for different directions', () => {
            const managerSE = new ShipCornerManager('SE', bounds);
            // Для SE: допустимая зона корабля: -2...3, -2...3
            expect(managerSE.isShipOutOfBounds(new Position(-2, -2))).toBe(false);   // на границе
            expect(managerSE.isShipOutOfBounds(new Position(3, 3))).toBe(false);   // на границе
            expect(managerSE.isShipOutOfBounds(new Position(-3, -2))).toBe(true);   // выше
            expect(managerSE.isShipOutOfBounds(new Position(-2, -3))).toBe(true);   // левее
        });
    });
}); 