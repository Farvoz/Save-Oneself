import React, { useCallback } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import Grid from './Grid';
import Counters from './Counters';
import GamePhase from './GamePhase';
import GameOver from './GameOver';
import { createGameStateMachine } from '../game/gameStateMachine';
import { isValidPosition } from '../game/gameRules';

const machine = createGameStateMachine();

const Game = () => {
    const gameService = useActorRef(machine);

    const state = useSelector(gameService, (state) => state);
    const context = useSelector(gameService, (state) => state.context);

    const handleCellClick = useCallback((row, col) => {
        if (state.matches('playing.moving') && isValidPosition(context, row, col)) {
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

    return (
        <div className="game-container">
            <div className="game-info">
                <Counters
                    lives={context.lives}
                    deckLength={context.deck.length}
                />
                <GamePhase
                    phase={state.value}
                    onSkipPhase={handleSkipPhase}
                />
            </div>
            <Grid 
                onCellClick={handleCellClick} 
                occupiedPositions={context.occupiedPositions} 
                state={state}
                context={context}
            />
            <GameOver
                message={context.gameOverMessage}
                isVictory={context.isVictory}
            />
        </div>
    );
};

export default Game; 