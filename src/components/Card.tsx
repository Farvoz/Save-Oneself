import React from 'react';
import { INITIAL_GAME_DECK } from '../core/gameData';
import './Card.css';
import { GameCard, ShipCard } from '../core/Card';

interface CardProps {
    card: GameCard;
    row: number;
    col: number;
    isPlayerPosition: boolean;
    onClick: (row: number, col: number) => void;
    isFlipped?: boolean;
    isAvailableMove: boolean;
    isFlippable: boolean;
}

export const Card: React.FC<CardProps> = ({ 
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
        if (card.getCurrentType() === 'ship' && card instanceof ShipCard) {
            return card.getEmoji();
        }
        return card.getCurrentEmoji();
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
            data-testid={`card-${card.getCurrentId()}`}
            onClick={handleClick}
            title={card.getCurrentDescription()}
        >
            {isPlayerPosition && (
                <div className="player-marker">Игрок</div>
            )}
            {isFlippable && (
                <div className="flip-indicator">🔄</div>
            )}
            <div className="card-content">
                {Math.abs(card.getCurrentLives()) > 0 && (
                    <div className={"card-lives " + (card.getCurrentLives() > 0 ? "positive" : "")}>
                        {card.getCurrentLives()}
                    </div>
                )}
                {card.getCurrentScore() && (
                    <div className="card-score">
                        {card.getCurrentScore()} ⭐
                    </div>
                )}
                {card.getCurrentType() === 'back' && card.getRequirements() && (
                    <div className="card-requirements">
                        {getRequirementsText(card.getRequirements()!)}
                    </div>
                )}
                {card.getCurrentId() && (
                    <div className="card-name">{`${getEmoji()} ${card.getCurrentType() === 'ship' ? '' : card.getCurrentId()}`}</div>
                )}
                {card.getCurrentDirection() && (
                    <div className="card-direction">{card.getCurrentDirection()}</div>
                )}
            </div>
        </div>
    );
};

const getCardBackground = (cardObj: Card): string => {
    if (cardObj.getCurrentType() === 'ship') return '#87CEEB';
    if (cardObj.getCurrentType() === 'back') return '#F5F5DC';
    if (cardObj.getCurrentType() === 'front') return '#E8F5E9';
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
    const requiredCard = [...INITIAL_GAME_DECK].find(card => card.getCurrentId() === requirements);
    const emoji = requiredCard ? requiredCard.getCurrentEmoji() : '❓';

    return `нужна ${emoji}`;
};
