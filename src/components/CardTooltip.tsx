import React from 'react';
import './CardTooltip.css';
import { GameCard } from '../core';

interface CardTooltipProps {
    card: GameCard;
    visible: boolean;
    position: { row: number; col: number };
}

export const CardTooltip: React.FC<CardTooltipProps> = ({ card, visible, position }) => {
    if (!visible) return null;

    const currentSide = card.getCurrentSide();
    
    // Функция для получения цвета карты (аналогично Card.tsx)
    const getCardBackground = (cardObj: GameCard): string => {
        if (cardObj.getCurrentType() === 'ship') return '#87CEEB';
        if (cardObj.getCurrentType() === 'back') return '#F5F5DC';
        if (cardObj.getCurrentType() === 'front') return '#E8F5E9';
        return '#F5F5DC';
    };
    
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

    const getSideInfo = (side: { emoji: string; id: string; russianName?: string; description?: string; lives?: number; score?: number; direction?: string; requirementsText?: string }, isCurrent: boolean, backgroundColor?: string) => {
        const emoji = side.emoji;
        const name = side.russianName || side.id;
        const description = side.description || 'Нет описания';
        
        const sideStyle: React.CSSProperties = backgroundColor ? {
            backgroundColor: backgroundColor,
            borderLeftColor: backgroundColor
        } : {};
        
        return (
            <div 
                className={`side-info ${isCurrent ? 'current' : 'other'}`}
                style={sideStyle}
            >
                <div className="side-header">
                    <span className="side-emoji">{emoji}</span>
                    <span className="side-name">{name}</span>
                </div>
                <div className="side-description">{description}</div>
                
                {(side.lives || side.score || side.direction) && (
                    <div className="side-stats">
                        {side.lives && (
                            <span className="stat">{side.lives > 0 ? "💖" : "💔"} {side.lives}</span>
                        )}
                        {side.score && (
                            <span className="stat">✨ {side.score}</span>
                        )}
                        {side.direction && (
                            <span className="stat">🧭 {side.direction}</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div 
            className={`card-tooltip ${arrowClass}`}
            style={{
                left: `${left}px`,
                top: `${top}px`,
                '--tooltip-bg': '#f8f9fa',
                '--tooltip-border': '#dee2e6'
            } as React.CSSProperties}
        >
            <div className="card-tooltip-content">
                {/* Всегда показываем тыльную сторону первой */}
                {card.getCurrentType() === 'back' ? (
                    getSideInfo(currentSide, true, getCardBackground(card))
                ) : (
                    getSideInfo(card.backSide, false, '#F5F5DC')
                )}
                
                {/* Показываем лицевую сторону только если это не корабль */}
                {card.getCurrentType() !== 'ship' && (
                    card.getCurrentType() === 'front' ? (
                        getSideInfo(currentSide, true, getCardBackground(card))
                    ) : (
                        <div className="side-info hidden">
                            <div className="side-header">
                                <span className="side-emoji">❓</span>
                                <span className="side-name"><i>Лицевая сторона</i></span>
                            </div>
                            
                            <div className="side-requirements">
                                <span className="requirement">📋 Можно перевернуть: {card.backSide.requirementsText || 'Нет требований'}</span>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
