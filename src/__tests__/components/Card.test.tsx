import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Card } from '../../components/Card';
import { GameCard } from '../../core/Card';

describe('Card Component', () => {
  const backSide = {
    id: 'test-card',
    lives: 1,
    type: 'back' as const,
    emoji: '🧪',
    description: 'Test card',
  };
  const frontSide = {
    id: 'test-card-front',
    lives: 0,
    type: 'front' as const,
    emoji: '🧪',
    description: 'Test card front',
  };
  const mockCard = new GameCard(backSide, frontSide);
  const defaultProps = {
    row: 0,
    col: 0,
    isPlayerPosition: false,
    isAvailableMove: false,
    isFlippable: false,
    onClick: jest.fn(),
  };

  test('renders card with correct background', () => {
    render(<Card card={mockCard} {...defaultProps} />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveStyle({ backgroundColor: '#F5F5DC' });
  });

  test('renders card with lives indicator when applicable', () => {
    render(<Card card={mockCard} {...defaultProps} />);
    const livesIndicator = screen.getByText('1');
    expect(livesIndicator).toBeInTheDocument();
  });

  test('renders card without lives indicator when lives is 0', () => {
    const back = { ...backSide, lives: 0 as number };
    const cardWithoutLives = new GameCard(back, frontSide);
    render(<Card card={cardWithoutLives} {...defaultProps} />);
    const livesIndicator = screen.queryByText('0');
    expect(livesIndicator).not.toBeInTheDocument();
  });

  test('renders card with negative lives indicator', () => {
    const back = { ...backSide, lives: -1 as number };
    const negativeCard = new GameCard(back, frontSide);
    render(<Card card={negativeCard} {...defaultProps} />);
    const livesIndicator = screen.getByText('-1');
    expect(livesIndicator).toBeInTheDocument();
  });

  test('applies correct CSS classes based on card type', () => {
    render(<Card card={mockCard} {...defaultProps} />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveClass('card');
  });

  test('renders card with additional classes when props are provided', () => {
    render(<Card 
      card={mockCard} 
      {...defaultProps}
      isPlayerPosition={true}
      isFlipped={true}
      isAvailableMove={true}
      isFlippable={true}
    />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveClass('card');
    expect(cardElement).toHaveClass('player-position');
    expect(cardElement).toHaveClass('flipped');
    expect(cardElement).toHaveClass('available-move');
    expect(cardElement).toHaveClass('flippable');
  });
}); 