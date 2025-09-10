import { GameCard } from '../../core';
import { GameContext } from '../../core';   
import { CARD_DATA } from '../../core/cardData';
import { getMockContext } from '../mocks';

describe('Карта «Телескоп» (замечен корабль)', () => {
    let mockContext: GameContext;
    let telescopeCard: GameCard;


    beforeEach(() => {
        mockContext = getMockContext();

        telescopeCard = new GameCard(CARD_DATA.telescope.back, CARD_DATA.telescope.front);

    });

    describe('canFlip (проверка возможности переворота)', () => {
        it('должна позволить переворот, когда игрок находится на higher-ground', () => {
            // Создаем карту higher-ground и размещаем игрока на ней
            const higherGroundCard = new GameCard(CARD_DATA.higherGround.back, CARD_DATA.higherGround.front);
            mockContext.positionSystem.setPosition(mockContext.playerPosition!, higherGroundCard);

            const canFlip = telescopeCard.canFlip!(mockContext);
            expect(canFlip).toBe(true);
        });

        it('НЕ должна позволить переворот, когда игрок НЕ находится на higher-ground', () => {
            // Игрок не на higher-ground - размещаем обычную карту
            const waterCard = new GameCard(CARD_DATA.water.back, CARD_DATA.water.front);
            mockContext.positionSystem.setPosition(mockContext.playerPosition!, waterCard);

            const canFlip = telescopeCard.canFlip!(mockContext);
            expect(canFlip).toBe(false);
        });
    });

    describe('onBeforeShipMove: должен изменить направление корабля', () => {
        it('на углу острова только 1 раз', () => {
            const shipCard = mockContext.positionSystem.getShipCard();
            const futureDirection = shipCard?.cornerManager.getNextDirection();

            const cornerPos = shipCard!.cornerManager.getCornerPosition();
            mockContext.positionSystem.swapPositions(cornerPos, shipCard!.cornerManager.getStartShipPosition());

            const newContext = telescopeCard.frontSide.onBeforeShipMove!(mockContext);
            expect(futureDirection).toBe(newContext.positionSystem.getShipCard()!.getCurrentDirection());

            const futureDirection2 = newContext.positionSystem.getShipCard()!.cornerManager.getNextDirection();
            const cornerPos2 = newContext.positionSystem.getShipCard()!.cornerManager.getCornerPosition();
            newContext.positionSystem.swapPositions(cornerPos2, cornerPos);

            console.log(cornerPos2)
            console.log(futureDirection2)

            const newContext2 = telescopeCard.frontSide.onBeforeShipMove!(newContext);
            expect(futureDirection2).not.toBe(newContext2.positionSystem.getShipCard()!.getCurrentDirection());
        });
    });
});
