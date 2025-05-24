import React from 'react';

const PHASE_MESSAGES = {
    placement: 'Разместите карту',
    decreasingLives: 'Уменьшение жизней...',
    checkingFlippable: 'Переверните карту или пропустите фазу',
    shipMoving: 'Корабль движется...',
    gameOver: 'Игра окончена'
};

const GamePhase = ({ phase, onSkipPhase }) => {
    const message = PHASE_MESSAGES[phase.playing] || 'Неизвестная фаза';
    const showSkipButton = phase.playing === 'checkingFlippable';

    return (
        <div className="game-phase">
            <div className="phase-message">{message}</div>
            {showSkipButton && (
                <button
                    className="skip-phase-button"
                    onClick={onSkipPhase}
                >
                    Пропустить фазу
                </button>
            )}
        </div>
    );
};

export default GamePhase; 