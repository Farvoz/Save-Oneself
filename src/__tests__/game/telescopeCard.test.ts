import { Position, PositionSystem } from '../../core/PositionSystem';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { GameContext } from '../../core/gameData';
import { Direction } from '../../core/Card';
import { ShipCard } from '../../core/ShipCard';
import { CARD_DATA, ship } from '../../core/cardData';

describe('Telescope Card (ship-sighted)', () => {
    let mockContext: GameContext;
    let shipCard: ShipCard;
    let positionSystem: PositionSystem;

    beforeEach(() => {
        const bounds = {
            minRow: 1,
            maxRow: 2,
            minCol: 1,
            maxCol: 2
        };

        positionSystem = new PositionSystem();
        
        // Создаем корабль, направляющийся на северо-запад
        shipCard = new ShipCard(
            ship,
            'NW',
            new ShipCornerManager('NW', bounds)
        );

        mockContext = {
            playerPosition: new Position(0, 0),
            hasPlacedCard: false,
            lives: 3,
            positionSystem: positionSystem,
            shipCard: shipCard,
            hasMoved: false,
            gameOverMessage: null,
            isVictory: false,
            deck: [],
            movesLeft: 3
        };
    });

    describe('onShipMove handler', () => {
        it('should not change ship direction when ship has no position', () => {
            // Убираем позицию корабля из positionSystem
            const originalPosition = positionSystem.getShipPosition();
            positionSystem.removeShipPosition();
            
            const originalDirection = shipCard.getCurrentDirection();
            const originalHasTurned = shipCard.hasTurned;

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result.shipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(result.shipCard!.hasTurned).toBe(originalHasTurned);
            
            // Восстанавливаем позицию
            if (originalPosition) {
                positionSystem.setPosition(originalPosition, shipCard);
            }
        });

        it('should not change ship direction when ship has no direction', () => {
            // Убираем направление корабля
            const originalDirection = shipCard.direction;
            shipCard.direction = undefined as unknown as Direction;
            
            const originalHasTurned = shipCard.hasTurned;

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result.shipCard!.hasTurned).toBe(originalHasTurned);
            
            // Восстанавливаем направление
            shipCard.direction = originalDirection;
        });

        it('should not change ship direction when ship is not at corner', () => {
            // Корабль не на углу - устанавливаем позицию в центр
            const centerPosition = new Position(1, 1);
            positionSystem.setPosition(centerPosition, shipCard);
            
            const originalDirection = shipCard.getCurrentDirection();
            const originalHasTurned = shipCard.hasTurned;

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result.shipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(result.shipCard!.hasTurned).toBe(originalHasTurned);
        });

        it('should not change ship direction when ship has already turned', () => {
            // Корабль уже поворачивал
            shipCard.hasTurned = true;
            const cornerPosition = new Position(0, 5); // На финальной угловой позиции для NW
            positionSystem.setPosition(cornerPosition, shipCard);
            
            const originalDirection = shipCard.getCurrentDirection();

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result.shipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(result.shipCard!.hasTurned).toBe(true);
        });

        it('should change ship direction when ship is at corner and has not turned', () => {
            // Корабль на финальной угловой позиции и еще не поворачивал
            const cornerPosition = new Position(0, 5); // Финальная угловая позиция для NW
            positionSystem.setPosition(cornerPosition, shipCard);
            shipCard.hasTurned = false;
            
            const originalDirection = shipCard.getCurrentDirection();
            const expectedNewDirection = shipCard.cornerManager!.getNextDirection();

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result.shipCard!.getCurrentDirection()).toBe(expectedNewDirection);
            expect(result.shipCard!.getCurrentDirection()).not.toBe(originalDirection);
            expect(result.shipCard!.hasTurned).toBe(true);
        });

        it('should only turn ship once even if called multiple times', () => {
            // Корабль на финальной угловой позиции и еще не поворачивал
            const cornerPosition = new Position(0, 5); // Финальная угловой позиции для NW
            positionSystem.setPosition(cornerPosition, shipCard);
            shipCard.hasTurned = false;
            
            const firstNewDirection = shipCard.cornerManager!.getNextDirection();

            // Первый вызов - корабль поворачивает
            let result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);
            expect(result.shipCard!.getCurrentDirection()).toBe(firstNewDirection);
            expect(result.shipCard!.hasTurned).toBe(true);

            // Второй вызов - корабль не поворачивает
            result = CARD_DATA.telescope.front.onBeforeShipMove!(result);
            expect(result.shipCard!.getCurrentDirection()).toBe(firstNewDirection); // Направление не изменилось
            expect(result.shipCard!.hasTurned).toBe(true);
        });

        it('should work with different ship directions', () => {
            // Тестируем с кораблем, направляющимся на юго-восток
            const seShipCard = new ShipCard(
                ship,
                'SE',
                new ShipCornerManager('SE', { minRow: 1, maxRow: 2, minCol: 1, maxCol: 2 })
            );
            
            mockContext.shipCard = seShipCard;
            seShipCard.hasTurned = false;

            // Помещаем корабль на финальную угловую позицию для SE
            const finalCornerPosition = new Position(3, -2); // maxRow + 1, bottomLeft[1] - 1
            mockContext.positionSystem.setPosition(finalCornerPosition, seShipCard);

            const originalDirection = seShipCard.getCurrentDirection();
            const expectedNewDirection = seShipCard.cornerManager!.getNextDirection();

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result.shipCard!.getCurrentDirection()).toBe(expectedNewDirection);
            expect(result.shipCard!.getCurrentDirection()).not.toBe(originalDirection);
            expect(result.shipCard!.hasTurned).toBe(true);
        });

        it('should return the same context when no changes are made', () => {
            // Корабль не на углу
            const centerPosition = new Position(1, 1);
            positionSystem.setPosition(centerPosition, shipCard);
            
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            expect(result).toBe(mockContext);
        });

        it('should return modified context when ship direction is changed', () => {
            // Корабль на финальной угловой позиции и еще не поворачивал
            const cornerPosition = new Position(0, 5); // Финальная угловая позиция для NW
            positionSystem.setPosition(cornerPosition, shipCard);
            shipCard.hasTurned = false;

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            // Обработчик изменяет объект корабля напрямую, поэтому контекст остается тем же
            expect(result).toBe(mockContext);
            expect(result.shipCard!.hasTurned).toBe(true);
            expect(result.shipCard!.getCurrentDirection()).toBe('NE'); // Направление изменилось с NW на NE
        });
    });
});
