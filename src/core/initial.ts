import { StateFrom } from 'xstate';
import { createGameStateMachine } from './gameStateMachine';
import { PositionSystem, Position } from './PositionSystem';
import { CARD_DATA } from './cardData';
import { GameCard, CardSide } from './Card';
import { Inventory } from './Inventory';

export { CARD_DATA };

export type GameContext = {
    lives: number;
    deck: GameCard[];
    positionSystem: PositionSystem;
    hasPlacedCard: boolean;
    hasMoved: boolean;
    movesLeft: number;
    gameOverMessage: string | null;
    isVictory: boolean;
    playerPosition?: Position;
    showStartTooltip: boolean;
    inventory: Inventory;
};

export type GameEvent =
    | { type: 'MOVE_PLAYER'; row: number; col: number }
    | { type: 'ACTIVATE_CARD'; row: number; col: number }
    | { type: 'SKIP_PHASE' }
    | { type: 'SKIP_MOVES' };

export type GameState = StateFrom<typeof createGameStateMachine>;

// Create arrays of back and front cards from the data
export const BACK_CARDS: CardSide[] = Object.values(CARD_DATA).map(card => card.back);

// Create the initial deck of GameCards
export const INITIAL_GAME_DECK: GameCard[] = Object.values(CARD_DATA).map(card => 
    new GameCard(card.back, card.front)
);

export const INITIAL_STATE: GameContext = {
    lives: 16,
    deck: INITIAL_GAME_DECK,
    positionSystem: new PositionSystem(),
    gameOverMessage: null,
    isVictory: false,
    hasPlacedCard: false,
    movesLeft: 0,
    hasMoved: false,
    showStartTooltip: true,
    inventory: Inventory.empty()
}; 