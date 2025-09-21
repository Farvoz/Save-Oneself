import React from 'react';

import { Card } from './Card';
import { StartTooltip } from './StartTooltip';
import './Grid.css';
import { Position, PositionSystem, isPlayerValidPosition, GameState, getValidMovePositions } from '../core';

export interface GridProps {
    onCellClick: (row: number, col: number) => void;
    positionSystem: PositionSystem;
    state: GameState;
    onPlayerClick?: () => void;
}

export const Grid: React.FC<GridProps> = ({ onCellClick, positionSystem, state, onPlayerClick }) => {
    const context = state.context;
    const validMovePositions = state.matches('playing.moving') ? getValidMovePositions(context) : [];
    
    const renderGridCell = (row: number, col: number): React.ReactNode => {
        const pos = new Position(row, col);
        const card = positionSystem.getPosition(pos);
        const isAvailableMove = state.matches('playing.moving') && isPlayerValidPosition(context, pos);
        const isPlayerPosition = context.playerPosition && context.playerPosition.equals(pos);
        const isFlippable = card && state.matches('playing.checkingFlippable') && card.canFlip(context);
        const isValidMovePosition = validMovePositions.some(validPos => validPos.equals(pos));

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
                className={`grid-cell ${isCoastline ? 'coastline' : ''} ${isPlayerPosition ? 'player' : ''}`}
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
                        onPlayerClick={onPlayerClick}
                        hasMovesLeft={state.matches('playing.moving') && context.movesLeft > 0}
                    />
                )}
                {/* Показываем эмоджи шагов для доступных позиций */}
                {isValidMovePosition && !isPlayerPosition && (
                    <div className="step-emoji">👣</div>
                )}
            </div>
        );
    };

    // Функция для рендеринга пунктирных линий
    const renderDottedLines = () => {
        if (!context.playerPosition || !state.matches('playing.moving')) {
            return null;
        }

        const playerPos = context.playerPosition;
        const playerX = (playerPos.col + 4) * 100 + 50; // Центр ячейки (100px)
        const playerY = (playerPos.row + 4) * 100 + 50;

        return validMovePositions.map((pos, index) => {
            if (pos.equals(playerPos)) return null;
            
            const targetX = (pos.col + 4) * 100 + 50; // Центр ячейки (100px)
            const targetY = (pos.row + 4) * 100 + 50;
            
            return (
                <line
                    key={`line-${index}`}
                    x1={playerX}
                    y1={playerY}
                    x2={targetX}
                    y2={targetY}
                    stroke="var(--grid-stroke)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                    className="dotted-line"
                />
            );
        });
    };

    return (
        <div className="grid" data-testid="grid">
            {Array.from({ length: 9 }, (_, i) => i - 4).map(row => 
                Array.from({ length: 9 }, (_, i) => i - 4).map(col => 
                    renderGridCell(row, col)
                )
            )}
            <svg className="grid-lines" width="900" height="900">
                {renderDottedLines()}
            </svg>
            <StartTooltip 
                text="Меня выбросило на остров... Надо изучить местность и выбраться отсюда!"
                position={{ row: 0, col: 0 }}
                visible={context.showStartTooltip && !context.playerPosition}
            />
        </div>
    );
};