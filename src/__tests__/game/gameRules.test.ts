import {
  GameContext,
  Position,
  CARD_DATA,
  GameCard,
  isPlayerValidPosition,
  hasFlippableCards,
  checkVictory,
  checkDefeat,
  calculateScore
} from '../../core';
import { getMockContext, getMockPositionSystem, getMockShipCard } from '../mocks';

describe('Game Rules', () => {
  let mockContext: GameContext;

  beforeEach(() => {
      const bounds = {
          minRow: 0,
          maxRow: 3,
          minCol: 0,
          maxCol: 3
      };
      const shipCard = getMockShipCard('NW', bounds);
      const positionSystem = getMockPositionSystem(shipCard);
      
      mockContext = getMockContext({
          playerPosition: new Position(0, 0),
          positionSystem: positionSystem,
          deck: [],
          movesLeft: 3
      });
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
          mockContext.positionSystem.removeShipPosition();
          expect(checkVictory(mockContext)).toBe(false);
      });

      it('should detect SOS victory condition', () => {
          const sosPos = new Position(1, 1);
          const shipPos = new Position(1, 4); // NW direction allows only col=4
          const shipCard = mockContext.positionSystem.getShipCard();
          mockContext.positionSystem.removeShipPosition();
          mockContext.positionSystem.setPosition(shipPos, shipCard!);
          const sosCard = new GameCard(CARD_DATA.rocks.back, CARD_DATA.rocks.front);
          sosCard.flip(mockContext);
          mockContext.positionSystem.setPosition(sosPos, sosCard);
          expect(checkVictory(mockContext)).toBe(true);
      });

      it('should detect beacon victory condition', () => {
          const beaconPos = new Position(1, 4); // Same column as ship
          const shipPos = new Position(2, 4); // NW direction allows only col=4
          const shipCard = mockContext.positionSystem.getShipCard();
          mockContext.positionSystem.removeShipPosition();
          mockContext.positionSystem.setPosition(shipPos, shipCard!);
          const beaconCard = new GameCard(CARD_DATA.higherGround.back, CARD_DATA.higherGround.front);
          beaconCard.flip(mockContext);
          mockContext.positionSystem.setPosition(beaconPos, beaconCard);
          expect(checkVictory(mockContext)).toBe(true);
      });
  });

  describe('checkDefeat', () => {
      it('should return false when ship is within bounds', () => {
          // Корабль находится в начальной позиции (0, -1) для направления NW
          const shipPos = mockContext.positionSystem.getShipPosition();
          expect(shipPos).toBeDefined();
          expect(checkDefeat(mockContext)).toBe(false);
      });

      it('should return true when ship is out of bounds - NW direction', () => {
        // Передвинуть корабль на угловую позицию
        const shipCard = mockContext.positionSystem.getShipCard();
        const cornerPosition = shipCard!.cornerManager.getCornerPosition();
        const finalShipPosition = new Position(cornerPosition.row - 1, cornerPosition.col + 1);
        expect(shipCard!.cornerManager.isFinalCornerShipPosition(finalShipPosition)).toBe(true);
        
        mockContext.positionSystem.moveShip(finalShipPosition);
        expect(checkDefeat(mockContext)).toBe(false);

        mockContext.positionSystem.moveShip(new Position(finalShipPosition.row, finalShipPosition.col + 1));
        expect(checkDefeat(mockContext)).toBe(true);
      });

      it('should return false when ship is at valid boundary position', () => {
          const bounds = {
              minRow: 0,
              maxRow: 3,
              minCol: 0,
              maxCol: 3
          };
          const shipCard = getMockShipCard('NW', bounds);
          const positionSystem = getMockPositionSystem(shipCard);
          
          // Корабль в валидной позиции на границе
          const validBoundaryPosition = new Position(-1, -1); // Начальная позиция для NW
          positionSystem.setPosition(validBoundaryPosition, shipCard);
          
          const context = getMockContext({
              playerPosition: new Position(0, 0),
              positionSystem: positionSystem,
              deck: [],
              movesLeft: 3
          });
          
          expect(checkDefeat(context)).toBe(false);
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
