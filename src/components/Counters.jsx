import React from 'react';
import GamePhase from './GamePhase';
import './Counters.css';

const Counters = ({ lives, deckLength, state, handleSkipPhase }) => {
    return (
        <div id="counters">
            <div className="game-stats">
                <div className="stat-item" style={{ color: lives <= 5 ? 'red' : 'inherit' }}>
                    ❤️ {lives}
                </div>
                <div className="stat-item" style={{ color: deckLength <= 5 ? 'red' : 'inherit' }}>
                    🃏 {deckLength}
                </div>
            </div>
            <GamePhase
                phase={state.value}
                onSkipPhase={handleSkipPhase}
            />
        </div>
    );
};

export default Counters; 