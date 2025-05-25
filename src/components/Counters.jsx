import React, { useEffect, useState } from 'react';
import './Counters.css';

const PHASE_MESSAGES = {
    moving: 'Перемещение: выберите соседнюю клетку',
    decreasingLives: 'Уменьшение жизней...',
    checkingFlippable: 'Переворот карты или пропуск',
    shipMoving: 'Движение корабля...',
    gameOver: 'Игра окончена'
};

const Counters = ({ lives, deckLength, state, handleSkipPhase }) => {
    const [livesAnimation, setLivesAnimation] = useState('');
    const [prevLives, setPrevLives] = useState(lives);

    useEffect(() => {
        if (lives !== prevLives) {
            setLivesAnimation(lives > prevLives ? 'lives-increase' : 'lives-decrease');
            setPrevLives(lives);
            
            // Remove animation class after animation completes
            const timer = setTimeout(() => {
                setLivesAnimation('');
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [lives, prevLives]);

    const currentPhase = typeof state.value === 'object' ? state.value.playing : state.value;
    const message = PHASE_MESSAGES[currentPhase] || 'Неизвестная фаза';
    const showSkipButton = currentPhase === 'checkingFlippable';

    return (
        <div className="counters">
            <div className="game-stats">
                <div className="stat-item" style={{ color: lives <= 5 ? 'red' : 'inherit' }}>
                    <span className="counter-label">❤️ </span>
                    <span className={`counter-value ${livesAnimation}`}>{lives}</span>
                </div>
                <div className="stat-item" style={{ color: deckLength <= 5 ? 'red' : 'inherit' }}>
                    <span className="counter-label">🎴 </span>
                    <span className="counter-value">{deckLength}</span>
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