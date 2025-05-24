import React from 'react';

const Card = ({ 
    cardObj, 
    position, 
    isPlayerPosition, 
    onClick, 
    isClickable 
}) => {
    const { row, col } = position;
    const coords = polarToCartesian(row, col);

    const cardStyle = {
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        cursor: isClickable ? 'pointer' : 'default',
        backgroundColor: getCardBackground(cardObj)
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
                {cardObj.lives > 0 && (
                    <div className="card-lives">{cardObj.lives}</div>
                )}
                {cardObj.id && (
                    <div className="card-name">{`${cardObj.emoji} ${cardObj.id}`}</div>
                )}
                {cardObj.direction && (
                    <div className="card-direction">{cardObj.direction}</div>
                )}
                {cardObj.type === 'back' && cardObj.requirements && (
                    <div className="card-requirements">
                        {getRequirementsText(cardObj.requirements)}
                    </div>
                )}
            </div>
        </div>
    );
};

// Utility functions
const polarToCartesian = (row, col) => ({
    x: ((col + 3) * 100),
    y: ((row + 3) * 100)
});

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