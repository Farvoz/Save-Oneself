import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { hasFlippableCards, canFlipCard, checkVictory, isShipOutOfBounds } from './gameRules';
import { shuffleDeck, movePlayer, flipCard, moveShip, updateLives } from './gameActions';

export const createGameStateMachine = () => {
    return createMachine({
        id: 'game',
        initial: 'playing',
        context: INITIAL_STATE,
        states: {
            playing: {
                initial: 'moving',
                entry: [
                    // Shuffle deck and place first card
                    assign({
                        deck: ({ context }) => shuffleDeck(context).deck
                    }),
                    assign(({ context }) => movePlayer(context, 0, 0)),
                ],
                states: {
                    moving: {
                        on: {
                            MOVE_PLAYER: {
                                actions: [
                                    assign(({ context, event }) =>  movePlayer(context, event.row, event.col)),
                                ],
                                target: 'decreasingLives'
                            }
                        }
                    },
                    decreasingLives: { 
                        entry: [
                            assign(({ context }) => updateLives(context.lives, -1))
                        ],
                        after: {
                            300: [
                                {
                                    target: '..gameOver',
                                    guard: ({ context }) => context.lives <= 0,
                                    actions: assign({
                                        gameOverMessage: 'Игра окончена! Закончились жизни.',
                                        isVictory: false
                                    })
                                },
                                {
                                    target: 'checkingFlippable',
                                    guard: ({ context }) => hasFlippableCards(context)
                                },
                                { target: 'shipMoving' }
                            ]
                        }
                    },
                    checkingFlippable: {
                        on: {
                            FLIP_CARD: {
                                guard: ({ context, event }) => {
                                    const card = context.occupiedPositions.get(`${event.row},${event.col}`);
                                    return card && canFlipCard(context, card);
                                },
                                actions: [
                                    assign(({ context, event }) => 
                                        flipCard(context, event.row, event.col)
                                    )
                                ],
                                target: 'shipMoving'
                            },
                            SKIP_PHASE: {
                                target: 'shipMoving'
                            }
                        }
                    },
                    shipMoving: {
                        entry: [
                            assign(({ context }) => moveShip(context))
                        ],
                        after: {
                            500: [
                                { 
                                    target: '..gameOver', 
                                    guard: ({ context }) => checkVictory(context), 
                                    actions: assign({
                                        gameOverMessage: 'Победа! Корабль заметил сигнал!',
                                        isVictory: true
                                    }) 
                                },
                                {
                                    target: '..gameOver',
                                    guard: ({ context }) => isShipOutOfBounds(context),
                                    actions: assign({
                                        gameOverMessage: 'Игра окончена! Корабль уплыл слишком далеко.',
                                        isVictory: false
                                    })
                                },
                                { target: 'moving' }
                            ]
                        }
                    }
                }
            },
            gameOver: {
                type: 'final'
            }
        }
    });
}; 