import React from 'react';
import './CardTooltip.css';
import { GameCard } from '../core';
import { SideInfo, RequirementsInfo } from './tooltip';

interface CardTooltipProps {
    card: GameCard;
    visible: boolean;
    position: { row: number; col: number };
}

export const CardTooltip: React.FC<CardTooltipProps> = ({ card, visible, position }) => {
    if (!visible) return null;

    
    // Конвертируем координаты сетки в пиксели
    const cellSize = 100;
    const gridOffset = 4;
    const tooltipWidth = 300;
    const tooltipHeight = 200; // примерная высота
    
    // Получаем позицию grid на странице
    const gridElement = document.querySelector('[data-testid="grid"]') as HTMLElement;
    const gridRect = gridElement?.getBoundingClientRect();
    const gridLeft = gridRect?.left || 0;
    const gridTop = gridRect?.top || 0;
    
    // Базовые координаты карты относительно grid
    const cardLeft = gridLeft + (position.col + gridOffset) * cellSize;
    const cardTop = gridTop + (position.row + gridOffset) * cellSize;
    
    // Позиционируем tooltip справа от карты
    let left = cardLeft + cellSize + 10;
    let top = cardTop;
    let arrowClass = 'left-arrow'; // стрелка слева, указывает на карту справа
    
    // Проверяем границы экрана
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Если tooltip выходит за правую границу, показываем слева
    if (left + tooltipWidth > viewportWidth - 20) {
        left = cardLeft - tooltipWidth - 10;
        arrowClass = 'right-arrow'; // стрелка справа, указывает на карту слева
    }
    
    // Если tooltip выходит за нижнюю границу, поднимаем его
    if (top + tooltipHeight > viewportHeight - 20) {
        top = viewportHeight - tooltipHeight - 20;
    }
    
    // Если tooltip выходит за верхнюю границу, опускаем его
    if (top < 20) {
        top = 20;
    }
    
    // Если tooltip выходит за левую границу, возвращаем справа
    if (left < 20) {
        left = cardLeft + cellSize + 10;
        arrowClass = 'left-arrow';
    }


    return (
        <div 
            className={`card-tooltip ${arrowClass}`}
            style={{
                left: `${left}px`,
                top: `${top}px`,
                '--tooltip-bg': 'var(--background-tooltip-secondary)',
                '--tooltip-border': 'var(--border-tooltip)'
            } as React.CSSProperties}
        >
            <div className="card-tooltip-content">
                {/* Показываем тыльную сторону */}
                <SideInfo
                    emoji={card.backSide.emoji}
                    name={card.backSide.russianName || card.backSide.id}
                    description={card.backSide.description || 'Нет описания'}
                    lives={card.backSide.lives}
                    score={card.backSide.score}
                    direction={card.backSide.direction}
                    grayscale={card.getCurrentType() === 'front'}
                />
                
                {/* Показываем требования для переворота */}
                {card.backSide.requirementsText && (
                    <RequirementsInfo
                        requirementsText={card.backSide.requirementsText}
                        className="side-requirements"
                    />
                )}
                
                {/* Показываем лицевую сторону */}
                {card.getCurrentType() !== 'ship' && <SideInfo
                    emoji={card.frontSide.emoji}
                    name={card.frontSide.russianName || card.frontSide.id}
                    description={card.frontSide.description || 'Нет описания'}
                    lives={card.frontSide.lives}
                    score={card.frontSide.score}
                    direction={card.frontSide.direction}
                    grayscale={card.getCurrentType() === 'back'}
                />}
            </div>
        </div>
    );
};
