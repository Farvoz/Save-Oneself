import { Position, PositionSystem } from '../../core';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { GameContext } from '../../core';
import { ShipCard } from '../../core';
import { CARD_DATA, ship } from '../../core/cardData';

describe('Карта «Телескоп» (замечен корабль)', () => {
    let mockContext: GameContext;
    let positionSystem: PositionSystem;
    let shipCard: ShipCard;

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

        // Устанавливаем корабль на начальную позицию согласно ShipCornerManager
        const startPosition = shipCard.cornerManager!.getStartShipPosition();
        positionSystem.setPosition(startPosition, shipCard);

        mockContext = {
            playerPosition: new Position(0, 0),
            hasPlacedCard: false,
            lives: 3,
            positionSystem: positionSystem,
            hasMoved: false,
            gameOverMessage: null,
            isVictory: false,
            deck: [],
            movesLeft: 3
        };
    });

    describe('onShipMove (обработчик перемещения корабля)', () => {
        it('не должен менять направление, если корабль не на углу', () => {
            // Корабль не на углу — устанавливаем позицию на валидной стороне для NW (верхняя кромка)
            const bounds = { minRow: 1, maxRow: 2, minCol: 1, maxCol: 2 };
            const topRow = bounds.minRow - 1; // 0
            const centerPosition = new Position(topRow, bounds.minCol); // (0,1) — не угол
            positionSystem.removeShipPosition();
            positionSystem.setPosition(centerPosition, shipCard);
            
            const originalDirection = shipCard.getCurrentDirection();
            const originalHasTurned = shipCard.hasTurned;

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            const resultShipCard = result.positionSystem.getShipCard();
            expect(resultShipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(resultShipCard!.hasTurned).toBe(originalHasTurned);
        });

        it('не должен менять направление, если корабль уже поворачивал', () => {
            // Корабль уже поворачивал
            shipCard.hasTurned = true;
            // Используем getCornerPosition для получения угловой позиции острова
            const cornerPosition = shipCard.cornerManager!.getCornerPosition();
            // Для NW валидная финальная позиция находится на верхней кромке (row - 1)
            const finalCornerPosition = new Position(cornerPosition.row - 1, cornerPosition.col + 1);
            positionSystem.removeShipPosition();
            positionSystem.setPosition(finalCornerPosition, shipCard);
            
            const originalDirection = shipCard.getCurrentDirection();

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            const resultShipCard = result.positionSystem.getShipCard();
            expect(resultShipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(resultShipCard!.hasTurned).toBe(true);
        });

        it('должен изменить направление на углу, если корабль ещё не поворачивал', () => {
            // Корабль на финальной угловой позиции и еще не поворачивал
            const finalCorner = shipCard.cornerManager!.getCornerPosition();
            // Для NW финальная позиция: справа от topRight на верхней кромке
            const cornerPosition = new Position(finalCorner.row - 1, finalCorner.col + 1);
            positionSystem.removeShipPosition();
            positionSystem.setPosition(cornerPosition, shipCard);
            shipCard.hasTurned = false;
            
            const originalDirection = shipCard.getCurrentDirection();
            const expectedNewDirection = shipCard.cornerManager!.getNextDirection();

            // Проверяем, что это действительно финальная позиция
            expect(shipCard.cornerManager!.isFinalCornerShipPosition(cornerPosition)).toBe(true);

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            const resultShipCard = result.positionSystem.getShipCard();
            expect(resultShipCard!.getCurrentDirection()).toBe(expectedNewDirection);
            expect(resultShipCard!.getCurrentDirection()).not.toBe(originalDirection);
            expect(resultShipCard!.hasTurned).toBe(true);
        });
    });
});
