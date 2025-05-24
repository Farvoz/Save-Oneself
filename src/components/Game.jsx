import React, { useEffect, useState } from 'react';
import Grid from './Grid';
import Card from './Card';
import Counters from './Counters';
import GamePhase from './GamePhase';
import GameOver from './GameOver';

const Game = ({ gameLogic }) => {
    const [gameState, setGameState] = useState({
        lives: 16,
        deckLength: 15,
        playerPosition: null,
        currentPhase: 1,
        occupiedPositions: new Map(),
        gameOverMessage: null,
        isVictory: false
    });

    useEffect(() => {
        const handleGameStateChanged = (e) => {
            const { lives, deckLength, playerPosition, currentPhase, occupiedPositions } = e.detail;
            setGameState(prev => ({
                ...prev,
                lives,
                deckLength,
                playerPosition,
                currentPhase,
                occupiedPositions: new Map(occupiedPositions)
            }));
        };

        const handleCardPlaced = (e) => {
            const { lives, deckLength } = e.detail;
            setGameState(prev => ({
                ...prev,
                lives,
                deckLength
            }));
        };

        const handleGameOver = (e) => {
            const { message, isVictory } = e.detail;
            setGameState(prev => ({
                ...prev,
                gameOverMessage: message,
                isVictory
            }));
        };

        gameLogic.events.addEventListener('gameStateChanged', handleGameStateChanged);
        gameLogic.events.addEventListener('cardPlaced', handleCardPlaced);
        gameLogic.events.addEventListener('gameOver', handleGameOver);

        // Initial game state
        setGameState({
            lives: gameLogic.lives,
            deckLength: gameLogic.deck.length,
            playerPosition: gameLogic.playerPosition,
            currentPhase: gameLogic.currentPhase,
            occupiedPositions: new Map(gameLogic.occupiedPositions),
            gameOverMessage: null,
            isVictory: false
        });

        return () => {
            gameLogic.events.removeEventListener('gameStateChanged', handleGameStateChanged);
            gameLogic.events.removeEventListener('cardPlaced', handleCardPlaced);
            gameLogic.events.removeEventListener('gameOver', handleGameOver);
        };
    }, [gameLogic]);

    const handleCellClick = (row, col) => {
        if (gameLogic.currentPhase === 1) {
            gameLogic.placeCard(row, col);
        }
    };

    const handleCardClick = (row, col) => {
        if (gameLogic.currentPhase === 3) {
            gameLogic.tryFlipCard(row, col);
        }
    };

    const renderCards = () => {
        const cards = [];
        gameState.occupiedPositions.forEach((cardObj, pos) => {
            const [row, col] = pos.split(',').map(Number);
            const isPlayerPosition = pos === gameState.playerPosition;
            const isClickable = cardObj.type === 'back' && 
                              gameLogic.currentPhase === 3 && 
                              gameLogic.canFlipCard(cardObj);

            cards.push(
                <Card
                    key={pos}
                    cardObj={cardObj}
                    position={{ row, col }}
                    isPlayerPosition={isPlayerPosition}
                    onClick={handleCardClick}
                    isClickable={isClickable}
                />
            );
        });
        return cards;
    };

    return (
        <div className="game">
            <Counters 
                lives={gameState.lives} 
                deckLength={gameState.deckLength} 
            />
            
            <GamePhase 
                currentPhase={gameState.currentPhase}
                onSkipPhase={() => gameLogic.nextPhase()}
            />

            <Grid
                onCellClick={handleCellClick}
                playerPosition={gameState.playerPosition}
                occupiedPositions={gameState.occupiedPositions}
                currentPhase={gameState.currentPhase}
            >
                {renderCards()}
            </Grid>

            <GameOver 
                message={gameState.gameOverMessage}
                isVictory={gameState.isVictory}
            />
        </div>
    );
};

export default Game; 