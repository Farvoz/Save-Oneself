import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { hasFlippableCards, canFlipCard, checkVictory } from './gameRules';
import { shuffleDeck, movePlayer, flipCard, moveShip, decreaseLives, increaseLives, placeCard, placeShip } from './gameActions';

const logGameState = (context, phase) => {
    console.log(`=== Phase: ${phase} ===`);
    console.log('Occupied Positions:', Object.fromEntries(context.occupiedPositions));
    console.log('==================');
};

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
                    assign({
                        occupiedPositions: ({ context }) => {
                            const newMap = new Map();
                            const firstCard = context.deck.pop();
                            newMap.set('0,0', firstCard);
                            return newMap;
                        },
                        playerPosition: '0,0'
                    }),
                    ({ context }) => logGameState(context, 'initial')
                ],
                states: {
                    moving: {
                        entry: ({ context }) => logGameState(context, 'moving'),
                        on: {
                            MOVE_PLAYER: {
                                actions: [
                                    assign(({ context, event }) => {
                                        const { playerPosition } = movePlayer(context, event.row, event.col);
                                        
                                        // если место свободное, то placeCard
                                        const [row, col] = playerPosition.split(',').map(Number);
                                        let card = context.occupiedPositions.get(`${row},${col}`);
                                        let newOccupiedPositions = context.occupiedPositions;
                                        let newDeck = context.deck;
                                        let newLives = context.lives;
                                        let newShipCard = context.shipCard;


                                        // если карта не существует, то placeCard
                                        if (!card) {
                                            const { occupiedPositions, deck, cardObj } = placeCard(context, row, col);
                                            newOccupiedPositions = occupiedPositions;
                                            newDeck = deck;
                                            card = cardObj;
                                        }

                                        // если карта с жизнями, то восстанавливается жизнь
                                        if (card && card.lives > 0) {
                                            const { lives } = increaseLives(context, card.lives);
                                            newLives = lives;
                                        }

                                        // если карта с направлением и нет других кораблей, то размещается корабль
                                        if (card.direction && !context.shipCard.direction) {
                                            const { shipCard, occupiedPositions } = placeShip(newOccupiedPositions, card.direction);
                                            newOccupiedPositions = occupiedPositions;
                                            newShipCard = shipCard;
                                        }

                                        return {
                                            playerPosition,
                                            occupiedPositions: newOccupiedPositions,
                                            deck: newDeck,
                                            lives: newLives,
                                            shipCard: newShipCard
                                        }
                                    }),
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
                            }),
                            ({ context }) => logGameState(context, 'decreasing_lives')
                        ],
                        after: {
                            300: [
                                {
                                    target: 'checkingFlippable',
                                    guard: ({ context }) => hasFlippableCards(context)
                                },
                                { target: 'shipMoving' }
                            ]
                        }
                    },
                    checkingFlippable: {
                        entry: ({ context }) => logGameState(context, 'checking_flippable'),
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
                                    ({ context }) => logGameState(context, 'after_flip')
                                ],
                                target: 'shipMoving'
                            },
                            SKIP_PHASE: {
                                actions: ({ context }) => logGameState(context, 'skip_flip_phase'),
                                target: 'shipMoving'
                            }
                        }
                    },
                    shipMoving: {
                        entry: [
                            assign(({ context }) => {
                                try {
                                    const newSlice = moveShip(context);
                                    const newContext = { ...context, ...newSlice };

                                    // Check for victory after ship moves
                                    if (checkVictory(newContext)) {
                                        throw new Error('GAME_OVER_VICTORY');
                                    }

                                    if (newContext.shipCard.moves >= 5) {
                                        throw new Error('GAME_OVER_SHIP_TOO_FAR');
                                    }

                                    return newContext;
                                } catch (error) {
                                    if (error.message === 'GAME_OVER_SHIP_TOO_FAR') {
                                        // переход в конец игры
                                        return { gameOverMessage: 'Игра окончена! Корабль уплыл слишком далеко.', isVictory: false };
                                    } else if (error.message === 'GAME_OVER_VICTORY') {
                                        // переход в конец игры
                                        return { gameOverMessage: 'Победа! Корабль заметил сигнал!', isVictory: true };
                                    }
                                    return context;
                                }
                            })
                        ],
                        after: {
                            500: 'moving'
                        }
                    }
                },
                on: {
                    GAME_OVER: {
                        target: 'gameOver',
                        actions: [
                            assign({
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
                            }),
                            ({ context }) => logGameState(context, 'game_over')
                        ]
                    }
                }
            },
            gameOver: {
                type: 'final'
            }
        }
    });
}; 