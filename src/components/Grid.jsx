import React from 'react';

const Grid = ({ 
    onCellClick, 
    playerPosition, 
    occupiedPositions, 
    currentPhase,
    children 
}) => {
    const renderGridCell = (row, col) => {
        const isCoordinate = Math.abs(row) === 3 || Math.abs(col) === 3;
        const isCorner = Math.abs(row) === 3 && Math.abs(col) === 3;
        
        let cellContent = '';
        if (isCoordinate) {
            if (isCorner) {
                cellContent = `${row},${col}`;
            } else if (Math.abs(row) === 3) {
                cellContent = col;
            } else {
                cellContent = row;
            }
        }

        return (
            <div 
                key={`${row},${col}`}
                className={`grid-cell ${isCoordinate ? 'coordinate' : ''}`}
                onClick={() => onCellClick && onCellClick(row, col)}
            >
                {cellContent}
            </div>
        );
    };

    return (
        <div id="game-container" className="game-container">
            {Array.from({ length: 7 }, (_, i) => i - 3).map(row => 
                Array.from({ length: 7 }, (_, i) => i - 3).map(col => 
                    renderGridCell(row, col)
                )
            )}
            {children}
        </div>
    );
};

export default Grid; 