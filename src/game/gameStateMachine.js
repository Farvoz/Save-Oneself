import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { isValidPosition, hasFlippableCards, canFlipCard } from './gameRules';
import { shuffleDeck, placeCard, flipCard, moveShip, decreaseLives } from './gameActions';

export const createGameStateMachine = () => {
    return createMachine({
        id: 'game',
        initial: 'playing',
        context: INITIAL_STATE,
        states: {
            playing: {
                initial: 'placement',
                entry: [
                    // Shuffle deck and place first card
                    assign({
                        deck: ({ context }) => shuffleDeck(context).deck
                    }),
                    assign({
                        occupiedPositions: ({ context }) => {
                            const newMap = new Map();
                            const firstCard = context.deck.pop();
                            newMap.set('0,0', firstCard);
                            return newMap;
                        },
                        playerPosition: '0,0'
                    }),
                ],
                states: {
                    placement: {
                        on: {
                            PLACE_CARD: {
                                guard: ({ context, event }) => 
                                    isValidPosition(context, event.row, event.col),
                                actions: [
                                    assign(({ context, event }) => 
                                        placeCard(context, event.row, event.col)
                                    )
                                ],
                                target: 'decreasingLives'
                            }
                        }
                    },
                    decreasingLives: {
                        entry: [
                            assign(({ context }) => {
                                try {
                                    return decreaseLives(context);
                                } catch (error) {
                                    if (error.message === 'GAME_OVER_NO_LIVES') {
                                        throw new Error('GAME_OVER_NO_LIVES');
                                    }
                                    return context;
                                }
                            })
                        ],
                        after: {
                            500: [
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
                            SKIP_PHASE: 'shipMoving'
                        }
                    },
                    shipMoving: {
                        entry: [
                            assign(({ context }) => {
                                try {
                                    return { shipCard: moveShip(context) };
                                } catch (error) {
                                    if (error.message === 'GAME_OVER_SHIP_TOO_FAR') {
                                        throw new Error('GAME_OVER_SHIP_TOO_FAR');
                                    } else if (error.message === 'GAME_OVER_VICTORY') {
                                        throw new Error('GAME_OVER_VICTORY');
                                    }
                                    return context;
                                }
                            })
                        ],
                        after: {
                            1000: 'placement'
                        }
                    }
                },
                on: {
                    GAME_OVER: {
                        target: 'gameOver',
                        actions: assign({
                            gameOverMessage: (_, event) => {
                                switch (event.error) {
                                    case 'GAME_OVER_NO_LIVES':
                                        return 'Игра окончена! Закончились жизни.';
                                    case 'GAME_OVER_SHIP_TOO_FAR':
                                        return 'Игра окончена! Корабль уплыл слишком далеко.';
                                    case 'GAME_OVER_VICTORY':
                                        return 'Победа! Корабль заметил сигнал!';
                                    default:
                                        return event.message;
                                }
                            },
                            isVictory: (_, event) => event.error === 'GAME_OVER_VICTORY'
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