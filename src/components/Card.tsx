import React from 'react';
import { INITIAL_DECK, INITIAL_FRONT_DECK } from '../core/gameData';
import { Card as CardType } from '../core/gameData';
import './Card.css';

interface CardProps {
    card: CardType;
    row: number;
    col: number;
    isPlayerPosition: boolean;
    onClick: (row: number, col: number) => void;
    isFlipped?: boolean;
    isAvailableMove: boolean;
    isFlippable: boolean;
}

const Card: React.FC<CardProps> = ({ 
    card, 
    row,
    col, 
    isPlayerPosition, 
    onClick, 
    isFlipped = false,
    isAvailableMove,
    isFlippable
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick(row, col);
        }
    };

    const getEmoji = (): string => {
        if (card.type === 'ship') {
            return card.getEmoji ? card.getEmoji() : '🚢';
        }
        return card.emoji;
    };

    const cardStyle: React.CSSProperties = {
        position: 'absolute',
        left: '1px',
        top: '1px',
        width: '96px',
        height: '96px',
        cursor: isAvailableMove || isFlippable ? 'pointer' : 'default',
        backgroundColor: getCardBackground(card)
    };

    return (
        <div 
            className={`card ${isPlayerPosition ? 'player-position' : ''} ${isFlipped ? 'flipped' : ''} ${isAvailableMove ? 'available-move' : ''} ${isFlippable ? 'flippable' : ''}`}
            style={cardStyle}
            data-position={`${row},${col}`}
            data-testid={`card-${card.id}`}
            onClick={handleClick}
            title={card.description}
        >
            {isPlayerPosition && (
                <div className="player-marker">Игрок</div>
            )}
            {isFlippable && (
                <div className="flip-indicator">🔄</div>
            )}
            <div className="card-content">
                {Math.abs(card.lives) > 0 && (
                    <div className={"card-lives " + (card.lives > 0 ? "positive" : "")}>
                        {card.lives}
                    </div>
                )}
                {card.score && (
                    <div className="card-score">
                        {card.score} ⭐
                    </div>
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

const getCardBackground = (cardObj: CardType): string => {
    if (cardObj.type === 'ship') return '#87CEEB';
    if (cardObj.type === 'back') return '#F5F5DC';
    if (cardObj.type === 'front') return '#E8F5E9';
    return '#F5F5DC';
};

const getRequirementsText = (requirements: string): string => {
    if (requirements === '_ship-set-sail') {
        return 'нужен корабль на паузе';
    }

    if (requirements === 'higher-ground') { 
        return 'нужно быть на ⛰️';
    }

    if (requirements === '_13-turn') {
        return '13 карта';
    }

    if (requirements === '_map') {
        return 'найти пересечение';
    }

    if (requirements === '_ship-sailing') {
        return 'ждать отплытие';
    }

    // Find required card from both decks
    const requiredCard = [...INITIAL_DECK, ...INITIAL_FRONT_DECK].find(card => card.id === requirements);
    const emoji = requiredCard ? requiredCard.emoji : '❓';

    return `нужна ${emoji}`;
};

export default Card; 