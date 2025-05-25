import React from 'react';
import { INITIAL_DECK, INITIAL_FRONT_DECK } from '../game/gameData';   
import './Card.css';

const Card = ({ 
    card, 
    row,
    col, 
    isPlayerPosition, 
    onClick, 
    isClickable,
    isFlipped,
    isAvailableMove
}) => {
    const handleClick = () => {
        if (isClickable && onClick) {
            onClick(row, col);
        }
    };

    const getEmoji = () => {
        if (card.type === 'ship') {
            return card.getEmoji ? card.getEmoji() : '🚢';
        }
        return card.emoji;
    };

    const cardStyle = {
        position: 'absolute',
        left: '1px',
        top: '1px',
        width: '96px',
        height: '96px',
        cursor: isClickable ? 'pointer' : 'default',
        backgroundColor: getCardBackground(card)
    };

    return (
        <div 
            className={`card ${isPlayerPosition ? 'player-position' : ''} ${isFlipped ? 'flipped' : ''} ${isClickable ? 'clickable' : ''} ${isAvailableMove ? 'available-move' : ''}`}
            style={cardStyle}
            data-position={`${row},${col}`}
            onClick={handleClick}
            title={card.description}
        >
            {isPlayerPosition && (
                <div className="player-marker">Игрок</div>
            )}
            <div className="card-content">
                {Math.abs(card.lives) > 0 && (
                    <div className="card-lives">{card.lives}</div>
                )}
                {card.type === 'back' && card.requirements && (
                    <div className="card-requirements">
                        {getRequirementsText(card.requirements)}
                    </div>
                )}
                {card.id && (
                    <div className="card-name">{`${getEmoji()} ${card.type === 'ship' ? '' : card.id}`}</div>
                )}
                {card.direction && (
                    <div className="card-direction">{card.direction}</div>
                )}
            </div>
        </div>
    );
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
    if (requirements === 'higher-ground') { 
        return 'нужно быть на ⛰️';
    }
    // Find required card from both decks
    const requiredCard = [...INITIAL_DECK, ...INITIAL_FRONT_DECK].find(card => card.id === requirements);
    const emoji = requiredCard ? requiredCard.emoji : '❓';

    return `нужна ${emoji}`;
};

export default Card; 