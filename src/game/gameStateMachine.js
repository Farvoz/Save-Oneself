import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { hasFlippableCards, canFlipCard, checkVictory } from './gameRules';
import { shuffleDeck, movePlayer, flipCard, moveShip, updateLives } from './gameActions';
import { gameLogger } from './gameLogger';  
import { Position } from './positionSystem';

export const createGameStateMachine = () => {
    return createMachine({
        /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswDoAOAbFAngJYB2UmsALigE6UDyAZgEoD2AriRAMQAeVKSlhSMhNABQAGAJTdUGHPmJkK1OkzacIAbUkBdRKGytYRSkVYlDIXogBMAZgAsANkwAOBwFYAnAHY-Jx93AEZ3ABoQAkQXLxDMF0kkyQCQhxSQvwBfLMj5LDxCUnI0VgA3Yu4AWXoANQBRAH0ABQAZAEEATXrmXQMkEGNTc0trWwRHYMwndycnOxm44O9I6IQQyRcfTAWfYJDHSTC7HLz0AqVizFKKsm4AZQBpAElmxpqG+77rIbMLKwG40crg83n8gX2ESi9i8kkwySOoScXjmDnc2VyIHyiiKKgAxgALMB4gDWxSq5TAzDg7FwlD4AiEmBEYiksmxhWU5EJxLJZApZSpNLp3wGvxGANA4wCmBCMxmDhCPliXj8Pjsq0Qs3cmB8CK83hSknVpyx5xxXMwPNJ5Mp1NgtPp-GoTJZYAkMjk5s5V2tfKgAqFDpFIX6RhMf1GgPs7jccu1czCcTsXk1CD8W0wEL2Xk87ncRwcpo5l3xRJt-LtwqdjOEondbK9Ch9Zd5tsF9sd2jsYcGEYlYxjcflsycSYOqehCHVbhcu3zfncXhcLnmxe9pe55f9gc7dIZLrrrM9JdxW7blY71e0Dl74v+g4msdlI8TS4nabsfjsmAcflhaR2D4mRjj467NpuVrbsU9yUKwNBoAeghHg2J4bmeUEXlAsHwWgorhsMD7RggK7bEqBoGkcapqmmi4OLqex7C4zghHKK7gRcGF+jBcEIUhrr1h67LoZa3FkDhCHaKGPz9kRUoxJm5HeOkmT+D4aYOMBCQpkkoSxrG34uBxFpXBAxI0GAKCmGQrREIKsD8ShEjpGhEEYWZeIWVZxS2fZ+F9oRUbyQg+azsaTjGgcQFfp+KIeP+kh-smfhol4xktuQHledZUC+XAjnMoJ4gucJbmWlllk5XlsBSXeslBTYiAbD4TjTBmuYOKuepzmmzH0cinjzGkqoHGBmKnuV5mVT5dn5c6yGFayJVNpxk2edNNmzTVPYyYFkqNes4VtbEnhdZsGpTpprUTrpYQuAZdhGeNIm+tBZAAGK4EQ2DYCgABGuBgNw72tK8jQAMLtMwAAi-n3g14whMmWbNZ4nVMS1aZxPRSVJOkoR7I96WQWJUCfd9v0A0DTxg80AAS7T3PUcP1ftiPI34qMOOjyqY1OzE6rjkjopIdihP+xMYbABLfQKlTzQJrKwq5q1XNLsvlMULN7Y+mTc-C4KSLm7gtfmk5rHErVLnjfiJSb8xjWcZVqzL2By3cCtOeIyularKjq27mtkLVu2RmzTWczqc6wl+KaquiF1rPMcKJEkXh2HKewpBiTt++QAfu1ABVuhIPsrSZ-uu4X3Z1TrxHkV40xJb4khBA4CxOL1cQJAiqTpJzGKYiQrBmfAAz5KHA7EQAtEqabT44DGMcvy9OEWz3O2Qk9yQdQG9fRytJC4nN-hFouS5aAjqCwHBcNvCP2Eq8QPZzKpHK3vVfrKCKsUcIQuGkC+VwbjFHvuHCYvh4jyk0q3DOjh-xpmavEFcKD252CNvMJwQDWwVgDFWYMlAwGPgCGmU2L5GKi00oEOY2Dzy4IkmgIhxFsa6mRGCTmaRWKdynBmKO85j4ZjFu3WhmAKreU2vZJhwVgJwjsHI4+rdNjcxSBpOKN05ERUyCldiG886YVweTH6-1AZSIOmkTqOwTasRRPMXw+Yu6NzRs4dB+YlQ+HXrnCu+cq5BygKYxG-5tgoi2BFQ4-hWK9TlN-JIGd1TUVCMZfI9BBQ0H8YgeYiDgQ7CCMEe6cQj6DyyEAA */
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
                    assign(({ context }) => movePlayer(context, new Position(0, 0))),
                    () => gameLogger.info('Колода перемешана и игрок перемещён на стартовую позицию'),
                ],
                states: {
                    // В начале раунда обновляем количество ходов
                    startOfRound: {
                        entry: [
                            assign({
                                hasPlacedCard: false,
                                hasMoved: false,
                                movesLeft: ({ context }) => {
                                    const hasCompass = context.positionSystem.findCardById('compass');
                                    return hasCompass ? 2 : 1;
                                }
                            })
                        ],
                        always: { target: 'moving' }
                    },
                    moving: {
                        on: {
                            MOVE_PLAYER: {
                                actions: [
                                    assign(({ context, event }) => movePlayer(context, new Position(event.row, event.col))),
                                    ({ context: { playerPosition } }) => gameLogger.info('Игрок перемещён на позицию', { row: playerPosition.split(',')[0], col: playerPosition.split(',')[1] })
                                ],
                                target: 'checkingMoveResult'
                            },
                            SKIP_MOVES: {
                                guard: ({ context }) => context.hasMoved,
                                target: 'decreasingLives',
                                actions: () => {
                                    gameLogger.info('Remaining moves skipped');
                                }
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
                                    actions: ({ context }) => {
                                        gameLogger.info('Game over condition met', { message: context.gameOverMessage });
                                    }
                                },
                                {
                                    target: 'checkingStorm',
                                    guard: ({ context }) => context.positionSystem.countNonShipCards() === 13,
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
                                const stormPos = context.positionSystem.findCardById('storm').position;
                                gameLogger.info('Шторм найден на позиции', { stormPos });

                                if (stormPos) {
                                    return flipCard(context, stormPos);
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
                                    const card = context.positionSystem.getPosition(new Position(event.row, event.col));
                                    return card && canFlipCard(context, card);
                                },
                                actions: [
                                    assign(({ context, event }) => 
                                        flipCard(context, new Position(event.row, event.col))
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
                                    guard: ({ context }) => context.shipCard.cornerManager 
                                        ? context.shipCard.cornerManager.isShipOutOfBounds(context.shipCard.position) 
                                        : false,
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
                type: 'final'
            }
        }
    });
}; 