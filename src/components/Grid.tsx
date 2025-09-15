import React from 'react';

import { Card } from './Card';
import { Tooltip } from './Tooltip';
import './Grid.css';
import { Position, PositionSystem, isPlayerValidPosition, GameState } from '../core';

export interface GridProps {
    onCellClick: (row: number, col: number) => void;
    positionSystem: PositionSystem;
    state: GameState;   
}

export const Grid: React.FC<GridProps> = ({ onCellClick, positionSystem, state }) => {
    const context = state.context;
    const renderGridCell = (row: number, col: number): React.ReactNode => {
        const pos = new Position(row, col);
        const card = positionSystem.getPosition(pos);
        const isAvailableMove = state.matches('playing.moving') && isPlayerValidPosition(context, pos);
        const isPlayerPosition = context.playerPosition && context.playerPosition.equals(pos);
        const isFlippable = card && state.matches('playing.checkingFlippable') && card.canFlip(context);

        // Add coastline logic - use positionSystem to find ship position for consistency
        let isCoastline = false;
        const shipCard = positionSystem.getShipCard();
        if (shipCard?.getCurrentDirection()) {
            const shipPos = positionSystem.getShipPosition();
            if (shipPos) {
                switch (shipCard.getCurrentDirection()) {
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
                        isPlayerPosition={isPlayerPosition ?? false}
                        isFlippable={isFlippable ?? false}
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
            <Tooltip 
                text="Ты очнулся на острове... Исследуй остров, чтобы с него выбраться. Начни отсюда!"
                position={{ row: 0, col: 0 }}
                visible={context.showStartTooltip && !context.playerPosition}
            />
        </div>
    );
};