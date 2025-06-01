import React, { useCallback, useEffect } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import Grid from './Grid';
import Counters from './Counters';
import GameOver from './GameOver';
import { createGameStateMachine } from '../game/gameStateMachine';
import { isPlayerValidPosition, calculateScore } from '../game/gameRules';
import { Position } from '../game/positionSystem';

const machine = createGameStateMachine();

const Game = () => {
    const gameService = useActorRef(machine);

    const state = useSelector(gameService, (state) => state);
    const context = useSelector(gameService, (state) => state.context);

    const handleCellClick = useCallback((row, col) => {
        if (state.matches('playing.moving') && isPlayerValidPosition(context, new Position(row, col))) {
            gameService.send({ type: 'MOVE_PLAYER', row, col });
        } else if (state.matches('playing.checkingFlippable')) {
            gameService.send({ type: 'FLIP_CARD', row, col });
        }
    }, [state, gameService]);

    const handleSkipPhase = useCallback(() => {
        if (state.matches('playing.checkingFlippable')) {
            gameService.send({ type: 'SKIP_PHASE' });
        }
    }, [state, gameService]);

    const handleSkipMoves = useCallback(() => {
        if (state.matches('playing.moving') && context.hasMoved) {
            gameService.send({ type: 'SKIP_MOVES' });
        }
    }, [state, context, gameService]);

    // Add keyboard event listener for space key
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.code === 'Space') {
                event.preventDefault(); // Prevent page scroll
                handleSkipPhase();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleSkipPhase]);

    return (
        <div className="game-container">
            <div className="game-info">
                <Counters
                    lives={context.lives}
                    deckLength={context.deck.length}
                    state={state}
                    handleSkipPhase={handleSkipPhase}
                    handleSkipMoves={handleSkipMoves}
                />
            </div>
            <Grid 
                onCellClick={handleCellClick} 
                positionSystem={context.positionSystem} 
                state={state}
                context={context}
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