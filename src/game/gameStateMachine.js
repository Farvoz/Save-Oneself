import { createMachine, assign } from 'xstate';

export const createGameStateMachine = (gameLogic) => {
    return createMachine({
        id: 'game',
        initial: 'playing',
        context: {
            gameLogic,
            lives: 16,
            deckLength: 15,
            playerPosition: null,
            occupiedPositions: new Map(),
            gameOverMessage: null,
            isVictory: false
        },
        states: {
            playing: {
                initial: 'placement',
                entry: [
                    ({ context }) => {
                        context.gameLogic.startGame();
                    }
                ],
                states: {
                    placement: {
                        // при начале логировать
                        entry: [
                            ({ context }) => {
                                console.log('placement', context);
                            }
                        ],
                        on: {
                            PLACE_CARD: {
                                actions: [
                                    (context, event) => {
                                        const success = context.gameLogic.placeCard(event.row, event.col);
                                        if (success) {
                                            return 'decreasingLives';
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    decreasingLives: {
                        entry: [
                            ({ context }) => {
                                console.log('decreasingLives');
                                context.gameLogic.decreaseLives();
                            }
                        ],
                        after: {
                            500: [
                                {
                                    target: 'checkingFlippable',
                                    guard: ({ context }) => context.gameLogic.hasFlippableCards()
                                },
                                {
                                    target: 'shipMoving'
                                }
                            ]
                        }
                    },
                    checkingFlippable: {
                        entry: [
                            ({ context }) => {
                                console.log('checkingFlippable');
                            }
                        ],
                        on: {
                            FLIP_CARD: {
                                actions: [
                                    ({ context, event }) => {
                                        const success = context.gameLogic.tryFlipCard(event.row, event.col);
                                        if (success) {
                                            return 'shipMoving';
                                        }
                                    }
                                ]
                            },
                            SKIP_PHASE: {
                                target: 'shipMoving'
                            }
                        }
                    },
                    shipMoving: {
                        entry: [
                            ({ context }) => {
                                console.log('shipMoving');
                                context.gameLogic.tryMoveShip();
                            }
                        ],
                        after: {
                            1000: {
                                target: 'placement'
                            }
                        }
                    }
                },
                on: {
                    GAME_OVER: {
                        target: 'gameOver',
                        actions: assign({
                            gameOverMessage: (_, event) => event.message,
                            isVictory: (_, event) => event.isVictory
                        })
                    }
                }
            },
            gameOver: {
                type: 'final'
            }
        }
    });
}; 