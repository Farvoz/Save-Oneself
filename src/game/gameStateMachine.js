import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { hasFlippableCards, canFlipCard, checkVictory, isShipOutOfBounds } from './gameRules';
import { shuffleDeck, movePlayer, flipCard, moveShip, updateLives, findStormCardPosition, countNonShipCards } from './gameActions';
import { gameLogger } from './gameLogger';

export const createGameStateMachine = () => {
    return createMachine({
        id: 'game',
        initial: 'playing',
        context: INITIAL_STATE,
        states: {
            playing: {
                initial: 'startOfRound',
                entry: [
                    assign({
                        deck: ({ context }) => shuffleDeck(context).deck
                    }),
                    assign(({ context }) => movePlayer(context, 0, 0)),
                    () => gameLogger.info('Колода перемешана и игрок перемещён на стартовую позицию'),
                ],
                states: {
                    // В начале раунда обновляем количество ходов
                    startOfRound: {
                        entry: [
                            assign({
                                hasPlacedCard: false,
                                movesLeft: ({ context }) => {
                                    const hasCompass = Array.from(context.occupiedPositions.values())
                                        .some(card => card.id === 'compass');
                                    return hasCompass ? 2 : 1;
                                }
                            })
                        ],
                        after: {
                            0: { target: 'moving' }
                        }
                    },
                    moving: {
                        on: {
                            MOVE_PLAYER: {
                                actions: [
                                    assign(({ context, event }) => movePlayer(context, event.row, event.col)),
                                    ({ context: { playerPosition } }) => gameLogger.info('Игрок перемещён на позицию', { row: playerPosition.split(',')[0], col: playerPosition.split(',')[1] })
                                ],
                                target: 'checkingMoveResult'
                            }
                        }
                    },
                    // состояние для проверки результата хода
                    checkingMoveResult: {
                        after: {
                            0: [
                                {
                                    target: '..gameOver',
                                    guard: ({ context }) => context.gameOverMessage,
                                    actions: () => {
                                        gameLogger.info('Game over condition met', { message: context.gameOverMessage });
                                    }
                                },
                                {
                                    target: 'checkingStorm',
                                    guard: ({ context }) => countNonShipCards(context.occupiedPositions) === 13,
                                    actions: () => {
                                        gameLogger.info('Проверяем, есть ли шторм на поле, так как вышла 13 карта');
                                    }
                                },
                                {
                                    target: 'moving',
                                    guard: ({ context }) => context.movesLeft > 0,
                                    actions: () => {
                                        gameLogger.info('У игрока остались ходы');
                                    }
                                },
                                { target: 'decreasingLives' }
                            ]
                        }
                    },
                    // На 13 ходу проверяем, есть ли шторм на поле
                    checkingStorm: {
                        entry: [
                            assign(({ context }) => {
                                const stormPos = findStormCardPosition(context.occupiedPositions);
                                gameLogger.info('Шторм найден на позиции', { stormPos });

                                if (stormPos) {
                                    const [row, col] = stormPos.split(',').map(Number);
                                    return flipCard(context, row, col);
                                }
                                return context;
                            })
                        ],
                        after: {
                            0: [
                                {
                                    target: 'moving',
                                    guard: ({ context }) => context.movesLeft > 0,
                                    actions: () => {
                                        gameLogger.info('У игрока остались ходы');
                                    }
                                },
                                { 
                                    target: 'decreasingLives' 
                                }
                            ]
                        }
                    },
                    decreasingLives: { 
                        entry: [
                            assign(({ context }) => updateLives(context.lives, -1)),
                            ({ context: { lives } }) => gameLogger.info('Жизни уменьшены на 1', { lives })
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
                                    guard: ({ context }) => hasFlippableCards(context),
                                    actions: () => {
                                        gameLogger.info('Flippable cards found, waiting for player action');
                                    }
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
                                    ),
                                    ({ event }) => gameLogger.info('Карта перевернута на позиции', { row: event.row, col: event.col })
                                ],
                                target: 'shipMoving'
                            },
                            SKIP_PHASE: {
                                target: 'shipMoving',
                                actions: () => {
                                    gameLogger.info('Card flip phase skipped');
                                }
                            }
                        }
                    },
                    shipMoving: {
                        entry: [
                            assign(({ context }) => moveShip(context)),
                            ({ context: { shipCard: { position } } }) => position 
                                ? gameLogger.info('Корабль перемещён на позицию', { position }) 
                                : gameLogger.info('Корабль не перемещён')
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
                                { target: 'startOfRound' }
                            ]
                        }
                    }
                }
            },
            gameOver: {
                type: 'final',
                entry: ({ context }) => {
                    gameLogger.info('Game over', { 
                        message: context.gameOverMessage,
                        isVictory: context.isVictory
                    });
                }
            }
        }
    });
}; 