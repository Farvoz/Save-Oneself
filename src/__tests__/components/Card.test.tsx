import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Card } from '../../components/Card';
import { GameCard } from '../../core';

describe('Компонент Card', () => {
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

  test('отрисовывает карту с корректным фоном', () => {
    render(<Card card={mockCard} {...defaultProps} />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveStyle({ backgroundColor: '#F5F5DC' });
  });

  test('не отображает индикатор жизней, когда жизней 0', () => {
    const back = { ...backSide, lives: 0 as number };
    const cardWithoutLives = new GameCard(back, frontSide);
    render(<Card card={cardWithoutLives} {...defaultProps} />);
    const livesIndicator = screen.queryByText('0');
    expect(livesIndicator).not.toBeInTheDocument();
  });

  test('применяет корректные CSS-классы в зависимости от типа карты', () => {
    render(<Card card={mockCard} {...defaultProps} />);
    const cardElement = screen.getByTestId('card-test-card');
    expect(cardElement).toHaveClass('card');
  });

  test('отрисовывает карту с дополнительными классами при переданных пропсах', () => {
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