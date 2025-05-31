import { 
  isCornerShip, 
  findCardOnBoard, 
  findCardPositionById 
} from '../../game/gameRules';

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
      expect(isCornerShip(shipCard, 0, 4)).toBe(true);
      expect(isCornerShip(shipCard, 0, 3)).toBe(false);
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
      expect(isCornerShip(shipCardNE, 4, 3)).toBe(true);
      // Для SE, корабль должен быть слева от bottomLeft
      expect(isCornerShip(shipCardSE, 3, -1)).toBe(true);
      // Для SW, корабль должен быть над topLeft
      expect(isCornerShip(shipCardSW, -1, 0)).toBe(true);
    });
  });

  describe('findCardOnBoard', () => {
    test('should find card by id', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1' });
      occupiedPositions.set('1,1', { id: 'target' });
      occupiedPositions.set('2,2', { id: 'card3' });

      const result = findCardOnBoard(occupiedPositions, 'target');
      expect(result).toBe(true);
    });

    test('should return false when card not found', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1' });
      occupiedPositions.set('1,1', { id: 'card2' });

      const result = findCardOnBoard(occupiedPositions, 'nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('findCardPositionById', () => {
    test('should find card position by id', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1' });
      occupiedPositions.set('1,1', { id: 'target' });
      occupiedPositions.set('2,2', { id: 'card3' });

      const result = findCardPositionById(occupiedPositions, 'target');
      expect(result).toBe('1,1');
    });

    test('should return null when card not found', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1' });
      occupiedPositions.set('1,1', { id: 'card2' });

      const result = findCardPositionById(occupiedPositions, 'nonexistent');
      expect(result).toBe(null);
    });
  });
}); 