import {
  movePlayer,
  shuffleDeck,
  placeCard,
  placeShip,
  INITIAL_GAME_DECK, 
  GameContext,
  PositionSystem, 
  Position,
  CARD_DATA,
  GameCard
} from '../../core';
import { getMockContext } from '../mocks';

describe('Действия игры', () => {
  let mockContext: GameContext;

  beforeEach(() => {
    mockContext = getMockContext({
      deck: [...INITIAL_GAME_DECK],
      movesLeft: 3
    });
  });

  describe('перемещение игрока (movePlayer)', () => {
    test('должна завершать игру, когда колода пуста', () => {
      mockContext.deck = [];
      // Убеждаемся, что позиция пуста
      mockContext.positionSystem.removePosition(new Position(0, 0));
      const result = movePlayer(mockContext, new Position(0, 0));
      expect(result.gameOverMessage).toBe('Игра окончена! Колода пуста.');
      expect(result.isVictory).toBe(false);
    });

    test('должна перемещать игрока в новую позицию', () => {
      const result = movePlayer(mockContext, new Position(0, 0));
      expect(result.playerPosition).toEqual(new Position(0, 0));
      expect(result.hasMoved).toBe(true);
    });
  });

  describe('перемешивание колоды (shuffleDeck)', () => {
    test('должна перемешивать колоду', () => {
      const originalDeck = [...mockContext.deck];
      const result = shuffleDeck(mockContext);
      expect(result.deck).toHaveLength(originalDeck.length);
      // Note: This test might occasionally fail due to random shuffling
      expect(result.deck).not.toEqual(originalDeck);
    });
  });

  describe('размещение карты (placeCard)', () => {
    test('должна разместить карту и убрать её из колоды', () => {
      const result = placeCard(mockContext, new Position(0, 0));
      expect(result.positionSystem.countNonShipCards()).toBe(1);
      expect(result.deck.length).toBe(INITIAL_GAME_DECK.length - 1);
      expect(result.cardObj).toBeDefined();
    });
  });

  describe('размещение корабля (placeShip)', () => {
    test('должна разместить корабль в корректной позиции по направлению', () => {
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

