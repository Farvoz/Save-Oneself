import { GameCard, GameContext, PositionSystem, Position, ShipCard } from '../../core';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { CARD_DATA, ship } from '../../core/cardData';

describe('Карта «Пираты»', () => {
    let piratesCard: GameCard;
    let mockContext: GameContext;
    let mockShipCard;

    beforeEach(() => {
        piratesCard = new GameCard(CARD_DATA.pirates.back, CARD_DATA.pirates.front);
        
        const positionSystem = new PositionSystem();
        const bounds = {
            minRow: -4,
            maxRow: 4,
            minCol: -4,
            maxCol: 4
        };
        const cornerManager = new ShipCornerManager('NE', bounds);
        mockShipCard = new ShipCard(ship, 'NE', cornerManager);

        // Ставим корабль на валидную позицию для NE (правая кромка)
        const startPos = mockShipCard.cornerManager.getStartShipPosition();
        positionSystem.setPosition(startPos, mockShipCard)
        
        mockContext = {
            positionSystem,
            playerPosition: new Position(0, 0),
            lives: 3,
            deck: [],
            hasPlacedCard: false,
            hasMoved: false,
            movesLeft: 1,
            gameOverMessage: null,
            isVictory: false
        };
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
