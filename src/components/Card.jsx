import React from 'react';

import './Card.css';

const Card = ({ 
    card, 
    row,
    col, 
    isPlayerPosition, 
    onClick, 
    isClickable 
}) => {
    const coords = polarToCartesian(row, col);

    const cardStyle = {
        position: 'absolute',
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        width: '100px',
        height: '100px',
        cursor: isClickable ? 'pointer' : 'default',
        backgroundColor: getCardBackground(card)
    };

    return (
        <div 
            className={`card ${isPlayerPosition ? 'player-position' : ''}`}
            style={cardStyle}
            data-position={`${row},${col}`}
            onClick={() => onClick && onClick(row, col)}
        >
            {isPlayerPosition && (
                <div className="player-marker">Игрок</div>
            )}
            <div className="card-content">
                {card.lives > 0 && (
                    <div className="card-lives">{card.lives}</div>
                )}
                {card.id && (
                    <div className="card-name">{`${card.emoji} ${card.id}`}</div>
                )}
                {card.direction && (
                    <div className="card-direction">{card.direction}</div>
                )}
                {card.type === 'back' && card.requirements && (
                    <div className="card-requirements">
                        {getRequirementsText(card.requirements)}
                    </div>
                )}
            </div>
        </div>
    );
};

// Utility functions
const polarToCartesian = (row, col) => {
    // Преобразуем координаты сетки (-3 до 3) в пиксели (0 до 600)
    // Центр (0,0) должен быть в точке (300,300)
    const x = col  * 100;  // -3 -> 0, 0 -> 300, 3 -> 600
    const y = (0 - row) * 100;  // -3 -> 600, 0 -> 300, 3 -> 0
    
    return { x, y };
};

const getCardBackground = (cardObj) => {
    if (cardObj.type === 'ship') return '#87CEEB';
    if (cardObj.type === 'back') return '#F5F5DC';
    if (cardObj.type === 'front') return '#E8F5E9';
    return '#F5F5DC';
};

const getRequirementsText = (requirements) => {
    if (requirements === '_ship-set-sail') {
        return 'нужен корабль на паузе';
    }
    return `нужна ${requirements}`;
};

export default Card; 