// Дефолтные моки для тестов

import { Position, PositionSystem, ShipCard, GameContext } from '../core';
import { ShipCornerManager } from '../core/ShipCornerManager';

// Функция для получения мока корабля
export function getMockShip() {
    return {
        id: 'ship',
        direction: 'NW' as const,
        type: 'ship' as const,
        emoji: '⛵',
        description: 'Ship card'
    };
}

// Функция для получения мок-границ острова
export function getMockBounds() {
    return {
        minRow: 1,
        maxRow: 2,
        minCol: 1,
        maxCol: 2
    };
}

// Функция для получения мок-корабля
export function getMockShipCard(
    direction: 'NE' | 'NW' | 'SE' | 'SW' = 'NW',
    bounds = getMockBounds(),
    ship = getMockShip()
) {
    return new ShipCard(
        ship,
        new ShipCornerManager(direction, bounds)
    );
}

// Функция для получения мок PositionSystem с кораблём на стартовой позиции
export function getMockPositionSystem(
    shipCard = getMockShipCard(),
) {
    const positionSystem = new PositionSystem();
    positionSystem.setPosition(
        shipCard.cornerManager.getStartShipPosition(),
        shipCard
    );
    return positionSystem;
}

// Функция для получения мок GameContext
export function getMockContext({
    playerPosition = new Position(0, 0),
    hasPlacedCard = false,
    lives = 3,
    positionSystem = getMockPositionSystem(),
    hasMoved = false,
    gameOverMessage = null,
    isVictory = false,
    deck = [],
    movesLeft = 1,
    showStartTooltip = false
}: Partial<GameContext> = {}): GameContext {
    return {
        playerPosition,
        hasPlacedCard,
        lives,
        positionSystem,
        hasMoved,
        gameOverMessage,
        isVictory,
        deck,
        movesLeft,
        showStartTooltip
    };
}
