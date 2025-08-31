import { render, screen } from '@testing-library/react';
import { createActor } from 'xstate';
import { Grid } from '../../components/Grid';
import { PositionSystem, Position } from '../../core/PositionSystem';
import { GridProps } from '../../components/Grid';
import { createGameStateMachine } from '../../core/gameStateMachine';
import { GameCard } from '../../core/Card';
import { CARD_DATA, ship } from '../../core/cardData';
import { ShipCornerManager } from '../../core/ShipCornerManager';
import { ShipCard } from '../../core/Card';

describe('Grid Component', () => {
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

  test('renders grid with correct dimensions', () => {
    render(<Grid {...mockProps} />);
    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toBeInTheDocument();
  });

  test('renders cells for each position', () => {
    render(<Grid {...mockProps} />);
    const cells = screen.getAllByTestId(/^grid-cell-\d+-\d+$/);
    expect(cells.length).toBe(25); // 5x5 grid (-4 to 4 in both dimensions)
  });

  test('calls onCellClick when cell is clicked', () => {
    render(<Grid {...mockProps} />);
    const cell = screen.getByTestId('grid-cell-0-0');
    cell.click();
    expect(mockProps.onCellClick).toHaveBeenCalledWith(0, 0);
  });

  test('highlights player position', () => {
    render(<Grid {...mockProps} />);
    const playerCell = screen.getByTestId('grid-cell-0-0');
    expect(playerCell).toHaveClass('player');
  });

  test('renders cards in occupied positions', () => {
    const positionSystem = new PositionSystem();
    const pos = new Position(0, 0);
    positionSystem.setPosition(pos, testCard);
    
    render(<Grid {...mockProps} positionSystem={positionSystem} />);
    const card = screen.getByTestId(`card-${testCard.getCurrentId()}`);
    expect(card).toBeInTheDocument();
  });

  test('renders coastline based on ship position from positionSystem', () => {
    const positionSystem = new PositionSystem();
    
    // Создаем корабль в позиции (1, 1) с направлением NE
    const shipCard = new GameCard(ship, ship);
    shipCard.getCurrentSide = () => ({
      ...ship,
      direction: 'NE',
      type: 'ship'
    });
    
    positionSystem.setPosition(new Position(1, 1), shipCard);
    
    // Создаем мок стейт с shipCard
    const mockStateWithShip = {
      ...mockState,
      context: {
        ...mockState.context,
        shipCard: new ShipCard(ship, 'NE', new Position(1, 1), new ShipCornerManager('NE', positionSystem.getBounds()))
      }
    };
    
    render(<Grid {...mockProps} positionSystem={positionSystem} state={mockStateWithShip} />);
    
    // Проверяем, что coastline отображается в правильном столбце (col === 1)
    const coastlineCells = screen.getAllByTestId(/^grid-cell-\d+-1$/);
    coastlineCells.forEach(cell => {
      expect(cell).toHaveClass('coastline');
    });
    
    // Проверяем, что другие столбцы не имеют coastline
    const nonCoastlineCells = screen.getAllByTestId(/^grid-cell-\d+-0$/);
    nonCoastlineCells.forEach(cell => {
      expect(cell).not.toHaveClass('coastline');
    });
  });
}); 