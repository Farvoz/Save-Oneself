import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { hasFlippableCards, canFlipCard, checkVictory } from './gameRules';
import { shuffleDeck, movePlayer, moveShip, updateLives, placeCard, placeShip } from './gameActions';
import { gameLogger } from './gameLogger';  
import { Position } from './PositionSystem';
import type { GameContext } from './gameData';
import type { CardSide } from './Card';

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
                    () => gameLogger.info('Колода перемешана'),
                ],
                states: {
                    // В начале раунда обновляем количество ходов
                    startOfRound: {
                        entry: [
                            assign({
                                hasPlacedCard: false,
                                hasMoved: false
                            }),
                            assign(({ context }) => applyCardHandlers(context, 'onRoundStart'))
                        ],
                        always: { target: 'moving' }
                    },
                    moving: {
                        on: {
                            MOVE_PLAYER: {
                                actions: [
                                    assign(({ context, event }) => movePlayer(context, new Position(event.row, event.col))),
                                    ({ context: { playerPosition } }) => playerPosition && gameLogger.info('Игрок перемещён на позицию', { row: playerPosition.row, col: playerPosition.col })
                                ],
                                target: 'checkingCardPlacement'
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
                    // Проверяем, нужно ли размещать карту
                    checkingCardPlacement: {
                        after: {
                            0: [
                                {
                                    target: 'gameOver',
                                    guard: ({ context }) => Boolean(context.gameOverMessage),
                                    actions: ({ context }) => {
                                        gameLogger.info('Game over condition met', { message: context.gameOverMessage });
                                    }
                                },
                                {
                                    target: 'placingCardAndShip',
                                    guard: ({ context }) => { 
                                        return !context.positionSystem.getPosition(context.playerPosition!) && !context.hasPlacedCard 
                                    },
                                    actions: () => {
                                        gameLogger.info('Нужно разместить карту');
                                    }
                                },
                                { target: 'checkingCardEffects' }
                            ]
                        }
                    },
                    // Размещаем карту и проверяем необходимость размещения корабля
                    placingCardAndShip: {
                        entry: [
                            assign(({ context }) => {
                                let newContext = { ...context };
                                
                                // Размещаем карту
                                const { positionSystem, deck, cardObj, lives } = placeCard(context, context.playerPosition!);
                                newContext = {
                                    ...newContext,
                                    positionSystem,
                                    deck,
                                    lives,
                                    hasPlacedCard: true
                                };

                                // Проверяем необходимость размещения корабля
                                if (cardObj.getCurrentDirection() && !context.shipCard?.getCurrentDirection()) {
                                    const { shipCard, positionSystem: newPositionSystem } = placeShip(positionSystem, cardObj.getCurrentDirection()!);
                                    newContext = {
                                        ...newContext,
                                        shipCard,
                                        positionSystem: newPositionSystem
                                    };
                                }

                                return newContext;
                            })
                        ],
                        after: {
                            0: { target: 'checkingCardEffects' }
                        }
                    },
                    // Проверяем все эффекты карт
                    checkingCardEffects: {
                        entry: [
                            assign(({ context }) => {
                                const card = context.positionSystem.getPosition(context.playerPosition!);
                                if (!card) return context;
                                let newContext = { ...context };
                                if (card.getCurrentLives() > 0) {
                                    const { lives } = updateLives(context.lives, card.getCurrentLives());
                                    newContext = { ...newContext, lives };
                                }
                                // Вызов обработчика onPlace только для текущей карты
                                newContext = applyCardHandlerForCurrentCard(newContext, 'onPlace', context.playerPosition!);
                                return newContext;
                            })
                        ],
                        after: {
                            0: { target: 'checkingMoveResult' }
                        }
                    },
                    // состояние для проверки результата хода
                    checkingMoveResult: {
                        after: {
                            0: [
                                {
                                    target: 'gameOver',
                                    guard: ({ context }) => Boolean(context.gameOverMessage),
                                    actions: ({ context }) => {
                                        gameLogger.info('Game over condition met', { message: context.gameOverMessage });
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
                    decreasingLives: { 
                        entry: [
                            assign(({ context }) => updateLives(context.lives, -1)),
                            ({ context: { lives } }) => gameLogger.info('Жизни уменьшены на 1', { lives })
                        ],
                        after: {
                            0: [
                                {
                                    target: 'gameOver',
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
                                    return Boolean(card && canFlipCard(context, card));
                                },
                                actions: [
                                    assign(({ context, event }) => {
                                        const card = context.positionSystem.getPosition(new Position(event.row, event.col));
                                        if (card) {
                                            card.flip();
                                        }
                                        return context;
                                    }),
                                    ({ event }) => gameLogger.info('Карта перевернута на позиции', { row: event.row, col: event.col })
                                ],
                                target: 'checkingFlipEffects'
                            },
                            SKIP_PHASE: {
                                target: 'shipMoving',
                                actions: () => {
                                    gameLogger.info('Card flip phase skipped');
                                }
                            }
                        }
                    },
                    // Проверяем эффекты при перевороте карты
                    checkingFlipEffects: {
                        entry: [
                            assign(({ context }) => {
                                const card = context.positionSystem.getPosition(context.playerPosition!);
                                if (!card) return context;
                                let newContext = { ...context };
                                if (card.getCurrentLives() > 0) {
                                    const { lives } = updateLives(context.lives, card.getCurrentLives());
                                    newContext = { ...newContext, lives };
                                }
                                // Вызов обработчика onFlip только для текущей карты
                                newContext = applyCardHandlerForCurrentCard(newContext, 'onFlip', context.playerPosition!);
                                return newContext;
                            })
                        ],
                        after: {
                            0: { target: 'shipMoving' }
                        }
                    },
                    shipMoving: {
                        entry: [
                            assign(({ context }) => moveShip(context)),
                            ({ context: { shipCard } }) => shipCard?.position 
                                ? gameLogger.info('Корабль перемещён на позицию', { position: shipCard.position }) 
                                : gameLogger.info('Корабль не перемещён')
                        ],
                        after: {
                            500: [
                                {   
                                    target: 'gameOver', 
                                    guard: ({ context }) => checkVictory(context), 
                                    actions: assign({
                                        gameOverMessage: 'Победа! Корабль заметил сигнал!',
                                        isVictory: true
                                    }) 
                                },
                                {             
                                    target: 'gameOver',
                                    guard: ({ context }) => context.shipCard?.cornerManager 
                                        ? context.shipCard.cornerManager.isShipOutOfBounds(context.shipCard!.position!) 
                                        : false,
                                    actions: assign({
                                        gameOverMessage: 'Игра окончена! Корабль уплыл слишком далеко.',
                                        isVictory: false
                                    })
                                },
                                { target: 'checkingShipEffects' }
                            ]
                        }
                    },
                    // Проверяем эффекты при движении корабля
                    checkingShipEffects: {
                        entry: [
                            assign(({ context }) => applyCardHandlers(context, 'onShipMove'))
                        ],
                        after: {
                            0: { target: 'startOfRound' }
                        }
                    },
                    gameOver: {
                        type: 'final'
                    }
                }
            }
        }
    });
};

// Вспомогательная функция для вызова обработчиков карт
function applyCardHandlers(context: GameContext, handlerName: keyof CardSide) {
    let newContext = { ...context };
    const allCards = context.positionSystem.findAllBy(() => true);
    for (const { card } of allCards) {
        const side = card.getCurrentSide();
        if (side && typeof side[handlerName] === 'function') {
            const handler = side[handlerName] as ((ctx: GameContext) => GameContext);
            newContext = handler(newContext) || newContext;
        }
    }
    return newContext;
}

function applyCardHandlerForCurrentCard(context: GameContext, handlerName: keyof CardSide, position: Position) {
    const card = context.positionSystem.getPosition(position);
    if (!card) return context;
    const side = card.getCurrentSide();
    if (side && typeof side[handlerName] === 'function') {
        const handler = side[handlerName] as ((ctx: GameContext) => GameContext);
        return handler(context) || context;
    }
    return context;
} 