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
  GameCard,
  ShipCard,
  isPlayerValidPosition,
  hasFlippableCards,
  checkVictory,
  calculateScore
} from '../../core';
import { ShipCornerManager } from '../../core/ShipCornerManager';

describe('Действия игры', () => {
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

  describe('перемещение игрока (movePlayer)', () => {
    test('должна завершать игру, когда колода пуста', () => {
      mockContext.deck = [];
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
          direction: 'NE' as const,
          type: 'ship' as const,
          emoji: '⛵',
          description: 'Ship card'
      };

      const shipCard = new ShipCard(
          shipSide,
          'NE',
          new ShipCornerManager('NE', bounds)
      );

      const positionSystem = new PositionSystem();
      // Устанавливаем корабль в валидную позицию согласно направлению
      const startPos = shipCard.cornerManager.getStartShipPosition();
      positionSystem.setPosition(startPos, shipCard);
      
      mockContext = {
          playerPosition: new Position(0, 0),
          hasPlacedCard: false,
          lives: 3,
          positionSystem: positionSystem,
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
          // Для NE валидна правая кромка (col = maxCol + 1 = 4)
          const shipPos = new Position(1, 4);
          const shipCard = mockContext.positionSystem.getShipCard();
          mockContext.positionSystem.removeShipPosition();
          mockContext.positionSystem.setPosition(shipPos, shipCard!);
          const sosCard = new GameCard(CARD_DATA.rocks.back, CARD_DATA.rocks.front);
          sosCard.flip(mockContext);
          mockContext.positionSystem.setPosition(sosPos, sosCard);
          expect(checkVictory(mockContext)).toBe(true);
      });

      it('should detect beacon victory condition', () => {
          // Для NE победа по маяку: совпадение колонки
          const beaconPos = new Position(1, 4);
          const shipPos = new Position(0, 4);
          const shipCard = mockContext.positionSystem.getShipCard();
          mockContext.positionSystem.removeShipPosition();
          mockContext.positionSystem.setPosition(shipPos, shipCard!);
          const beaconCard = new GameCard(CARD_DATA.higherGround.back, CARD_DATA.higherGround.front);
          beaconCard.flip(mockContext);
          mockContext.positionSystem.setPosition(beaconPos, beaconCard);
          expect(checkVictory(mockContext)).toBe(true);
      });

      it('should detect message victory condition', () => {
          // Для NE сообщение не в углу и рядом по правой кромке
          const messagePos = new Position(0, 4);
          const shipPos = new Position(-1, 4);
          const shipCard = mockContext.positionSystem.getShipCard();
          mockContext.positionSystem.setPosition(shipPos, shipCard!);
          const messageCard = new GameCard(CARD_DATA.bottle.back, CARD_DATA.bottle.front);
          messageCard.flip(mockContext);
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