import { createMachine, assign } from 'xstate';
import { INITIAL_STATE } from './gameData';
import { hasFlippableCards, checkVictory, checkDefeat } from './gameRules';
import { shuffleDeck, movePlayer, moveShip, updateLives, placeCard, placeShip } from './gameActions';
import { gameLogger } from './gameLogger';  
import { Position } from './PositionSystem';
import type { GameContext } from './gameData';
import type { CardSide } from './Card';

export const createGameStateMachine = () => {
    return createMachine({
        /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswDoAOAbFAngJYB2UmsALigE6UDyAZgEoD2AriRAMQDaADAF1EobK1hFKRViREgAHogBMAVgDsAFkwBOJQEYAbAA41ag2pUajKgDQgCia-x0BmMxrUujL-toN6AXwC7VAwcfGIyTDRWADdSKG4AWXoANQBRAH0ABQAZAEEATXTmAWEkEDEJKRk5RQQlXTVMAysNDRUXbV8VJTsHBCMlJRaers7+DxcDIJD0LDxCBOi4hO4AZQBpAElszJSM9bK5KslpWQr61U0dfWNTc0trfsRtIcx9PS-+FyUjI34jVmIFCCwiywAxgALMAQgDWCQAwrQINl8BCwBgSJRuPIqChKFgUIxCTQABT8ACU3FB4SWUWhsIRZGRNFR6MxYGxxwqpxqF1A9RcwpGejUSn4am6LnU2g0LwQmi0el+2h8w38ejlwNpi0i5EZ8KRKLRKAxWJxeOohMwxNJFOpuvBDJhRpZJo5Ft4enKonEZ1ql0Qwt+mDFEqlP1l8vsjjcmBURgM-GTuiUBjcLh18zp+swhuZUFZ7LNnOxuPxNrtYHJVJpOb1kNdheLpvNXMovCUvsq-v5dWDIrD4sl0ujCr0-B+mBceiUHR+Rg8GmF2bCjaiiwhxrZ+S46yhRGwFetRJJNYd9fXzvIW53ED3EAPR55fuq5wHCC80960wBBhUfwujUBUk2cQD00nDM-F6FQ1zBekDWbe90kYRhYUoWATwJM97TrJ1EPzZD3TZVD0IhTDX17d9A0FYMARcBMlDcPQlyUUxAInRoRlafhvG0FV1DUQx4NzJsmQSJI4jAZg4HYXBLUrXCL3whsbyIiSyCk2IZLkhSqL5D8gwaXQEwMVRJQBDQ5xA2MGnnTAp34ScXDaIYVxmYIQTUwiC0k6TZNgeTFNPW1z1rR0fLzPytICvTOx9E4+yMuiTJGCCVEsyYbInGzMBXdxrHY9MNG0USNyQzSoG03SgoU7Cq3Cy8COi4jqriurO27JKaIFBRlFMjKsus9iFX8FQZ3nZNNGc8U53K9SIFhGgwBQCQyFyIgdKwq0cLCvDIuvQilohFa1oSTbtoM5LaP6xVWLDZyVEsczzJlGMBmmAwPnTAxjG8HwAbgryWuWE6zvWqBLrgBrlIiq8ELzcHVsh6HYG9HtDNu+phKMR69GejRXuYywFVlMM3n4dQk2E6yNAW47lpRi6tph3bGoOhGxKiZHzo21n0e63kbr6nGHsnAmXvTEmPscd5mI6NRfCV8UBIZ1qqoAMVwI9sBQAAjXAwG4TXcl2TJEXyZgABFrt6z8vg0dKiYsSU1H+Mn1EwKyzH46xek8uYjo1t0oG13WDaNjYdj2bIAAl8nWdI7YDUXEEd53Hjdj27NpxzZ3aXpvAzdR1fE0Pw+wMiMJ2pT9pUw7EfLwtK+rij0aEHrU4dyxtEcl7AT8XRANlhAVG0CaLClbpx+svwsxBqLllgQ9sG0tZ2bhslMtU4Pl9X9eyBT-tjNYrxHIJroZVlfRbIGZM9B0FNpisUwwOBoOm6iFej0PxJN-ruSHejdubkB-mvVYR9ErC3tqfbweMnpX2elKW+ZM+L5U6ArViKonauTLt-A+kD-512rEAqcICKoUEIfEI+Qs3zdzgefRBapkG6DFKBTKrh3CeG8L4fw+DKqh2fFXNCNdYaAOakvF0VVhFt0op3GBDDUrDAnjoaafFfh8UBBw5wapTAqPTL8awQQvIkFYEteAFRQRdxPqlAAtPOBUDj6aLz3mQGxKU7qOLshmBMU4vgSngUMUwAiKDUDoEwNgnAIAeOxsoayE0-BFVcomFcMpQIqnym4P6XR0wqEMIHbybjyAxBoVAWJacGgAjxq0JcrkjAEyJiqDhfcIIGG0NoKe7s8GuK-oIlsHpSwWgqZ+WcU5HLMXMqofQwSWlmVUFYcwKpWIfyKX0uk24SIPn3KvEZxlpjjMBNMTwkpmLvVAtMRy5lhK+CGOoIEvTQEaVDsWORlj6G2LulfRinQ9ClVlG4YSd9HBewKuPQGMpASBEeZQmK7UdKBWCns1K4oxoSmHB0VMnR1SFNBjzJmfMoYC2RXdCY+U-kSyXCmYwtg7JCW9lNZicp8nWSMKEuFlc9aGzACS+oE9EkTE8F8Ce7QXBjWchiywgECZDFUOytqrdRHt15enGUj8ZkZgaYCay5gybCQ+NTVoPhNBagXp-J54C-4qoQIYKUVzmIMRlOxLUZMTAziGGqL4XhGi4qkf0hIsilWYWtRKAS3tpQmBcs5IwoF0xZNMB4cUD8AKhNBPQHSNBrUHOcEc8wxqzmkzsumHN48Ok0uqb4ExAQgA */
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
                                // Вызов обработчика onPlace только для текущей карты
                                return applyCardHandlerForCurrentCard(context, 'onPlace', context.playerPosition!);
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
                                    return Boolean(card && card.canFlip(context));
                                },
                                actions: [
                                    assign(({ context, event }) => {
                                        const card = context.positionSystem.getPosition(new Position(event.row, event.col));
                                        return card ? card.flip(context) : context;
                                    }),
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
                            assign(({ context }) => {
                                // Проверяем, можно ли двигать корабль
                                if (!context.shipCard?.position || !context.shipCard?.getCurrentDirection()) {
                                    return context;
                                }

                                // Если корабль должен пропустить ход, просто сбрасываем флаг
                                if (context.shipCard.skipMove) {
                                    context.shipCard.skipMove = false;
                                    return context;
                                }

                                // Применяем эффекты перед движением корабля (например, телескоп)
                                const contextWithEffects = applyCardHandlers(context, 'onBeforeShipMove');
                                
                                // Двигаем корабль
                                return moveShip(contextWithEffects);
                            }),
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
                                    guard: ({ context }) => checkDefeat(context),
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