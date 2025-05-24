import React from 'react';
import './GamePhase.css';

const PHASE_MESSAGES = {
    moving: {
        title: 'Фаза перемещения',
        description: 'Выберите клетку для перемещения игрока. Клетка должна быть соседней с текущей позицией игрока.'
    },
    decreasingLives: {
        title: 'Фаза уменьшения жизней',
        description: 'Количество жизней уменьшается...'
    },
    checkingFlippable: {
        title: 'Фаза переворота',
        description: 'Вы можете перевернуть карту, если выполнены все требования, или пропустить фазу.'
    },
    shipMoving: {
        title: 'Фаза движения корабля',
        description: 'Корабль движется согласно своему направлению...'
    },
    gameOver: {
        title: 'Игра окончена',
        description: ''
    }
};

const GamePhase = ({ phase, onSkipPhase }) => {
    // Получаем текущую фазу из состояния
    const currentPhase = typeof phase === 'object' ? phase.playing : phase;
    const phaseInfo = PHASE_MESSAGES[currentPhase] || {
        title: 'Неизвестная фаза',
        description: 'Произошла ошибка в определении фазы'
    };
    
    const showSkipButton = currentPhase === 'checkingFlippable';

    return (
        <div className="game-phase">
            <div className="phase-title">{phaseInfo.title}</div>
            <div className="phase-description">{phaseInfo.description}</div>
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