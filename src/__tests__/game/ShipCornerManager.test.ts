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

    describe('расчёт границ острова (calculateIslandBounds)', () => {
        test('должен вычислять корректные координаты для направления NW', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Тестируем через публичные методы вместо прямого доступа к islandBounds
            expect(manager.isIslandCornerCard(new Position(1, 1))).toBe(true);  // topLeft
            expect(manager.isIslandCornerCard(new Position(1, 4))).toBe(true);  // topRight
            expect(manager.isIslandCornerCard(new Position(4, 1))).toBe(true);  // bottomLeft
            expect(manager.isIslandCornerCard(new Position(4, 4))).toBe(true);  // bottomRight
        });

        test('должен вычислять корректные координаты для направления NE', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isIslandCornerCard(new Position(1, -1))).toBe(true);  // topLeft
            expect(manager.isIslandCornerCard(new Position(1, 2))).toBe(true);   // topRight
            expect(manager.isIslandCornerCard(new Position(4, -1))).toBe(true);  // bottomLeft
            expect(manager.isIslandCornerCard(new Position(4, 2))).toBe(true);   // bottomRight
        });

        test('должен вычислять корректные координаты для направления SW', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isIslandCornerCard(new Position(-1, 1))).toBe(true);  // topLeft
            expect(manager.isIslandCornerCard(new Position(-1, 4))).toBe(true);  // topRight
            expect(manager.isIslandCornerCard(new Position(2, 1))).toBe(true);   // bottomLeft
            expect(manager.isIslandCornerCard(new Position(2, 4))).toBe(true);   // bottomRight
        });

        test('должен вычислять корректные координаты для направления SE', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isIslandCornerCard(new Position(-1, -1))).toBe(true); // topLeft
            expect(manager.isIslandCornerCard(new Position(-1, 2))).toBe(true);  // topRight
            expect(manager.isIslandCornerCard(new Position(2, -1))).toBe(true);  // bottomLeft
            expect(manager.isIslandCornerCard(new Position(2, 2))).toBe(true);   // bottomRight
        });
    });

    describe('стартовая позиция корабля (getStartShipPosition)', () => {
        test('должен возвращать корректную позицию корабля для NW', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(0, 0));
        });

        test('должен возвращать корректную позицию корабля для NE', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(0, 3));
        });

        test('должен возвращать корректную позицию корабля для SW', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(3, 0));
        });

        test('должен возвращать корректную позицию корабля для SE', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.getStartShipPosition()).toEqual(new Position(3, 3));
        });
    });

    describe('финальная угловая позиция корабля (isFinalCornerShipPosition)', () => {
        test('должен определять угловые позиции для направления NW', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(0, 5))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(0, 3))).toBe(false);
        });

        test('должен определять угловые позиции для направления NE', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(5, 3))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(3, 3))).toBe(false);
        });

        test('должен определять угловые позиции для направления SW', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(-2, 0))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(0, 0))).toBe(false);
        });

        test('должен определять угловые позиции для направления SE', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isFinalCornerShipPosition(new Position(3, -2))).toBe(true);
            expect(manager.isFinalCornerShipPosition(new Position(3, 0))).toBe(false);
        });
    });

    describe('валидация позиции игрока (isPlayerValidPosition)', () => {
        test('должен валидировать позиции в допустимых границах', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isPlayerValidPosition(new Position(1, 1))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(4, 4))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(1, 2))).toBe(true);
        });

        test('должен отклонять позиции вне границ', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isPlayerValidPosition(new Position(0, 0))).toBe(false);
            expect(manager.isPlayerValidPosition(new Position(0, 4))).toBe(false);
            expect(manager.isPlayerValidPosition(new Position(1, 5))).toBe(false);
        });
    });

    describe('следующее направление (getNextDirection)', () => {
        test('должен возвращать следующее направление по часовой стрелке', () => {
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

    describe('корабль вне допустимой зоны (isShipOutOfBounds)', () => {
        test('должен возвращать false, когда у корабля нет позиции', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isShipOutOfBounds(null)).toBe(false);
        });

        test('должен определять выход за границы для направления NW', () => {
            const manager = new ShipCornerManager('NW', bounds);
            expect(manager.isShipOutOfBounds(new Position(0, 6))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(0, 0))).toBe(false);
        });

        test('должен определять выход за границы для направления NE', () => {
            const manager = new ShipCornerManager('NE', bounds);
            expect(manager.isShipOutOfBounds(new Position(5, 6))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(5, 3))).toBe(false);
        });

        test('должен определять выход за границы для направления SW', () => {
            const manager = new ShipCornerManager('SW', bounds);
            expect(manager.isShipOutOfBounds(new Position(-3, 0))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(3, 0))).toBe(false);
        });

        test('должен определять выход за границы для направления SE', () => {
            const manager = new ShipCornerManager('SE', bounds);
            expect(manager.isShipOutOfBounds(new Position(5, -1))).toBe(true);
            expect(manager.isShipOutOfBounds(new Position(3, 3))).toBe(false);
        });
    });

    describe('следующая позиция корабля (getNextShipPosition)', () => {
        test('должен вычислять следующую позицию для направления NE', () => {
            const manager = new ShipCornerManager('NE', bounds);
            const currentPos = new Position(2, 3);
            const nextPos = manager.getNextShipPosition(currentPos, 'NE');
            expect(nextPos).toEqual(new Position(3, 3));
        });

        test('должен вычислять следующую позицию для направления SE', () => {
            const manager = new ShipCornerManager('SE', bounds);
            const currentPos = new Position(3, 2);
            const nextPos = manager.getNextShipPosition(currentPos, 'SE');
            expect(nextPos).toEqual(new Position(3, 1));
        });

        test('должен вычислять следующую позицию для направления SW', () => {
            const manager = new ShipCornerManager('SW', bounds);
            const currentPos = new Position(2, 1);
            const nextPos = manager.getNextShipPosition(currentPos, 'SW');
            expect(nextPos).toEqual(new Position(1, 1));
        });

        test('должен вычислять следующую позицию для направления NW', () => {
            const manager = new ShipCornerManager('NW', bounds);
            const currentPos = new Position(1, 2);
            const nextPos = manager.getNextShipPosition(currentPos, 'NW');
            expect(nextPos).toEqual(new Position(1, 3));
        });

        test('должен обрабатывать нулевые координаты', () => {
            const manager = new ShipCornerManager('NW', bounds);
            const currentPos = new Position(0, 0);
            const nextPos = manager.getNextShipPosition(currentPos, 'NE');
            expect(nextPos).toEqual(new Position(1, 0));
        });

        test('должен обрабатывать отрицательные координаты', () => {
            const manager = new ShipCornerManager('SW', bounds);
            const currentPos = new Position(-1, -1);
            const nextPos = manager.getNextShipPosition(currentPos, 'SW');
            expect(nextPos).toEqual(new Position(-2, -1));
        });
    });

    describe('валидация позиции игрока — краевые случаи', () => {
        test('должен валидировать позиции ровно на границах острова', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Границы острова для NW: topLeft(1,1), topRight(1,4), bottomLeft(4,1), bottomRight(4,4)
            expect(manager.isPlayerValidPosition(new Position(1, 1))).toBe(true);  // topLeft
            expect(manager.isPlayerValidPosition(new Position(1, 4))).toBe(true);  // topRight
            expect(manager.isPlayerValidPosition(new Position(4, 1))).toBe(true);  // bottomLeft
            expect(manager.isPlayerValidPosition(new Position(4, 4))).toBe(true);  // bottomRight
        });

        test('должен отклонять позиции вне острова во всех направлениях', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // За пределами острова
            expect(manager.isPlayerValidPosition(new Position(0, 1))).toBe(false);  // выше
            expect(manager.isPlayerValidPosition(new Position(5, 1))).toBe(false);  // ниже
            expect(manager.isPlayerValidPosition(new Position(1, 0))).toBe(false);  // левее
            expect(manager.isPlayerValidPosition(new Position(1, 5))).toBe(false);  // правее
        });

        test('должен валидировать позиции внутри границ острова', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Внутри острова
            expect(manager.isPlayerValidPosition(new Position(2, 2))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(3, 3))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(1, 2))).toBe(true);
            expect(manager.isPlayerValidPosition(new Position(2, 1))).toBe(true);
        });

        test('должен корректно обрабатывать краевые случаи для разных направлений', () => {
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

    describe('корабль вне допустимой зоны — краевые случаи', () => {
        test('должен возвращать false, когда корабль ровно на границе', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Границы допустимой зоны для корабля: minRow-1 до maxRow+1, minCol-1 до maxCol+1
            // Для bounds {1,2,1,2} допустимая зона: 0-5, 0-5
            expect(manager.isShipOutOfBounds(new Position(0, 0))).toBe(false);   // на границе
            expect(manager.isShipOutOfBounds(new Position(0, 5))).toBe(false);   // на границе
            expect(manager.isShipOutOfBounds(new Position(5, 0))).toBe(false);   // на границе
            expect(manager.isShipOutOfBounds(new Position(5, 5))).toBe(false);   // на границе
        });

        test('должен возвращать false, когда корабль внутри острова', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Корабль внутри острова (1-2, 1-2)
            expect(manager.isShipOutOfBounds(new Position(1, 1))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(1, 2))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(2, 1))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(2, 2))).toBe(false);
        });

        test('должен возвращать false, когда корабль в допустимой зоне', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // Валидная зона для корабля: 0-5, 0-5
            expect(manager.isShipOutOfBounds(new Position(0, 1))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(1, 0))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(5, 2))).toBe(false);
            expect(manager.isShipOutOfBounds(new Position(2, 5))).toBe(false);
        });

        test('должен обнаруживать выход корабля за границы для всех направлений', () => {
            const manager = new ShipCornerManager('NW', bounds);
            // За пределами допустимой зоны (0-(1-4)-5, 0-(1-4)-5)
            expect(manager.isShipOutOfBounds(new Position(-1, 0))).toBe(true);   // выше
            expect(manager.isShipOutOfBounds(new Position(6, 0))).toBe(true);    // ниже
            expect(manager.isShipOutOfBounds(new Position(0, -1))).toBe(true);   // левее
            expect(manager.isShipOutOfBounds(new Position(0, 6))).toBe(true);    // правее
            expect(manager.isShipOutOfBounds(new Position(-1, -1))).toBe(true);  // диагонально выше-левее
            expect(manager.isShipOutOfBounds(new Position(6, 6))).toBe(true);    // диагонально ниже-правее
        });

        test('должен корректно обрабатывать краевые случаи для разных направлений', () => {
            const managerSE = new ShipCornerManager('SE', bounds);
            // Для SE: допустимая зона корабля: -2...3, -2...3
            expect(managerSE.isShipOutOfBounds(new Position(-2, -2))).toBe(false);   // на границе
            expect(managerSE.isShipOutOfBounds(new Position(3, 3))).toBe(false);   // на границе
            expect(managerSE.isShipOutOfBounds(new Position(-3, -2))).toBe(true);   // выше
            expect(managerSE.isShipOutOfBounds(new Position(-2, -3))).toBe(true);   // левее
        });
    });
}); 