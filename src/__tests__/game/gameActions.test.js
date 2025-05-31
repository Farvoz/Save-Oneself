import { 
  movePlayer, 
  shuffleDeck, 
  placeCard, 
  placeShip,
  handleNegativeEffects,
  findFarthestCardPosition,
  findStormCardPosition,
  countNonShipCards
} from '../../game/gameActions';
import { INITIAL_DECK, INITIAL_FRONT_DECK, INITIAL_SHIP } from '../../game/gameData';

describe('Game Actions', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      occupiedPositions: new Map(),
      deck: [...INITIAL_DECK],
      lives: 3,
      shipCard: { ...INITIAL_SHIP },
      hasPlacedCard: false,
      movesLeft: 3
    };
  });

  describe('movePlayer', () => {
    test('should place card when moving to empty position', () => {
      const result = movePlayer(mockContext, 0, 0);
      expect(result.occupiedPositions.size).toBe(1);
      
      // TODO: вынести из movePlayer вызов placeCard
      expect(result.deck.length).toBe(INITIAL_DECK.length - 1);
      expect(result.hasPlacedCard).toBe(true);
    });

    test('should handle game over when deck is empty', () => {
      mockContext.deck = [];
      const result = movePlayer(mockContext, 0, 0);
      expect(result.gameOverMessage).toBe('Игра окончена! Колода пуста.');
      expect(result.isVictory).toBe(false);
    });

    // тест для карты mirage, когда на поле уже есть 2 карты: выложенная карта должна поменяться местами с дальней картой
    test('should handle mirage card when there are already 2 cards on the field', () => {
      const mirageCard = INITIAL_DECK.find(card => card.id === 'mirage');
      const card1 = { id: 'card1' };
      const card2 = { id: 'card2' };
      mockContext.deck = [mirageCard];

      mockContext.occupiedPositions.set('0,0', card1);
      mockContext.occupiedPositions.set('0,1', card2);

      const result = movePlayer(mockContext, 0, 2);
      expect(result.occupiedPositions.size).toBe(3);
      expect(result.occupiedPositions.get('0,0')).toBe(INITIAL_FRONT_DECK.find(card => card.backId === 'mirage'));
      expect(result.occupiedPositions.get('0,1')).toBe(card2);
      expect(result.occupiedPositions.get('0,2')).toBe(card1);
    });

    test('should handle negative card effects', () => {
      const negativeCard = { id: 'pig', lives: -1 };
      mockContext.occupiedPositions.set('0,0', negativeCard);
      const result = movePlayer(mockContext, 0, 0);
      expect(result.lives).toBe(2);
    });

    test('should handle pirates card effect', () => {
      const piratesCard = { id: 'pirates' };
      mockContext.occupiedPositions.set('0,0', piratesCard);
      const result = movePlayer(mockContext, 0, 0);
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
      const result = placeCard(mockContext, 0, 0);
      expect(result.occupiedPositions.size).toBe(1);
      expect(result.deck.length).toBe(INITIAL_DECK.length - 1);
      expect(result.cardObj).toBeDefined();
    });

    test('should handle positive lives card', () => {
      const positiveCard = { id: 'food', lives: 1 };
      mockContext.deck = [positiveCard];
      const result = placeCard(mockContext, 0, 0);
      expect(result.lives).toBe(4);
    });
  });

  describe('placeShip', () => {
    test('should place ship in correct position based on direction', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1' });
      occupiedPositions.set('0,1', { id: 'card2' });
      
      const result = placeShip(occupiedPositions, 'NW');
      expect(result.shipCard.position).toBeDefined();
      expect(result.occupiedPositions.size).toBe(3); // 2 cards + ship
      expect(result.shipCard.position).toBe('-1,-1');
    });
  });

  describe('Helper Functions', () => {
    test('handleNegativeEffects should reduce lives', () => {
      const card = { id: 'pig', lives: -1 };
      const result = handleNegativeEffects(card, new Map(), 3);
      expect(result).toBe(2);
    });

    test('handleNegativeEffects should not reduce lives if card is protected by spear', () => {
      const card = { id: 'pig', lives: -1 };
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'spear' });
      const result = handleNegativeEffects(card, occupiedPositions, 3);
      expect(result).toBe(3);
    });

    test('findFarthestCardPosition should find correct position', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1' });
      occupiedPositions.set('3,3', { id: 'card2' });
      occupiedPositions.set('3,2', { id: 'card3' });
      
      const result = findFarthestCardPosition(occupiedPositions, 0, 0);
      expect(result).toBe('3,3');
    });

    test('findStormCardPosition should find storm card', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'storm' });
      occupiedPositions.set('1,1', { id: 'other' });
      
      const result = findStormCardPosition(occupiedPositions);
      expect(result).toBe('0,0');
    });

    test('countNonShipCards should count correctly', () => {
      const occupiedPositions = new Map();
      occupiedPositions.set('0,0', { id: 'card1', type: 'ship' });
      occupiedPositions.set('1,1', { id: 'card2', type: 'other' });
      occupiedPositions.set('2,2', { id: 'card3', type: 'other' });
      
      const result = countNonShipCards(occupiedPositions);
      expect(result).toBe(2);
    });
  });
});