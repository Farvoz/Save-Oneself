import { render, screen } from '@testing-library/react';
import Card from '../../components/Card';

describe('Card Component', () => {
  const mockCard = {
    id: 'test-card',
    type: 'card',
    image: 'test-image.png',
    lives: 1
  };

  test('renders card with correct image', () => {
    render(<Card card={mockCard} />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveStyle({ backgroundColor: 'rgb(245, 245, 220)' });
  });

  test('renders card with lives indicator when applicable', () => {
    render(<Card card={mockCard} />);
    const livesIndicator = screen.getByText('1');
    expect(livesIndicator).toBeInTheDocument();
  });

  test('renders card without lives indicator when lives is 0', () => {
    const cardWithoutLives = { ...mockCard, lives: 0 };
    render(<Card card={cardWithoutLives} />);
    const livesIndicator = screen.queryByText('0');
    expect(livesIndicator).not.toBeInTheDocument();
  });

  test('renders card with negative lives indicator', () => {
    const negativeCard = { ...mockCard, lives: -1 };
    render(<Card card={negativeCard} />);
    const livesIndicator = screen.getByText('-1');
    expect(livesIndicator).toBeInTheDocument();
  });

  test('applies correct CSS classes based on card type', () => {
    render(<Card card={mockCard} />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveClass('card');
  });

  test('renders card with additional classes when props are provided', () => {
    render(<Card 
      card={mockCard} 
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