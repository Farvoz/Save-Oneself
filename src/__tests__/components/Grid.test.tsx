import { render, screen } from '@testing-library/react';
import Grid from '../../components/Grid';
import { PositionSystem, Position } from '../../core/PositionSystem';

describe('Grid Component', () => {
  const mockProps = {
    positionSystem: new PositionSystem(),
    onCellClick: jest.fn(),
    state: {
      matches: jest.fn().mockReturnValue(false)
    },
    context: {
      playerPosition: new Position(0, 0),
      shipCard: { 
        position: new Position(1, 1),
        direction: 'NW'
      }
    }
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
    positionSystem.setPosition(pos, { id: 'card1', type: 'card' });
    
    render(<Grid {...mockProps} positionSystem={positionSystem} />);
    const card = screen.getByTestId('card-card1');
    expect(card).toBeInTheDocument();
  });
}); 