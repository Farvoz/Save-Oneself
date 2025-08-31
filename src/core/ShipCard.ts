import { GameCard, CardSide, Direction, CardType } from "./Card";
import { ShipCornerManager } from "./ShipCornerManager";

export class ShipCard extends GameCard {
    cornerManager: ShipCornerManager;
    direction: Direction;
    private _skipMove: boolean;
    private _hasTurned: boolean;

    constructor(frontSide: CardSide, direction: Direction, cornerManager: ShipCornerManager) {
        super(frontSide, frontSide);
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

    getCurrentType(): CardType {
        return 'ship';
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
