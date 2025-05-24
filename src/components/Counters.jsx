import React from 'react';

const Counters = ({ lives, deckLength }) => {
    return (
        <div id="counters">
            <div className="counter" style={{ color: lives <= 5 ? 'red' : 'inherit' }}>
                ❤️ Жизни: <span id="lives">{lives}</span>
            </div>
            <div className="counter" style={{ color: deckLength <= 5 ? 'red' : 'inherit' }}>
                🃏 Карты: <span id="cards-left">{deckLength}</span>
            </div>
        </div>
    );
};

export default Counters; 