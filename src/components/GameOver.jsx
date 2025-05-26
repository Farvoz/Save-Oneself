import React from 'react';

const GameOver = ({ message, isVictory, score }) => {
    if (!message) return null;

    const style = {
        display: 'block',
        backgroundColor: isVictory ? 'rgba(0, 128, 0, 0.9)' : 'rgba(0, 0, 0, 0.9)'
    };

    return (
        <div id="game-over" style={style}>
            {message}
            {score !== undefined && (
                <div style={{ marginTop: '10px', fontSize: '20px' }}>
                    Набрано очков: {score} ⭐
                </div>
            )}
        </div>
    );
};

export default GameOver; 