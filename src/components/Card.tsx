import React, { useState, useRef, useEffect } from 'react';
import './Card.css';
import { GameCard, ShipCard } from '../core';
import { CardTooltip } from './CardTooltip';

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
    const [showTooltip, setShowTooltip] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleClick = (): void => {
        if (onClick) {
            onClick(row, col);
        }
    };

    const handleMouseEnter = () => {
        // Показываем tooltip с небольшой задержкой
        hoverTimeoutRef.current = setTimeout(() => {
            setShowTooltip(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    // Очищаем timeout при размонтировании компонента
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const getEmoji = (): string => {
        if (card.getCurrentType() === 'ship' && card instanceof ShipCard) {
            return card.getEmoji();
        }
        return card.getCurrentEmoji();
    };

    const getCardBackground = (cardObj: GameCard): string => {
        if (cardObj.getCurrentType() === 'ship') return '#87CEEB';
        if (cardObj.getCurrentType() === 'back') return '#F5F5DC';
        if (cardObj.getCurrentType() === 'front') return '#E8F5E9';
        return '#F5F5DC';
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
        <>
            <div 
                className={`card ${isPlayerPosition ? 'player-position' : ''} ${isFlipped ? 'flipped' : ''} ${isAvailableMove ? 'available-move' : ''} ${isFlippable ? 'flippable' : ''}`}
                style={cardStyle}
                data-position={`${row},${col}`}
                data-testid={`card-${card.getCurrentId()}`}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
                {card.getCurrentType() === 'back' && card.getRequirementsText() && (
                    <div className="card-requirements">
                        {card.getRequirementsText()}
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
            <CardTooltip 
                card={card}
                visible={showTooltip}
                position={{ row, col }}
                isFlippable={isFlippable}
            />
        </>
    );
};
