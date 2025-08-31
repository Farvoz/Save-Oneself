import {
  movePlayer,
  shuffleDeck,
  placeCard,
  placeShip
} from '../../core/gameActions';
import { INITIAL_GAME_DECK, GameContext } from '../../core/gameData';
import { GameCard } from '../../core/Card';
import { PositionSystem, Position } from '../../core/PositionSystem';
import { CARD_DATA } from '../../core/cardData';

describe('Game Actions', () => {
  let mockContext: GameContext;

  beforeEach(() => {
    mockContext = {
      positionSystem: new PositionSystem(),
      deck: [...INITIAL_GAME_DECK],
      lives: 3,
      hasPlacedCard: false,
      movesLeft: 3,
      hasMoved: false,
      gameOverMessage: null,
      isVictory: false
    };
  });

  describe('movePlayer', () => {
    test('should handle game over when deck is empty', () => {
      mockContext.deck = [];
      const result = movePlayer(mockContext, new Position(0, 0));
      expect(result.gameOverMessage).toBe('Игра окончена! Колода пуста.');
      expect(result.isVictory).toBe(false);
    });

    test('should move player to new position', () => {
      const result = movePlayer(mockContext, new Position(0, 0));
      expect(result.playerPosition).toEqual(new Position(0, 0));
      expect(result.hasMoved).toBe(true);
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

  describe('placeCard', () => {
    test('should place card and remove from deck', () => {
      const result = placeCard(mockContext, new Position(0, 0));
      expect(result.positionSystem.countNonShipCards()).toBe(1);
      expect(result.deck.length).toBe(INITIAL_GAME_DECK.length - 1);
      expect(result.cardObj).toBeDefined();
    });
  });

  describe('placeShip', () => {
    test('should place ship in correct position based on direction', () => {
      const positionSystem = new PositionSystem();
      const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
      const card2 = new GameCard(CARD_DATA.hook.back, CARD_DATA.hook.front);
      
      positionSystem.setPosition(new Position(0, 0), card1);
      positionSystem.setPosition(new Position(0, 1), card2);
      
      const result = placeShip(positionSystem, 'NW');
      expect(result.positionSystem.getShipPosition()).toBeDefined();
      expect(result.positionSystem.countNonShipCards()).toBe(2); // 2 cards + ship
      expect(result.positionSystem.getShipPosition()).toEqual(new Position(-1, -1));
    });
  });
});