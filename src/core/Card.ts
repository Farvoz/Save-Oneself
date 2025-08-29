import { ShipCornerManager } from "./ShipCornerManager";
import { Position } from "./PositionSystem";
import type { GameContext, GameEvent } from "./gameData";

export type Direction = 'NE' | 'SE' | 'SW' | 'NW';

export type CardType = 'back' | 'front' | 'ship';

export type CardSide = {
    id: string;
    lives?: number;
    direction?: Direction;
    requirements?: string;
    type: CardType;
    emoji: string;
    description?: string;
    score?: number;
    skipMove?: boolean;
    hasTurned?: boolean;
    cornerManager?: ShipCornerManager;
    getEmoji?: () => string;
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
};

export class GameCard {
    protected backSide: CardSide;
    protected frontSide: CardSide;
    private isFlipped: boolean;

    constructor(backSide: CardSide, frontSide: CardSide) {
        this.backSide = backSide;
        this.frontSide = frontSide;
        this.isFlipped = false;
    }

    flip(context: GameContext) {
        this.isFlipped = !this.isFlipped;
        
        // Если передан контекст, вызываем обработчик onFlip
        if (context) {
            const side = this.getCurrentSide();
            if (side && typeof side.onFlip === 'function') {
                return side.onFlip(context);
            }
        }

        return context;
    }

    getCurrentSide(): CardSide {
        return this.isFlipped ? this.frontSide : this.backSide;
    }

    getRequirements(): string | undefined {
        return this.backSide.requirements;
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
}

export class ShipCard extends GameCard {
    position: Position;
    cornerManager: ShipCornerManager;
    direction: Direction;
    private _skipMove: boolean;
    private _hasTurned: boolean;

    constructor(frontSide: CardSide, direction: Direction, position: Position, cornerManager: ShipCornerManager) {
        super(frontSide, frontSide);
        this.position = position;
        this.cornerManager = cornerManager;
        this._skipMove = true;
        this._hasTurned = false;
        this.direction = direction;
    }

    static getArrows(direction: Direction): string {
        const arrows = {
            'NE': '⬇️',
            'SE': '⬅️', 
            'SW': '⬆️',
            'NW': '➡️'
        };
        return arrows[direction];
    }

    getEmoji(): string {
        return `⛵${ShipCard.getArrows(this.direction)}`;
    }

    getCurrentDirection(): Direction {
        return this.direction;
    }

    get skipMove(): boolean {
        return this._skipMove;
    }

    set skipMove(value: boolean) {
        this._skipMove = value;
    }

    get hasTurned(): boolean {
        return this._hasTurned;
    }

    set hasTurned(value: boolean) {
        this._hasTurned = value;
    }
}
