import { GameCard, GameContext } from '../../core';
import { CARD_DATA } from '../../core/cardData';
import { getMockContext } from '../mocks';

describe('Карта «Пираты»', () => {
    let piratesCard: GameCard;
    let mockContext: GameContext;

    beforeEach(() => {
        piratesCard = new GameCard(CARD_DATA.pirates.back, CARD_DATA.pirates.front);
        
        mockContext = getMockContext();
    });

    describe('переворот (flip)', () => {
        it('должна переворачиваться с «пираты» на «компас»', () => {
            expect(piratesCard.getCurrentId()).toBe('pirates');
            expect(piratesCard.getCurrentEmoji()).toBe('🏴‍☠️');
            
            piratesCard.flip(mockContext);
            
            expect(piratesCard.getCurrentId()).toBe('compass');
            expect(piratesCard.getCurrentEmoji()).toBe('🧭');
        });
    });
});
