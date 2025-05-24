import React from 'react';
import './GamePhase.css';

const PHASE_MESSAGES = {
    moving: 'Перемещение: выберите соседнюю клетку',
    decreasingLives: 'Уменьшение жизней...',
    checkingFlippable: 'Переворот карты или пропуск',
    shipMoving: 'Движение корабля...',
    gameOver: 'Игра окончена'
};

const GamePhase = ({ phase, onSkipPhase }) => {
    const currentPhase = typeof phase === 'object' ? phase.playing : phase;
    const message = PHASE_MESSAGES[currentPhase] || 'Неизвестная фаза';
    const showSkipButton = currentPhase === 'checkingFlippable';

    return (
        <div className="game-phase">
            <div className="phase-content">
                <span className="phase-message">{message}</span>
                {showSkipButton && (
                    <button
                        className="skip-phase-button"
                        onClick={onSkipPhase}
                    >
                        Пропустить
                    </button>
                )}
            </div>
        </div>
    );
};

export default GamePhase; 