import { Position, PositionSystem } from '../../core/PositionSystem';
import { GameCard } from '../../core/Card';
import { CARD_DATA } from '../../core/cardData';

describe('Position', () => {
  test('should create position with row and col', () => {
    const pos = new Position(1, 2);
    expect(pos.row).toBe(1);
    expect(pos.col).toBe(2);
  });

  test('should convert position to string', () => {
    const pos = new Position(1, 2);
    expect(pos.toString()).toBe('1,2');
  });

  test('should create position from string', () => {
    const pos = Position.fromString('1,2');
    expect(pos.row).toBe(1);
    expect(pos.col).toBe(2);
  });

  test('should check if positions are equal', () => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 2);
    const pos3 = new Position(2, 1);
    expect(pos1.equals(pos2)).toBe(true);
    expect(pos1.equals(pos3)).toBe(false);
  });

  test('should calculate distance between positions', () => {
    const pos1 = new Position(1, 1);
    const pos2 = new Position(3, 4);
    expect(pos1.distanceTo(pos2)).toBe(5);
  });

  test('should validate position', () => {
    const validPos = new Position(1, 2);
    const invalidPos = new Position(1.5, 2);
    expect(validPos.isValid()).toBe(true);
    expect(invalidPos.isValid()).toBe(false);
  });
});

describe('PositionSystem', () => {
  let positionSystem: PositionSystem;

  beforeEach(() => {
    positionSystem = new PositionSystem();
  });

  test('should set and get position', () => {
    const pos = new Position(1, 2);
    const card = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    positionSystem.setPosition(pos, card);
    expect(positionSystem.getCard(pos)).toEqual(card);
  });

  test('should check if position exists', () => {
    const pos = new Position(1, 2);
    expect(positionSystem.hasPosition(pos)).toBe(false);
    const card = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    positionSystem.setPosition(pos, card);
    expect(positionSystem.hasPosition(pos)).toBe(true);
  });

  test('should remove position', () => {
    const pos = new Position(1, 2);
    const card = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    positionSystem.setPosition(pos, card);
    expect(positionSystem.hasPosition(pos)).toBe(true);
    positionSystem.removePosition(pos);
    expect(positionSystem.hasPosition(pos)).toBe(false);
  });

  test('should swap positions', () => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(3, 4);
    const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    const card2 = new GameCard(CARD_DATA.hook.back, CARD_DATA.hook.front);

    positionSystem.setPosition(pos1, card1);
    positionSystem.setPosition(pos2, card2);
    positionSystem.swapPositions(pos1, pos2);

    expect(positionSystem.getCard(pos1)).toEqual(card2);
    expect(positionSystem.getCard(pos2)).toEqual(card1);
  });

  test('меняет местами с пустой клеткой', () => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 3);
    const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    
    positionSystem.setPosition(pos1, card1);
    positionSystem.swapPositions(pos1, pos2);

    expect(positionSystem.getCard(pos1)).toEqual(undefined);
    expect(positionSystem.getCard(pos2)).toEqual(card1);
  });

  test('should get bounds of occupied positions', () => {
    const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    const card2 = new GameCard(CARD_DATA.hook.back, CARD_DATA.hook.front);
    const card3 = new GameCard(CARD_DATA.water.back, CARD_DATA.water.front);
    
    positionSystem.setPosition(new Position(1, 2), card1);
    positionSystem.setPosition(new Position(3, 4), card2);
    positionSystem.setPosition(new Position(2, 3), card3);

    const bounds = positionSystem.getBounds();
    expect(bounds).toEqual({
      minRow: 1,
      maxRow: 3,
      minCol: 2,
      maxCol: 4,
      width: 3,
      height: 3
    });
  });

  test('should get bounds with negative positions', () => {
    const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    const card2 = new GameCard(CARD_DATA.hook.back, CARD_DATA.hook.front);
    const card3 = new GameCard(CARD_DATA.water.back, CARD_DATA.water.front);
    
    positionSystem.setPosition(new Position(-2, -1), card1);
    positionSystem.setPosition(new Position(1, 3), card2);
    positionSystem.setPosition(new Position(-1, 2), card3);

    const bounds = positionSystem.getBounds();
    expect(bounds).toEqual({
      minRow: -2,
      maxRow: 1,
      minCol: -1,
      maxCol: 3,
      width: 5,
      height: 4
    });
  });

  test('should find card by id', () => {
    const pos = new Position(1, 2);
    const card = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    positionSystem.setPosition(pos, card);

    const result = positionSystem.findCardById('vines');
    expect(result).toEqual({
      position: pos,
      card: card
    });
  });

  test('should find farthest position', () => {
    const fromPos = new Position(0, 0);
    const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    const card2 = new GameCard(CARD_DATA.hook.back, CARD_DATA.hook.front);
    
    positionSystem.setPosition(new Position(1, 1), card1);
    positionSystem.setPosition(new Position(3, 3), card2);

    const farthestPos = positionSystem.findFarthestPosition(fromPos);
    expect(farthestPos).toEqual(new Position(3, 3));
  });

  test('should get adjacent positions', () => {
    const centerPos = new Position(1, 1);
    const card1 = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
    const card2 = new GameCard(CARD_DATA.hook.back, CARD_DATA.hook.front);
    const card3 = new GameCard(CARD_DATA.water.back, CARD_DATA.water.front);
    const card4 = new GameCard(CARD_DATA.flint.back, CARD_DATA.flint.front);
    
    positionSystem.setPosition(new Position(0, 1), card1);
    positionSystem.setPosition(new Position(2, 1), card2);
    positionSystem.setPosition(new Position(1, 0), card3);
    positionSystem.setPosition(new Position(1, 2), card4);

    const adjacent = positionSystem.getAdjacentPositions(centerPos);
    expect(adjacent).toHaveLength(4);
    expect(adjacent).toContainEqual(new Position(0, 1));
    expect(adjacent).toContainEqual(new Position(2, 1));
    expect(adjacent).toContainEqual(new Position(1, 0));
    expect(adjacent).toContainEqual(new Position(1, 2));
  });
}); 