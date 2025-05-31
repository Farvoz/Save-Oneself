import React from 'react';
import Card from './Card';
import './Grid.css';
import { isValidPosition, canFlipCard } from '../game/gameRules';
import { Position } from '../game/positionSystem';

const Grid = ({ onCellClick, positionSystem, state, context }) => {
    const renderGridCell = (row, col) => {
        const pos = `${row},${col}`;
        const card = positionSystem.getPosition(new Position(row, col));
        const isAvailableMove = state.matches('playing.moving') && isValidPosition(context, new Position(row, col));
        const isPlayerPosition = pos === context.playerPosition;
        const isFlippable = card && state.matches('playing.checkingFlippable') && 
            card.type === 'back' && canFlipCard(context, card);

        // Add coastline logic
        let isCoastline = false;
        if (context.shipCard?.direction) {
            const [shipRow, shipCol] = context.shipCard.position.split(',').map(Number);
            switch (context.shipCard.direction) {
                case 'NE':
                    isCoastline = col === shipCol;
                    break;
                case 'SW':
                    isCoastline = col === shipCol;
                    break;
                case 'NW':
                    isCoastline = row === shipRow;
                    break;
                case 'SE':
                    isCoastline = row === shipRow;
                    break;
            }
        }

        return (
            <div 
                key={pos}
                data-testid={`grid-cell-${row}-${col}`}
                className={`grid-cell ${isAvailableMove ? 'valid-move' : ''} ${isCoastline ? 'coastline' : ''} ${isPlayerPosition ? 'player' : ''}`}
                onClick={() => onCellClick(row, col)}
            >
                {card && (
                    <Card
                        card={card}
                        row={row}
                        col={col}
                        isAvailableMove={isAvailableMove}
                        onClick={() => onCellClick(row, col)}
                        isPlayerPosition={isPlayerPosition}
                        isFlippable={isFlippable}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="grid" data-testid="grid">
            {Array.from({ length: 9 }, (_, i) => i - 4).map(row => 
                Array.from({ length: 9 }, (_, i) => i - 4).map(col => 
                    renderGridCell(row, col)
                )
            )}
        </div>
    );
};

export default Grid; 