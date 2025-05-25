import React from 'react';
import './Counters.css';

const PHASE_MESSAGES = {
    moving: 'Перемещение: выберите соседнюю клетку',
    decreasingLives: 'Уменьшение жизней...',
    checkingFlippable: 'Переворот карты или пропуск',
    shipMoving: 'Движение корабля...',
    gameOver: 'Игра окончена'
};

const Counters = ({ lives, deckLength, state, handleSkipPhase }) => {
    const currentPhase = typeof state.value === 'object' ? state.value.playing : state.value;
    const message = PHASE_MESSAGES[currentPhase] || 'Неизвестная фаза';
    const showSkipButton = currentPhase === 'checkingFlippable';

    return (
        <div id="counters">
            <div className="game-stats">
                <div className="stat-item" style={{ color: lives <= 5 ? 'red' : 'inherit' }}>
                    ❤️ {lives}
                </div>
                <div className="stat-item" style={{ color: deckLength <= 5 ? 'red' : 'inherit' }}>
                    🃏 {deckLength}
                </div>
                <div className="phase-content">
                    <span className="phase-message">{message}</span>
                    {showSkipButton && (
                        <button
                            className="skip-phase-button"
                            onClick={handleSkipPhase}
                        >
                            Пропустить
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Counters; 