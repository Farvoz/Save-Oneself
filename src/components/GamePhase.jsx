import React from 'react';

const GamePhase = ({ currentPhase, onSkipPhase }) => {
    const getPhaseText = (phase) => {
        switch (phase) {
            case 1: return 'Фаза 1: Перемещение игрока';
            case 2: return 'Фаза 2: Уменьшение жизней';
            case 3: return 'Фаза 3: Переворот карты';
            case 4: return 'Фаза 4: Движение корабля';
            default: return '';
        }
    };

    return (
        <div id="game-phase" className="phase-active">
            <div id="phase-container">
                <div id="phase-text">{getPhaseText(currentPhase)}</div>
                {currentPhase === 3 && (
                    <button 
                        id="skip-phase" 
                        className="visible"
                        onClick={onSkipPhase}
                    >
                        Пропустить фазу
                    </button>
                )}
            </div>
        </div>
    );
};

export default GamePhase; 