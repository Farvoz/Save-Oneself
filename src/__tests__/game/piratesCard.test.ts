import { GameCard, GameContext, PositionSystem, Position, ShipCard } from '../../core';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { CARD_DATA, ship } from '../../core/cardData';

describe('Pirates Card', () => {
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

        positionSystem.setPosition(new Position(0, 0), mockShipCard)
        
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

    describe('flip', () => {
        it('should flip from pirates to compass', () => {
            expect(piratesCard.getCurrentId()).toBe('pirates');
            expect(piratesCard.getCurrentEmoji()).toBe('🏴‍☠️');
            
            piratesCard.flip(mockContext);
            
            expect(piratesCard.getCurrentId()).toBe('compass');
            expect(piratesCard.getCurrentEmoji()).toBe('🧭');
        });
    });
});
