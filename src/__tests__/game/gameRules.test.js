import { INITIAL_SHIP } from '../../game/gameData';
import { 
  isCornerShip, 
  isValidPosition
} from '../../game/gameRules';
import { Position, PositionSystem } from '../../game/positionSystem';

describe('Game Rules', () => {
  describe('isCornerShip', () => {
    test('should identify corner ship positions', () => {
      const shipCard = {
        direction: 'NW',
        cornerCoordinates: {
          topLeft: [0, 0],
          topRight: [0, 3],
          bottomLeft: [3, 0],
          bottomRight: [3, 3]
        }
      };

      // Для направления NW, корабль должен быть справа от topRight
      expect(isCornerShip(shipCard, new Position(0, 4))).toBe(true);
      expect(isCornerShip(shipCard, new Position(0, 3))).toBe(false);
    });

    test('should handle different ship directions', () => {
      const shipCardNE = {
        direction: 'NE',
        cornerCoordinates: {
          topLeft: [0, 0],
          topRight: [0, 3],
          bottomLeft: [3, 0],
          bottomRight: [3, 3]
        }
      };

      const shipCardSE = {
        direction: 'SE',
        cornerCoordinates: {
          topLeft: [0, 0],
          topRight: [0, 3],
          bottomLeft: [3, 0],
          bottomRight: [3, 3]
        }
      };

      const shipCardSW = {
        direction: 'SW',
        cornerCoordinates: {
          topLeft: [0, 0],
          topRight: [0, 3],
          bottomLeft: [3, 0],
          bottomRight: [3, 3]
        }
      };

      // Для NE, корабль должен быть под bottomRight
      expect(isCornerShip(shipCardNE, new Position(4, 3))).toBe(true);
      // Для SE, корабль должен быть слева от bottomLeft
      expect(isCornerShip(shipCardSE, new Position(3, -1))).toBe(true);
      // Для SW, корабль должен быть над topLeft
      expect(isCornerShip(shipCardSW, new Position(-1, 0))).toBe(true);
    });
  });

  describe('isValidPosition', () => {
    test('should return true for valid positions by ship card', () => {
      const context = {
        playerPosition: '0,0',
        positionSystem: new PositionSystem(),
        shipCard: {
          direction: 'NW',
          cornerCoordinates: {
            topLeft: [0, 0],
            topRight: [0, 3],
            bottomLeft: [3, 0],
            bottomRight: [3, 3]
          }
        }
      };

      expect(isValidPosition(context, new Position(0, 0))).toBe(false);
      expect(isValidPosition(context, new Position(0, 1))).toBe(true);
      expect(isValidPosition(context, new Position(1, 0))).toBe(true);
      expect(isValidPosition(context, new Position(-1, 0))).toBe(false);
      expect(isValidPosition(context, new Position(0, -1))).toBe(false);

      const context2 = {
        playerPosition: '0,0',
        positionSystem: new PositionSystem(),
        shipCard: {
          direction: 'NE',
          cornerCoordinates: {
            topLeft: [0, -3],
            topRight: [0, 0],
            bottomLeft: [3, -3],
            bottomRight: [3, 0]
          }
        }
      };

      expect(isValidPosition(context2, new Position(0, 0))).toBe(false);
      expect(isValidPosition(context2, new Position(0, 1))).toBe(false);
      expect(isValidPosition(context2, new Position(1, 0))).toBe(true);
      expect(isValidPosition(context2, new Position(-1, 0))).toBe(false);
      expect(isValidPosition(context2, new Position(0, -1))).toBe(true);

      const context3 = {
        playerPosition: '0,0',
        positionSystem: new PositionSystem(),
        shipCard: {
          direction: 'SE',
          cornerCoordinates: {
            topLeft: [-3, -3],
            topRight: [0, -3],
            bottomLeft: [0, -3],
            bottomRight: [0, 0]
          }
        }
      };

      expect(isValidPosition(context3, new Position(0, 0))).toBe(false);
      expect(isValidPosition(context3, new Position(0, 1))).toBe(false);
      expect(isValidPosition(context3, new Position(1, 0))).toBe(false);
      expect(isValidPosition(context3, new Position(-1, 0))).toBe(true);
      expect(isValidPosition(context3, new Position(0, -1))).toBe(true);

      
      const context4 = {
        playerPosition: '0,0',
        positionSystem: new PositionSystem(),
        shipCard: {
          direction: 'SW',
          cornerCoordinates: {
            topLeft: [-3, 0],
            topRight: [-3, 3],
            bottomLeft: [0, 0],
            bottomRight: [0, 3]
          }
        }
      };

      expect(isValidPosition(context4, new Position(0, 0))).toBe(false);
      expect(isValidPosition(context4, new Position(0, 1))).toBe(true);
      expect(isValidPosition(context4, new Position(1, 0))).toBe(false);
      expect(isValidPosition(context4, new Position(-1, 0))).toBe(true);
      expect(isValidPosition(context4, new Position(0, -1))).toBe(false);
    });

    test('should return true for valid positions by out of bounds', () => {
      const context = {
        playerPosition: '0,0',
        positionSystem: new PositionSystem(),
        shipCard: INITIAL_SHIP
      };

      // Add 3 cards in a row
      context.positionSystem.setPosition(new Position(0, 0), { type: 'back' });
      context.positionSystem.setPosition(new Position(0, 1), { type: 'back' });
      context.positionSystem.setPosition(new Position(0, 2), { type: 'back' });

      // Add 4 cards in column
      context.positionSystem.setPosition(new Position(0, 0), { type: 'back' });
      context.positionSystem.setPosition(new Position(1, 0), { type: 'back' });
      context.positionSystem.setPosition(new Position(2, 0), { type: 'back' });
      context.positionSystem.setPosition(new Position(3, 0), { type: 'back' });

      expect(isValidPosition(context, new Position(0, -1))).toBe(true);
      expect(isValidPosition(context, new Position(0, 1))).toBe(true);

      expect(isValidPosition(context, new Position(-1, 0))).toBe(false);
      expect(isValidPosition(context, new Position(1, 0))).toBe(true);
    });
  });
}); 