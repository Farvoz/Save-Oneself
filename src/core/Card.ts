import type { GameContext, GameEvent } from "./initial";
import { InventoryItem } from "./Inventory";

export type Direction = 'NE' | 'SE' | 'SW' | 'NW';

export type CardType = 'back' | 'front' | 'ship';

const createStubCardSide = (): CardSide => {
    return {
        id: 'stub' + Math.random().toString(36).substring(2, 15),
        type: 'back',
        emoji: '...',
        clickable: false // Заглушки не должны реагировать на клики
    };
};

export type CardSide = {
    id: string;
    russianName?: string;
    lives?: number;
    direction?: Direction;
    requirements?: string;
    requirementsText?: string;
    type: CardType;
    emoji: string;
    description?: string;
    score?: number;
    /**
     * Добавлять ли карту в инвентарь при размещении на поле
     */
    addToInventory?: boolean;
    /**
     * Определяет, должна ли карта реагировать на клики
     */
    clickable?: boolean;
    /**
     * Проверяет, можно ли перевернуть карту
     */
    canActivate?: (context: GameContext) => boolean;
    /**
     * Вызывается при начале раунда
     */
    onRoundStart?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается при размещении карты на поле
     */
    onPlace?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается после размещения карты на поле
     */
    afterPlace?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается перед движением корабля
     */
    onBeforeShipMove?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается при движении корабля
     */
    onShipMove?: (context: GameContext, event?: GameEvent) => GameContext;
};

export class GameCard {
    backSide: CardSide;
    frontSide: CardSide;
    stubSide: CardSide;
    private isFlipped: boolean;
    private isInInventory: boolean;

    constructor(backSide: CardSide, frontSide: CardSide) {
        this.backSide = backSide;
        this.frontSide = frontSide;
        this.isFlipped = false;
        this.isInInventory = false;
        this.stubSide = createStubCardSide();
    }

    flip(context: GameContext) {
        this.isFlipped = !this.isFlipped;
        
        let newContext = context;
        const side = this.getCurrentSide();
        if (typeof side.onPlace === 'function') {
            newContext = side.onPlace(newContext);
        }

        return { ...newContext };
    }

    /**
     * Создаёт элемент инвентаря из текущей стороны карты
     */
    createInventoryItem(): InventoryItem {
        this.isInInventory = true;

        return new InventoryItem(this.backSide, this.frontSide);
    }

    /**
     * Проверяет, должна ли карта добавляться в инвентарь при размещении
     */
    shouldAddToInventory(): boolean {
        const currentSide = this.getCurrentSide();
        return Boolean(currentSide.addToInventory);
    }

    getCurrentSide(): CardSide {
        return this.isInInventory ? this.stubSide : this.isFlipped ? this.frontSide : this.backSide;
    }

    getRequirements(): string | undefined {
        return this.getCurrentSide().requirements;
    }

    getRequirementsText(): string | undefined {
        return this.getCurrentSide().requirementsText;
    }

    getCurrentId(): string {
        return this.getCurrentSide().id;
    }

    getCurrentEmoji(): string {
        return this.getCurrentSide().emoji;
    }

    getCurrentLives(): number {
        return this.getCurrentSide().lives || 0;
    }

    getCurrentType(): CardType {
        return this.getCurrentSide().type;
    }

    getCurrentDirection(): Direction | undefined {
        return this.backSide.direction;
    }

    getCurrentDescription(): string | undefined {
        return this.getCurrentSide().description;
    }

    getCurrentRussianName(): string | undefined {
        return this.getCurrentSide().russianName;
    }

    getCurrentScore(): number | undefined {
        return this.getCurrentSide().score;
    }

    /**
     * Проверяет, должна ли карта реагировать на клики
     */
    isClickable(): boolean {
        const currentSide = this.getCurrentSide();
        // По умолчанию карты кликабельны, если не указано обратное
        return currentSide.clickable !== false;
    }

    /**
     * Проверяет, можно ли перевернуть карту
     */
    canActivate(context: GameContext): boolean {
        if (this.isFlipped || this.isInInventory) return false;
        
        // Если есть кастомная логика, используем её
        if (this.backSide.canActivate) {
            return this.backSide.canActivate(context);
        }
        
        const requirements = this.getRequirements();
        if (!requirements) return false;
        
        // Проверяем базовые требования (карты на поле)
        return context.positionSystem.findCardById(requirements) !== null;
    }
}


