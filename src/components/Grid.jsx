import React from 'react';
import Card from './Card';
import { useSelector } from '@xstate/react';

const Grid = ({ onCellClick, occupiedPositions, state }) => {
    const renderGridCell = (row, col) => {
        const pos = `${row},${col}`;
        const card = occupiedPositions.get(pos);
        const isClickable = card && state.matches('checkingFlippable') && card.type === 'back';

        return (
            <div 
                key={pos}
                className="grid-cell"
                onClick={() => onCellClick(row, col)}
            >
                {card && (
                    <Card
                        card={card}
                        row={row}
                        col={col}
                        isClickable={isClickable}
                        onClick={() => onCellClick(row, col)}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="grid">
            {Array.from({ length: 7 }, (_, i) => i - 3).map(row => 
                Array.from({ length: 7 }, (_, i) => i - 3).map(col => 
                    renderGridCell(row, col)
                )
            )}
        </div>
    );
};

export default Grid; 