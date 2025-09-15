import { useEffect, useState } from 'react';
import { GameState } from '../core/initial';
import './Counters.css';

type GamePhase = 'moving' | 'decreasingLives' | 'checkingFlippable' | 'shipMoving' | 'gameOver';

const PHASE_MESSAGES: Record<GamePhase, string> = {
    moving: 'Перемещение: выберите соседнюю клетку',
    decreasingLives: 'Уменьшение жизней...',
    checkingFlippable: 'Переворот карты или пропуск',
    shipMoving: 'Движение корабля...',
    gameOver: 'Игра окончена'
};

interface CountersProps {
    lives: number;
    deckLength: number;
    state: GameState;
    handleSkipPhase: () => void;
    handleSkipMoves: () => void;
}

const Counters: React.FC<CountersProps> = ({ lives, deckLength, state, handleSkipPhase, handleSkipMoves }) => {
    const [livesAnimation, setLivesAnimation] = useState<string>('');
    const [prevLives, setPrevLives] = useState<number>(lives);

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

    const currentPhase = typeof state.value === 'object' ? state.value.playing as GamePhase : state.value as GamePhase;
    const message = PHASE_MESSAGES[currentPhase] || 'Неизвестная фаза';
    const showSkipButton = currentPhase === 'checkingFlippable';
    const showSkipMovesButton = currentPhase === 'moving' && state.context.hasMoved;

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
                    {showSkipMovesButton && (
                        <button
                            className="skip-phase-button"
                            onClick={handleSkipMoves}
                        >
                            Остаться здесь
                        </button>
                    )}
                </div>
                <div className="help-links">
                    <a href="https://boardgamegeek.com/filepage/132096/marooned-rules" target="_blank" rel="noreferrer noopener" className="help-link-text" title="Правила игры">?</a>
                    <a href="https://www.youtube.com/watch?v=WcO8Ln88VQU" target="_blank" rel="noreferrer noopener" className="help-link-text" title="Летсплей">▶</a>
                </div>
            </div>
        </div>
    );
};

export default Counters; 