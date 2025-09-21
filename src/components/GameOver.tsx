import React from 'react';
import './GameOver.css';

interface GameOverProps {
    message: string | null;
    isVictory: boolean;
    score: number;
}

const GameOver: React.FC<GameOverProps> = ({ message, isVictory, score }) => {
    if (!message) return null;

    return (
        <div id="game-over" className={isVictory ? 'victory' : 'defeat'}>
            <div className="game-over-message">{message}</div>
            {score !== undefined && (
                <div className="game-over-score">
                    Набрано очков: {score} ⭐
                </div>
            )}
        </div>
    );
};

export default GameOver; 