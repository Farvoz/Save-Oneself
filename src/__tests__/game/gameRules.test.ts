import { Position, PositionSystem } from '../../core/PositionSystem';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { GameContext } from '../../core/gameData';
import { GameCard, ShipCard } from '../../core/Card';
import { CARD_DATA } from '../../core/cardData';
import {
    isPlayerValidPosition,
    canFlipCard,
    hasFlippableCards,
    checkVictory,
    calculateScore
} from '../../core/gameRules';

describe('Game Rules', () => {
    let mockContext: GameContext;

    beforeEach(() => {
        const bounds = {
            minRow: 0,
            maxRow: 3,
            minCol: 0,
            maxCol: 3
        };

        const shipSide = {
            id: 'ship',
            lives: 0,
            direction: 'NW' as const,
            type: 'ship' as const,
            emoji: '⛵',
            description: 'Ship card'
        };

        const shipCard = new ShipCard(
            shipSide,
            'NW',
            new Position(0, 0),
            new ShipCornerManager('NW', bounds)
        );

        mockContext = {
            playerPosition: new Position(0, 0),
            hasPlacedCard: false,
            lives: 3,
            positionSystem: new PositionSystem(),
            shipCard: shipCard,
            hasMoved: false,
            gameOverMessage: null,
            isVictory: false,
            deck: [],
            movesLeft: 3
        };
    });

    describe('isPlayerValidPosition', () => {
        it('should allow first move to (0,0)', () => {
            mockContext.playerPosition = undefined;
            const pos = new Position(0, 0);
            expect(isPlayerValidPosition(mockContext, pos)).toBe(true);
        });

        it('should not allow out of bounds position', () => {
            const pos = new Position(5, 5);
            expect(isPlayerValidPosition(mockContext, pos)).toBe(false);
        });

        it('should not allow non-adjacent position', () => {
            mockContext.playerPosition = new Position(0, 0);
            const pos = new Position(2, 2);
            expect(isPlayerValidPosition(mockContext, pos)).toBe(false);
        });
    });

    describe('canFlipCard', () => {
        it('should not allow flipping front cards', () => {
            const card = new GameCard(CARD_DATA.vines.front, CARD_DATA.vines.front);
            card.flip();
            expect(canFlipCard(mockContext, card)).toBe(false);
        });

        it('should check ship-set-sail requirements', () => {
            const card = new GameCard(CARD_DATA.bottle.back, CARD_DATA.bottle.front);
            mockContext.shipCard!.direction = 'NW';
            mockContext.shipCard!.skipMove = true;
            expect(canFlipCard(mockContext, card)).toBe(true);
        });

        it('should check higher-ground requirements', () => {
            // Создаем карту higher-ground и размещаем её на позиции игрока
            const higherGroundCard = new GameCard(CARD_DATA.higherGround.back, CARD_DATA.higherGround.front);
            mockContext.positionSystem.setPosition(new Position(1, 1), higherGroundCard);

            // Теперь игрок находится где-то не на higher-ground, поэтому карту нельзя перевернуть
            expect(canFlipCard(mockContext, higherGroundCard)).toBe(false);

            mockContext.playerPosition = new Position(1, 1);
            
            // Создаем карту flint, размещаем её на позиции (2, 2) и переворачиваем
            const torchCard = new GameCard(CARD_DATA.flint.back, CARD_DATA.flint.front);
            mockContext.positionSystem.setPosition(new Position(2, 2), torchCard);
            torchCard.flip();

            // Теперь игрок находится на карте higher-ground, поэтому карту можно перевернуть
            expect(canFlipCard(mockContext, higherGroundCard)).toBe(true);
        });
    });

    describe('hasFlippableCards', () => {
        it('should return false when no flippable cards exist', () => {
            expect(hasFlippableCards(mockContext)).toBe(false);
        });

        it('should return true when flippable card exists', () => {
            const card = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
            mockContext.positionSystem.setPosition(new Position(0, 0), card);

            const card2 = new GameCard(CARD_DATA.palmTrees.back, CARD_DATA.palmTrees.front);
            mockContext.positionSystem.setPosition(new Position(0, 1), card2);

            expect(hasFlippableCards(mockContext)).toBe(true);
        });
    });

    describe('checkVictory', () => {
        it('should return false when ship has no position', () => {
            mockContext.shipCard = undefined;
            expect(checkVictory(mockContext)).toBe(false);
        });

        it('should detect SOS victory condition', () => {
            const sosPos = new Position(1, 1);
            const shipPos = new Position(1, 0);
            mockContext.shipCard!.position = shipPos;
            const sosCard = new GameCard(CARD_DATA.rocks.front, CARD_DATA.rocks.front);
            mockContext.positionSystem.setPosition(sosPos, sosCard);
            expect(checkVictory(mockContext)).toBe(true);
        });

        it('should detect beacon victory condition', () => {
            const beaconPos = new Position(1, 1);
            const shipPos = new Position(0, 1);
            mockContext.shipCard!.position = shipPos;
            const beaconCard = new GameCard(CARD_DATA.higherGround.front, CARD_DATA.higherGround.front);
            mockContext.positionSystem.setPosition(beaconPos, beaconCard);
            expect(checkVictory(mockContext)).toBe(true);
        });

        it('should detect message victory condition', () => {
            const messagePos = new Position(0, 1);
            const shipPos = new Position(-1, 1);
            mockContext.shipCard!.position = shipPos;
            const messageCard = new GameCard(CARD_DATA.bottle.front, CARD_DATA.bottle.front);
            mockContext.positionSystem.setPosition(messagePos, messageCard);
            expect(checkVictory(mockContext)).toBe(true);
        });
    });

    describe('calculateScore', () => {
        it('should calculate basic score with lives', () => {
            mockContext.lives = 3;
            expect(calculateScore(mockContext)).toBe(3);
        });

        it('should include card scores and bonus points', () => {
            mockContext.lives = 3;
            const card1 = new GameCard(CARD_DATA.higherGround.front, CARD_DATA.higherGround.front);
            const card2 = new GameCard(CARD_DATA.rocks.front, CARD_DATA.rocks.front);
            const card3 = new GameCard(CARD_DATA.flint.front, CARD_DATA.flint.front);
            const card4 = new GameCard(CARD_DATA.bottle.front, CARD_DATA.bottle.front);
            const card5 = new GameCard(CARD_DATA.flint.back, CARD_DATA.flint.front);
            
            mockContext.positionSystem.setPosition(new Position(0, 0), card1);
            mockContext.positionSystem.setPosition(new Position(0, 1), card2);
            mockContext.positionSystem.setPosition(new Position(0, 2), card3);
            mockContext.positionSystem.setPosition(new Position(0, 3), card4);
            mockContext.positionSystem.setPosition(new Position(0, 4), card5);

            expect(calculateScore(mockContext)).toBe(21);
        });
    });
}); 