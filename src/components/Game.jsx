import React, { useEffect, useCallback } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import Grid from './Grid';
import Card from './Card';
import Counters from './Counters';
import GamePhase from './GamePhase';
import GameOver from './GameOver';
import { createGameStateMachine } from '../game/gameStateMachine';
import { GameLogic } from '../game/gameLogic';

const Game = () => {
    const gameLogic = new GameLogic();
    const gameService = useActorRef(createGameStateMachine(gameLogic));

    const state = useSelector(gameService, (state) => state);
    const context = useSelector(gameService, (state) => state.context);

    useEffect(() => {
        const handleGameStateChanged = (event) => {
            gameService.send({
                type: 'UPDATE_STATE',
                ...event.detail
            });
        };

        const handleGameOver = (event) => {
            gameService.send({
                type: 'GAME_OVER',
                message: event.detail.message,
                isVictory: event.detail.isVictory
            });
        };

        gameLogic.events.addEventListener('gameStateChanged', handleGameStateChanged);
        gameLogic.events.addEventListener('gameOver', handleGameOver);

        return () => {
            gameLogic.events.removeEventListener('gameStateChanged', handleGameStateChanged);
            gameLogic.events.removeEventListener('gameOver', handleGameOver);
        };
    }, [gameService, gameLogic]);

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

    const renderCards = () => {
        const cards = [];
        context.occupiedPositions.forEach((card, pos) => {
            const [row, col] = pos.split(',').map(Number);
            const isClickable = state.matches('checkingFlippable') && card.isFlippable;
            cards.push(
                <Card
                    key={pos}
                    card={card}
                    row={row}
                    col={col}
                    isClickable={isClickable}
                    onClick={() => handleCellClick(row, col)}
                />
            );
        });
        return cards;
    };

    return (
        <div className="game-container">
            <div className="game-info">
                <Counters
                    lives={context.lives}
                    deckLength={context.deckLength}
                />
                <GamePhase
                    phase={state.value}
                    onSkipPhase={handleSkipPhase}
                />
            </div>
            <Grid
                onCellClick={handleCellClick}
                renderCards={renderCards}
            />
            <GameOver
                message={context.gameOverMessage}
                isVictory={context.isVictory}
            />
        </div>
    );
};

export default Game; 