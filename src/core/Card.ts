import type { GameContext, GameEvent } from "./initial";

export type Direction = 'NE' | 'SE' | 'SW' | 'NW';

export type CardType = 'back' | 'front' | 'ship';

export type CardSide = {
    id: string;
    lives?: number;
    direction?: Direction;
    requirements?: string;
    requirementsText?: string;
    type: CardType;
    emoji: string;
    description?: string;
    score?: number;
    /**
     * Вызывается при размещении карты на поле
     */
    onPlace?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается при перевороте карты
     */
    onFlip?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается перед движением корабля
     */
    onBeforeShipMove?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается при движении корабля
     */
    onShipMove?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Вызывается при начале раунда
     */
    onRoundStart?: (context: GameContext, event?: GameEvent) => GameContext;
    /**
     * Проверяет, можно ли перевернуть карту
     */
    canFlip?: (context: GameContext) => boolean;
};

export class GameCard {
    backSide: CardSide;
    frontSide: CardSide;
    private isFlipped: boolean;

    constructor(backSide: CardSide, frontSide: CardSide) {
        this.backSide = backSide;
        this.frontSide = frontSide;
        this.isFlipped = false;
    }

    flip(context: GameContext) {
        this.isFlipped = !this.isFlipped;
        
        const side = this.getCurrentSide();
        if (side && typeof side.onFlip === 'function') {
            return side.onFlip(context);
        }

        return context;
    }

    getCurrentSide(): CardSide {
        return this.isFlipped ? this.frontSide : this.backSide;
    }

    getRequirements(): string | undefined {
        return this.backSide.requirements;
    }

    getRequirementsText(): string | undefined {
        return this.backSide.requirementsText;
    }

    getBackId(): string {
        return this.backSide.id;
    }

    getFrontId(): string {
        return this.frontSide.id;
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
        return this.getCurrentSide().direction;
    }

    getCurrentDescription(): string | undefined {
        return this.getCurrentSide().description;
    }

    getCurrentScore(): number | undefined {
        return this.getCurrentSide().score;
    }

    getCurrentBackId(): string {
        return this.backSide.id;
    }

    getCurrentFrontId(): string {
        return this.frontSide.id;
    }

    /**
     * Проверяет, можно ли перевернуть карту
     */
    canFlip(context: GameContext): boolean {
        if (this.getCurrentType() === 'front') return false;
        
        // Если есть кастомная логика, используем её
        if (this.backSide.canFlip) {
            return this.backSide.canFlip(context);
        }
        
        const requirements = this.getRequirements();
        if (!requirements) return false;
        
        // Проверяем базовые требования (карты на поле)
        return context.positionSystem.findCardById(requirements) !== null;
    }
}


