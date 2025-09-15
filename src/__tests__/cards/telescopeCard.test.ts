import { Position } from '../../core';
import { GameContext } from '../../core';
import { getMockContext } from '../mocks';
import { CARD_DATA } from '../../core/cardData';

describe('Карта «Телескоп» (замечен корабль)', () => {
    let mockContext: GameContext;

    beforeEach(() => {
        mockContext = getMockContext();
    });

    describe('onShipMove (обработчик перемещения корабля)', () => {
        it('не должен менять направление, если корабль не на углу', () => {
            const shipCard = mockContext.positionSystem.getShipCard()!;
            
            const originalDirection = shipCard.getCurrentDirection();
            const originalHasTurned = shipCard.hasTurned;

            // Вызываем обработчик
            CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            const resultShipCard = mockContext.positionSystem.getShipCard();
            expect(resultShipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(resultShipCard!.hasTurned).toBe(originalHasTurned);
        });

        it('не должен менять направление, если корабль уже поворачивал', () => {
            const shipCard = mockContext.positionSystem.getShipCard()!;
            // Корабль уже поворачивал
            shipCard.hasTurned = true;
            // Используем getCornerPosition для получения угловой позиции острова
            const cornerPosition = shipCard.cornerManager!.getCornerPosition();
            // Перемещаем корабль на одну позицию за угол для проверки isFinalCornerShipPosition
            const finalCornerPosition = new Position(cornerPosition.row, cornerPosition.col + 1);
            mockContext.positionSystem.moveShip(finalCornerPosition);
            
            const originalDirection = shipCard.getCurrentDirection();

            // Вызываем обработчик
            const result = CARD_DATA.telescope.front.onBeforeShipMove!(mockContext);

            const resultShipCard = result.positionSystem.getShipCard();
            expect(resultShipCard!.getCurrentDirection()).toBe(originalDirection);
            expect(resultShipCard!.hasTurned).toBe(true);
        });

        it('должен изменить направление на углу, если корабль ещё не поворачивал', () => {
            const shipCard = mockContext.positionSystem.getShipCard()!;
            // Корабль на финальной угловой позиции и еще не поворачивал
            const cornerPosition = new Position(0, 5);
            mockContext.positionSystem.moveShip(cornerPosition);
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
