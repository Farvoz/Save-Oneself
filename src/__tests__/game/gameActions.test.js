import { 
  movePlayer, 
  shuffleDeck, 
  placeCard, 
  placeShip,
} from '../../game/gameActions';
import { INITIAL_DECK, INITIAL_SHIP } from '../../game/gameData';
import { PositionSystem, Position } from '../../game/positionSystem';

describe('Game Actions', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      positionSystem: new PositionSystem(),
      deck: [...INITIAL_DECK],
      lives: 3,
      shipCard: { ...INITIAL_SHIP },
      hasPlacedCard: false,
      movesLeft: 3
    };
  });

  describe('movePlayer', () => {
    test('should handle game over when deck is empty', () => {
      mockContext.deck = [];
      const result = movePlayer(mockContext, 0, 0);
      expect(result.gameOverMessage).toBe('Игра окончена! Колода пуста.');
      expect(result.isVictory).toBe(false);
    });

    test('should handle pirates card effect', () => {
      const piratesCard = { id: 'pirates' };
      mockContext.positionSystem.setPosition(new Position(0, 0), piratesCard);
      const result = movePlayer(mockContext, new Position(0, 0));
      expect(result.shipCard).toEqual(INITIAL_SHIP);
    });
  });

  describe('shuffleDeck', () => {
    test('should shuffle deck', () => {
      const originalDeck = [...mockContext.deck];
      const result = shuffleDeck(mockContext);
      expect(result.deck).toHaveLength(originalDeck.length);
      // Note: This test might occasionally fail due to random shuffling
      expect(result.deck).not.toEqual(originalDeck);
    });
  });

  // Эта функция вызывается только внутри movePlayer
  describe('placeCard', () => {
    test('should place card and remove from deck', () => {
      const result = placeCard(mockContext, new Position(0, 0));
      expect(result.positionSystem.countNonShipCards()).toBe(1);
      expect(result.deck.length).toBe(INITIAL_DECK.length - 1);
      expect(result.cardObj).toBeDefined();
    });
  });

  describe('placeShip', () => {
    test('should place ship in correct position based on direction', () => {
      const positionSystem = new PositionSystem();
      positionSystem.setPosition(new Position(0, 0), { id: 'card1' });
      positionSystem.setPosition(new Position(0, 1), { id: 'card2' });
      
      const result = placeShip(positionSystem, 'NW');
      expect(result.shipCard.position).toBeDefined();
      expect(result.positionSystem.countNonShipCards()).toBe(2); // 2 cards + ship
      expect(result.shipCard.position).toEqual(new Position(-1, -1));
    });
  });
});