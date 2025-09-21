import React from 'react';
import './StartTooltip.css';

export interface StartTooltipProps {
    text: string;
    position: { row: number; col: number };
    visible: boolean;
}

export const StartTooltip: React.FC<StartTooltipProps> = ({ text, position, visible }) => {
    if (!visible) return null;

    // Конвертируем координаты сетки в пиксели
    const cellSize = 100; // размер клетки в пикселях
    const gridOffset = 4; // смещение для координат (от -4 до 4)
    
    const left = (position.col + gridOffset) * cellSize + cellSize / 2;
    const top = (position.row + gridOffset) * cellSize + cellSize / 2 - 50;

    return (
        <div 
            className="tooltip"
            style={{
                left: `${left}px`,
                top: `${top}px`,
            }}
        >
            <div className="tooltip-content">
                {text}
            </div>
        </div>
    );
};
