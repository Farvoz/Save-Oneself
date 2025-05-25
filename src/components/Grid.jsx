import React from 'react';
import Card from './Card';
import './Grid.css';
import { isValidPosition, canFlipCard } from '../game/gameRules';

const Grid = ({ onCellClick, occupiedPositions, state, context }) => {
    const renderGridCell = (row, col) => {
        const pos = `${row},${col}`;
        const card = occupiedPositions.get(pos);
        const isClickable = card && state.matches('playing.checkingFlippable') && 
            card.type === 'back' && canFlipCard(context, card);
        const isAvailableMove = state.matches('playing.moving') && isValidPosition(context, row, col);
        const isPlayerPosition = pos === context.playerPosition;

        return (
            <div 
                key={pos}
                className={`grid-cell ${isAvailableMove ? 'valid-move' : ''} ${isPlayerPosition ? 'player-position' : ''}`}
                onClick={() => onCellClick(row, col)}
            >
                {card && (
                    <Card
                        card={card}
                        row={row}
                        col={col}
                        isClickable={isClickable || isAvailableMove}
                        onClick={() => onCellClick(row, col)}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="grid">
            {Array.from({ length: 9 }, (_, i) => i - 4).map(row => 
                Array.from({ length: 9 }, (_, i) => i - 4).map(col => 
                    renderGridCell(row, col)
                )
            )}
        </div>
    );
};

export default Grid; 