import React from 'react';
import Card from './Card';
import './Grid.css';
import { isPlayerValidPosition, canFlipCard } from '../game/gameRules';
import { Position } from '../game/positionSystem';

const Grid = ({ onCellClick, positionSystem, state, context }) => {
    const renderGridCell = (row, col) => {
        const pos = new Position(row, col);
        const card = positionSystem.getPosition(pos);
        const isAvailableMove = state.matches('playing.moving') && isPlayerValidPosition(context, pos);
        const isPlayerPosition = context.playerPosition && context.playerPosition.equals(pos);
        const isFlippable = card && state.matches('playing.checkingFlippable') && 
            card.type === 'back' && canFlipCard(context, card);

        // Add coastline logic
        let isCoastline = false;
        if (context.shipCard?.direction) {
            const shipPos = context.shipCard.position;
            switch (context.shipCard.direction) {
                case 'NE':
                    isCoastline = col === shipPos.col;
                    break;
                case 'SW':
                    isCoastline = col === shipPos.col;
                    break;
                case 'NW':
                    isCoastline = row === shipPos.row;
                    break;
                case 'SE':
                    isCoastline = row === shipPos.row;
                    break;
            }
        }

        return (
            <div 
                key={pos.toString()}
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