import { createMachine, assign } from 'xstate';
import { INITIAL_STATE, INITIAL_FRONT_DECK, INITIAL_SHIP, INITIAL_DECK } from './gameData';
import { hasFlippableCards, canFlipCard, checkVictory } from './gameRules';
import { shuffleDeck, movePlayer, flipCard, moveShip, updateLives, placeCard, placeShip } from './gameActions';
import { gameLogger } from './gameLogger';  
import { Position } from './PositionSystem';
import { ShipCard } from './gameData';

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
                                if (cardObj.direction && !context.shipCard?.direction) {
                                    const { shipCard, positionSystem: newPositionSystem } = placeShip(positionSystem, cardObj.direction);
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

                                // если карта с жизнями, то восстанавливается жизнь (только 1 раз при вскрытии)
                                if (card.lives > 0) {
                                    const { lives } = updateLives(context.lives, card.lives);
                                    newContext = { ...newContext, lives };
                                }

                                // Обработка эффекта mirage
                                if (card.id === 'mirage') {
                                    const farthestPos = context.positionSystem.findFarthestPosition(context.playerPosition!);

                                    if (farthestPos) {
                                        context.positionSystem.swapPositions(context.playerPosition!, farthestPos);

                                        const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'mirage');
                                        context.positionSystem.setPosition(farthestPos, frontCard!);
                                    }
                                    newContext = {
                                        ...newContext,
                                        positionSystem: context.positionSystem
                                    };
                                }

                                // Обработка эффекта пиратов
                                if (card.id === 'pirates' && context.shipCard && !context.shipCard?.skipMove) {
                                    context.positionSystem.removePosition(context.shipCard.position);
                                    const frontCard = INITIAL_FRONT_DECK.find(c => c.backId === 'pirates');
                                    context.positionSystem.setPosition(context.playerPosition!, frontCard!);
                                    newContext = {
                                        ...newContext,
                                        positionSystem: context.positionSystem,
                                        shipCard: { ...INITIAL_SHIP } as ShipCard
                                    };
                                }

                                if (card.lives < 0) {
                                    // Check if there's protection from negative effects
                                    const isProtected = context.positionSystem.findCardById('spear') && card.id === 'pig' 
                                        || context.positionSystem.findCardById('shelter') && card.id === 'storm';

                                    if (!isProtected) {
                                        const { lives } = updateLives(context.lives, card.lives);
                                        newContext = { ...newContext, lives };
                                    }
                                }

                                // Проверяем шторм при размещении 13-й карты
                                if (context.positionSystem.countNonShipCards() === 13) {
                                    const stormPos = context.positionSystem.findCardById('storm')?.position;
                                    if (stormPos) {
                                        gameLogger.info('Шторм найден на позиции', { stormPos });
                                        const { positionSystem } = flipCard(newContext, stormPos);
                                        newContext = { ...newContext, positionSystem };
                                    }
                                }

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
                            300: [
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
                                    assign(({ context, event }) => 
                                        flipCard(context, new Position(event.row, event.col))
                                    ),
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

                                // Обновляем жизни при перевороте карты
                                if (card.lives > 0) {
                                    const { lives } = updateLives(context.lives, card.lives);
                                    newContext = { ...newContext, lives };
                                }

                                // Если это tornado, то переворачиваем обратно
                                if (context.positionSystem.countNonShipCards() === 13 && card.id === 'tornado') {
                                    context.positionSystem.setPosition(context.playerPosition!, INITIAL_DECK.find(c => c.backId === card.id)!);

                                    // А также переворачивает обратно shelter и lit beacon
                                    const shelterResult = context.positionSystem.findCardById('shelter');
                                    const litBeaconResult = context.positionSystem.findCardById('lit-beacon');
                                    if (shelterResult) {
                                        context.positionSystem.setPosition(shelterResult.position, INITIAL_DECK.find(card => card.id === 'vines')!);
                                    }
                                    if (litBeaconResult) {
                                        context.positionSystem.setPosition(litBeaconResult.position, INITIAL_DECK.find(card => card.id === 'higher-ground')!);
                                    }
                                }

                                // Если это одна из карт сокровищ, переворачиваем обе
                                if (card.backId === 'map-r' || card.backId === 'map-c') {
                                    // Находим и переворачиваем вторую карту сокровищ
                                    const otherMapId = card.backId === 'map-r' ? 'map-c' : 'map-r';
                                    const otherMapResult = context.positionSystem.findCardById(otherMapId);
                                    const otherFrontCard = INITIAL_FRONT_DECK.find(card => card.backId === otherMapId);
                                    context.positionSystem.setPosition(otherMapResult!.position, otherFrontCard!);

                                    // Увеличиваем количество жизней на 1 - эффект rum
                                    const { lives } = updateLives(newContext.lives, 1);
                                    newContext = { ...newContext, lives };
                                }

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
                            assign(({ context }) => {
                                let newContext = { ...context };

                                // Проверяем эффект sea-serpent
                                if (!context.shipCard?.position) return newContext;
                                const adjacentPositions = context.positionSystem.getAdjacentPositions(context.shipCard!.position);
                                const hasSeaSerpent = adjacentPositions.some(adjPos => {
                                    const card = context.positionSystem.getPosition(adjPos);
                                    return card && card.id === 'sea-serpent';
                                });

                                if (hasSeaSerpent && context.shipCard?.cornerManager) {
                                    const extraPosition = context.shipCard.cornerManager.getNextShipPosition(
                                        context.shipCard!.position!, 
                                        context.shipCard!.direction!
                                    );
                                    const extraShipCard = {
                                        ...context.shipCard,
                                        position: extraPosition
                                    };

                                    context.positionSystem.swapPositions(context.shipCard!.position!, extraPosition);
                                    newContext = {
                                        ...newContext,
                                        shipCard: extraShipCard,
                                        positionSystem: context.positionSystem
                                    };
                                }

                                return newContext;
                            })
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