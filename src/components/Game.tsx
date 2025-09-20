import React, { useCallback, useEffect } from 'react';
import { useActorRef, useSelector } from '@xstate/react';

import { Grid } from './Grid';
import Counters from './Counters';  
import GameOver from './GameOver';
import { createGameStateMachine, isPlayerValidPosition, calculateScore, Position, GameState } from '../core';

const machine = createGameStateMachine();

const Game: React.FC = () => {
    const gameService = useActorRef<typeof machine>(machine);

    const state = useSelector(gameService, (state: GameState) => state);
    const context = useSelector(gameService, (state: GameState) => state.context);

    const handleCellClick = (row: number, col: number): void => {
        if (state.matches('playing.moving') && isPlayerValidPosition(context, new Position(row, col))) {
            gameService.send({ type: 'MOVE_PLAYER', row, col });
        } else if (state.matches('playing.checkingFlippable')) {
            gameService.send({ type: 'FLIP_CARD', row, col });
        } else if (state.matches('playing.moving') && context.hasMoved && 
                   context.playerPosition && context.playerPosition.equals(new Position(row, col))) {
            // Клик на фигурку игрока для пропуска ходов
            gameService.send({ type: 'SKIP_MOVES' });
        }
    }

    const handleSkipPhase = useCallback((): void => {
        if (state.matches('playing.checkingFlippable')) {
            gameService.send({ type: 'SKIP_PHASE' });
        }
    }, [state, gameService]);

    const handleSkipMoves = useCallback((): void => {
        if (state.matches('playing.moving') && context.hasMoved) {
            gameService.send({ type: 'SKIP_MOVES' });
        }
    }, [state, context, gameService]);

    // Add keyboard event listener for space key
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent): void => {
            if (event.code === 'Space') {
                event.preventDefault(); // Prevent page scroll
                handleSkipPhase();
                handleSkipMoves();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleSkipPhase, handleSkipMoves]);

    return (
        <div className="game-container">
            <div className="game-info">
                <Counters
                    lives={context.lives}
                    deckLength={context.deck.length}
                    state={state}
                    handleSkipPhase={handleSkipPhase}
                />
            </div>
            <Grid 
                onCellClick={handleCellClick} 
                positionSystem={context.positionSystem} 
                state={state}
                onPlayerClick={() => {
                    if (state.matches('playing.moving') && context.hasMoved) {
                        gameService.send({ type: 'SKIP_MOVES' });
                    }
                }}
            />
            <GameOver
                message={context.gameOverMessage}
                isVictory={context.isVictory}
                score={calculateScore(context)}
            />
        </div>
    );
};

export default Game; 