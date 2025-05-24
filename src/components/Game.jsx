import React, { useCallback } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import Grid from './Grid';
import Counters from './Counters';
import GamePhase from './GamePhase';
import GameOver from './GameOver';
import { createGameStateMachine } from '../game/gameStateMachine';

const Game = () => {
    const gameService = useActorRef(createGameStateMachine());

    const state = useSelector(gameService, (state) => state);
    const context = useSelector(gameService, (state) => state.context);

    const handleCellClick = useCallback((row, col) => {
        if (state.matches('placement')) {
            gameService.send({ type: 'PLACE_CARD', row, col });
        } else if (state.matches('checkingFlippable')) {
            gameService.send({ type: 'FLIP_CARD', row, col });
        }
    }, [state, gameService]);

    const handleSkipPhase = useCallback(() => {
        if (state.matches('checkingFlippable')) {
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
            <Grid onCellClick={handleCellClick} occupiedPositions={context.occupiedPositions} state={state} />
            <GameOver
                message={context.gameOverMessage}
                isVictory={context.isVictory}
            />
        </div>
    );
};

export default Game; 