import React from 'react';
import './Tooltip.css';

export interface TooltipProps {
    text: string;
    position: { row: number; col: number };
    visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, position, visible }) => {
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
            <div className="tooltip-arrow"></div>
        </div>
    );
};
