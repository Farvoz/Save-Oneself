import { render, screen } from '@testing-library/react';
import Grid from '../../components/Grid';

describe('Grid Component', () => {
  const mockProps = {
    occupiedPositions: new Map(),
    onCellClick: jest.fn(),
    state: {
      matches: jest.fn().mockReturnValue(false)
    },
    context: {
      playerPosition: '0,0',
      shipCard: { position: '1,1' }
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
    const occupiedPositions = new Map();
    occupiedPositions.set('0,0', { id: 'card1', type: 'card' });
    
    render(<Grid {...mockProps} occupiedPositions={occupiedPositions} />);
    const card = screen.getByTestId('card-card1');
    expect(card).toBeInTheDocument();
  });
}); 