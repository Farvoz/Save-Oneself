import { render, screen } from '@testing-library/react';
import { createActor } from 'xstate';

import { Grid } from '../../components/Grid';
import { PositionSystem, Position } from '../../core/PositionSystem';
import { GridProps } from '../../components/Grid';
import { createGameStateMachine } from '../../core/gameStateMachine';
import { GameCard, ShipCard } from '../../core';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { CARD_DATA, ship } from '../../core/cardData';

describe('Компонент Grid', () => {
  // Создаем мок стейт машины
  const mockStateMachine = createGameStateMachine();
  const mockActor = createActor(mockStateMachine);
  
  // Создаем реальную карту для тестирования
  const testCard = new GameCard(CARD_DATA.vines.back, CARD_DATA.vines.front);
  
  // Создаем позицию игрока
  const playerPosition = new Position(0, 0);
  
  // Создаем мок стейт с правильным контекстом
  const mockState = {
    ...mockActor.getSnapshot(),
    context: {
      ...mockActor.getSnapshot().context,
      playerPosition: playerPosition
    }
  };
  
  const mockProps: GridProps = {
    onCellClick: jest.fn(),
    positionSystem: new PositionSystem(),
    state: mockState,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отрисовывает сетку с корректными размерами', () => {
    render(<Grid {...mockProps} />);
    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toBeInTheDocument();
  });

  test('отрисовывает ячейки для каждой позиции', () => {
    render(<Grid {...mockProps} />);
    const cells = screen.getAllByTestId(/^grid-cell-\d+-\d+$/);
    expect(cells.length).toBe(25); // 5x5 grid (-4 to 4 in both dimensions)
  });

  test('вызывает onCellClick при клике по ячейке', () => {
    render(<Grid {...mockProps} />);
    const cell = screen.getByTestId('grid-cell-0-0');
    cell.click();
    expect(mockProps.onCellClick).toHaveBeenCalledWith(0, 0);
  });

  test('подсвечивает позицию игрока', () => {
    render(<Grid {...mockProps} />);
    const playerCell = screen.getByTestId('grid-cell-0-0');
    expect(playerCell).toHaveClass('player');
  });

  test('отрисовывает карты в занятых позициях', () => {
    const positionSystem = new PositionSystem();
    const pos = new Position(0, 0);
    positionSystem.setPosition(pos, testCard);
    
    render(<Grid {...mockProps} positionSystem={positionSystem} />);
    const card = screen.getByTestId(`card-${testCard.getCurrentId()}`);
    expect(card).toBeInTheDocument();
  });

  test('отрисовывает береговую линию на основе позиции корабля из positionSystem', () => {
    const positionSystem = new PositionSystem();

    // Создаем корабль с направлением NE на корректной позиции
    // Для NE валидна правая кромка относительно острова; используем стартовую позицию
    // Задаем фиксированные границы острова для корректных вычислений
    const bounds = { minRow: 0, maxRow: 3, minCol: 0, maxCol: 3 } as const;
    const shipCard = new ShipCard(ship, 'NE', new ShipCornerManager('NE', bounds));
    const startPos = shipCard.cornerManager!.getStartShipPosition();
    positionSystem.setPosition(startPos, shipCard);
    
    // Создаем мок стейт с shipCard
    const mockStateWithShip = {
      ...mockState,
      context: {
        ...mockState.context,
      }
    };
    
    render(<Grid {...mockProps} positionSystem={positionSystem} state={mockStateWithShip} />);
    
    // Проверяем, что coastline отображается в правильной линии для NE (совпадает с колонкой корабля)
    const shipPos = positionSystem.getShipPosition()!;
    const coastlineCells = screen.getAllByTestId(new RegExp(`^grid-cell-\\d+-${shipPos.col}$`));
    coastlineCells.forEach(cell => {
      expect(cell).toHaveClass('coastline');
    });
    
    // Проверяем, что другие столбцы не имеют coastline
    const otherCol = shipPos.col === 0 ? 1 : 0;
    const nonCoastlineCells = screen.getAllByTestId(new RegExp(`^grid-cell-\\d+-${otherCol}$`));
    nonCoastlineCells.forEach(cell => {
      expect(cell).not.toHaveClass('coastline');
    });
  });
}); 