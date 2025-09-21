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
    onPlayerClick?: () => void;
    hasMovesLeft?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
    card, 
    row,
    col, 
    isPlayerPosition, 
    onClick, 
    isFlipped = false,
    isAvailableMove,
    isFlippable,
    onPlayerClick,
    hasMovesLeft = false
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleClick = (): void => {
        if (onClick) {
            onClick(row, col);
        }
    };

    const handlePlayerClick = (e: React.MouseEvent): void => {
        e.stopPropagation(); // Предотвращаем всплытие события к карте
        if (onPlayerClick) {
            onPlayerClick();
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
        if (cardObj.getCurrentType() === 'ship') return 'var(--card-ship)';
        if (cardObj.getCurrentType() === 'back') return 'var(--card-back)';
        if (cardObj.getCurrentType() === 'front') return 'var(--card-front)';
        return 'var(--card-default)';
    };

    const cardStyle: React.CSSProperties = {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '100px',
        height: '100px',
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
                    <div 
                        className={`player-marker ${hasMovesLeft ? 'clickable-player' : ''}`} 
                        onClick={handlePlayerClick}
                    >
                        🚶
                    </div>
                )}
                <div className="card-content">
                    {Math.abs(card.getCurrentLives()) > 0 && (
                        <div className={"card-lives " + (card.getCurrentLives() > 0 ? "positive" : "")}>
                            {card.getCurrentLives() > 0 ? "💖" : "💔"} {card.getCurrentLives()}
                        </div>
                    )}
                    {card.getCurrentScore() && (
                        <div className="card-score">
                            ✨ {card.getCurrentScore()}
                        </div>
                    )}
                    {card.getCurrentType() === 'back' && card.getRequirementsText() && (
                        <div className="card-requirements">
                            {card.getRequirementsText()}
                        </div>
                    )}
                    {card.getCurrentId() && (
                        <div className={`card-name ${card.getCurrentType() === 'ship' ? 'ship-name' : ''}`}>
                            <span className="card-name-text">{`${getEmoji()} ${card.getCurrentType() === 'ship' ? '' : card.getCurrentRussianName() || card.getCurrentId()}`}</span>
                        </div>
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
            />
        </>
    );
};
