import { Position, PositionSystem } from '../../game/positionSystem';
import { ShipCornerManager } from '../../game/ShipCornerManager';
import {
    isPlayerValidPosition,
    canFlipCard,
    hasFlippableCards,
    checkVictory,
    calculateScore
} from '../../game/gameRules';

describe('Game Rules', () => {
    let mockContext;

    beforeEach(() => {
        const bounds = {
            minRow: 0,
            maxRow: 3,
            minCol: 0,
            maxCol: 3
        };

        mockContext = {
            playerPosition: null,
            hasPlacedCard: false,
            lives: 3,
            positionSystem: new PositionSystem(),
            shipCard: {
                position: null,
                direction: 'NW',
                skipMove: false,
                cornerManager: new ShipCornerManager('NW', bounds)
            }
        };
    });

    describe('isPlayerValidPosition', () => {
        it('should allow first move to (0,0)', () => {
            const pos = new Position(0, 0);
            expect(isPlayerValidPosition(mockContext, pos)).toBe(true);
        });

        it('should not allow out of bounds position', () => {
            const pos = new Position(5, 5);
            expect(isPlayerValidPosition(mockContext, pos)).toBe(false);
        });

        it('should not allow non-adjacent position', () => {
            mockContext.playerPosition = '0,0';
            const pos = new Position(2, 2);
            expect(isPlayerValidPosition(mockContext, pos)).toBe(false);
        });
    });

    describe('canFlipCard', () => {
        it('should not allow flipping front cards', () => {
            const card = { type: 'front' };
            expect(canFlipCard(mockContext, card)).toBe(false);
        });

        it('should check ship-set-sail requirements', () => {
            const card = { type: 'back', requirements: '_ship-set-sail' };
            mockContext.shipCard.direction = 'NW';
            mockContext.shipCard.skipMove = true;
            expect(canFlipCard(mockContext, card)).toBe(true);
        });

        it('should check higher-ground requirements', () => {
            const card = { type: 'back', requirements: 'higher-ground' };
            mockContext.playerPosition = '1,1';
            mockContext.positionSystem.setPosition(new Position(1, 1), { id: 'higher-ground' });
            expect(canFlipCard(mockContext, card)).toBe(true);
        });
    });

    describe('hasFlippableCards', () => {
        it('should return false when no flippable cards exist', () => {
            expect(hasFlippableCards(mockContext)).toBe(false);
        });

        it('should return true when flippable card exists', () => {
            const card = { type: 'back' };
            mockContext.positionSystem.setPosition(new Position(0, 0), card);
            expect(hasFlippableCards(mockContext)).toBe(true);
        });
    });

    describe('checkVictory', () => {
        it('should return false when ship has no position', () => {
            mockContext.shipCard.position = null;
            expect(checkVictory(mockContext)).toBe(false);
        });

        it('should detect SOS victory condition', () => {
            mockContext.shipCard.position = '1,0';
            mockContext.positionSystem.setPosition(new Position(1, 1), { id: 'sos' });
            expect(checkVictory(mockContext)).toBe(true);
        });

        it('should detect beacon victory condition', () => {
            mockContext.shipCard.position = '0,1';
            mockContext.positionSystem.setPosition(new Position(1, 1), { id: 'lit-beacon' });
            expect(checkVictory(mockContext)).toBe(true);
        });

        it('should detect message victory condition', () => {
            mockContext.shipCard.position = '-1,1';
            mockContext.positionSystem.setPosition(new Position(0, 1), { id: 'message' });
            expect(checkVictory(mockContext)).toBe(true);

            mockContext.shipCard.position = '-1,0';
            mockContext.positionSystem.setPosition(new Position(0, 0), { id: 'message' });
            expect(checkVictory(mockContext)).toBe(false);
        });
    });

    describe('calculateScore', () => {
        it('should calculate basic score with lives', () => {
            mockContext.lives = 3;
            expect(calculateScore(mockContext)).toBe(3);
        });

        it('should include card scores and bonus points', () => {
            mockContext.lives = 3;
            mockContext.positionSystem.setPosition(new Position(0, 0), { score: 5 });
            mockContext.positionSystem.setPosition(new Position(0, 1), { score: 3 });
            mockContext.positionSystem.setPosition(new Position(0, 2), { score: 2 });
            mockContext.positionSystem.setPosition(new Position(0, 3), { score: 0 });
            expect(calculateScore(mockContext)).toBe(14); // 3 lives + 10 card points + 1 bonus points for every 4 cards
        });
    });
}); 