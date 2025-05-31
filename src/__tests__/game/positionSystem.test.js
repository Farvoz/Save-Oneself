import { Position, PositionSystem } from '../../game/positionSystem';

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
  let positionSystem;

  beforeEach(() => {
    positionSystem = new PositionSystem();
  });

  test('should set and get position', () => {
    const pos = new Position(1, 2);
    const value = { id: 'test' };
    positionSystem.setPosition(pos, value);
    expect(positionSystem.getPosition(pos)).toEqual(value);
  });

  test('should check if position exists', () => {
    const pos = new Position(1, 2);
    expect(positionSystem.hasPosition(pos)).toBe(false);
    positionSystem.setPosition(pos, { id: 'test' });
    expect(positionSystem.hasPosition(pos)).toBe(true);
  });

  test('should remove position', () => {
    const pos = new Position(1, 2);
    positionSystem.setPosition(pos, { id: 'test' });
    expect(positionSystem.hasPosition(pos)).toBe(true);
    positionSystem.removePosition(pos);
    expect(positionSystem.hasPosition(pos)).toBe(false);
  });

  test('should swap positions', () => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(3, 4);
    const value1 = { id: 'test1' };
    const value2 = { id: 'test2' };

    positionSystem.setPosition(pos1, value1);
    positionSystem.setPosition(pos2, value2);
    positionSystem.swapPositions(pos1, pos2);

    expect(positionSystem.getPosition(pos1)).toEqual(value2);
    expect(positionSystem.getPosition(pos2)).toEqual(value1);
  });

  test('should get bounds of occupied positions', () => {
    positionSystem.setPosition(new Position(1, 2), { id: 'test1' });
    positionSystem.setPosition(new Position(3, 4), { id: 'test2' });
    positionSystem.setPosition(new Position(2, 3), { id: 'test3' });

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

  test('should find card by id', () => {
    const pos = new Position(1, 2);
    const card = { id: 'test' };
    positionSystem.setPosition(pos, card);

    const result = positionSystem.findCardById('test');
    expect(result).toEqual({
      position: pos,
      card: card
    });
  });

  test('should find farthest position', () => {
    const fromPos = new Position(0, 0);
    positionSystem.setPosition(new Position(1, 1), { id: 'test1' });
    positionSystem.setPosition(new Position(3, 3), { id: 'test2' });

    const farthestPos = positionSystem.findFarthestPosition(fromPos);
    expect(farthestPos).toEqual(new Position(3, 3));
  });

  test('should get adjacent positions', () => {
    const centerPos = new Position(1, 1);
    positionSystem.setPosition(new Position(0, 1), { id: 'up' });
    positionSystem.setPosition(new Position(2, 1), { id: 'down' });
    positionSystem.setPosition(new Position(1, 0), { id: 'left' });
    positionSystem.setPosition(new Position(1, 2), { id: 'right' });

    const adjacent = positionSystem.getAdjacentPositions(centerPos);
    expect(adjacent).toHaveLength(4);
    expect(adjacent).toContainEqual(new Position(0, 1));
    expect(adjacent).toContainEqual(new Position(2, 1));
    expect(adjacent).toContainEqual(new Position(1, 0));
    expect(adjacent).toContainEqual(new Position(1, 2));
  });
}); 