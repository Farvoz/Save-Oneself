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

    describe('calculateCornerCoordinates', () => {
        test('should calculate correct coordinates for NW direction', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Тестируем через публичные методы вместо прямого доступа к cornerCoordinates
            expect(manager.isCornerCard(new Position(1, 1))).toBe(true);  // topLeft
            expect(manager.isCornerCard(new Position(1, 4))).toBe(true);  // topRight
            expect(manager.isCornerCard(new Position(4, 1))).toBe(true);  // bottomLeft
            expect(manager.isCornerCard(new Position(4, 4))).toBe(true);  // bottomRight
        });

        test('should calculate correct coordinates for NE direction', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isCornerCard(new Position(1, -1))).toBe(true);  // topLeft
            expect(manager.isCornerCard(new Position(1, 2))).toBe(true);   // topRight
            expect(manager.isCornerCard(new Position(4, -1))).toBe(true);  // bottomLeft
            expect(manager.isCornerCard(new Position(4, 2))).toBe(true);   // bottomRight
        });

        test('should calculate correct coordinates for SW direction', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isCornerCard(new Position(-1, 1))).toBe(true);  // topLeft
            expect(manager.isCornerCard(new Position(-1, 4))).toBe(true);  // topRight
            expect(manager.isCornerCard(new Position(2, 1))).toBe(true);   // bottomLeft
            expect(manager.isCornerCard(new Position(2, 4))).toBe(true);   // bottomRight
        });

        test('should calculate correct coordinates for SE direction', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isCornerCard(new Position(-1, -1))).toBe(true); // topLeft
            expect(manager.isCornerCard(new Position(-1, 2))).toBe(true);  // topRight
            expect(manager.isCornerCard(new Position(2, -1))).toBe(true);  // bottomLeft
            expect(manager.isCornerCard(new Position(2, 2))).toBe(true);   // bottomRight
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

    describe('isCornerCard', () => {
        test('should identify corner card positions', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isCornerCard(new Position(1, 1))).toBe(true);  // topLeft
            expect(manager.isCornerCard(new Position(1, 4))).toBe(true);  // topRight
            expect(manager.isCornerCard(new Position(4, 1))).toBe(true);  // bottomLeft
            expect(manager.isCornerCard(new Position(4, 4))).toBe(true);  // bottomRight
            expect(manager.isCornerCard(new Position(1, 2))).toBe(false); // not a corner
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
}); 