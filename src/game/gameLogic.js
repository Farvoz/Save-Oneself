class GameLogic {
    constructor() {
        this.deck = [
            { lives: 0, direction: 'NE', id: 'hook', requirements: 'water', type: 'back', emoji: '🎣' },
            { lives: 2, direction: '', id: 'water', requirements: 'telescope', type: 'back', emoji: '💧' },
            { lives: 0, direction: '', id: 'flint', requirements: 'vines', type: 'back', emoji: '⚡' },
            { lives: 0, direction: 'SW', id: 'vines', requirements: 'palm-trees', type: 'back', emoji: '🌿' },
            { lives: 0, direction: 'SE', id: 'palm-trees', requirements: 'rocks', type: 'back', emoji: '🌴' },
            { lives: 0, direction: 'NW', id: 'sticks', requirements: 'flint', type: 'back', emoji: '🥢' },
            { lives: 0, direction: '', id: 'telescope', requirements: 'higher-ground', type: 'back', emoji: '🔭' },
            { lives: 0, direction: '', id: 'rocks', requirements: 'higher-ground', type: 'back', emoji: '🧱' },
            { lives: 0, direction: '', id: 'higher-ground', requirements: 'torch', type: 'back', emoji: '⛰️' },
            { lives: 0, direction: '', id: 'bottle', requirements: '_ship-set-sail', type: 'back', emoji: '🍾' },
        ];

        this.frontDeck = [
            { lives: 3, backId: 'hook', id: 'fish', type: 'front', emoji: '🐟' },
            { lives: 2, backId: 'water', id: 'waterfall', type: 'front', emoji: '🌊' },
            { lives: 0, backId: 'flint', id: 'torch', type: 'front', emoji: '🔥' },
            { lives: 2, backId: 'palm-trees', id: 'coconuts', type: 'front', emoji: '🥥' },
            { lives: 0, backId: 'sticks', id: 'spear', type: 'front', emoji: '🗡️' },
            { lives: 2, backId: 'vines', id: 'shelter', type: 'front', emoji: '🏠' },
            { lives: 0, backId: 'telescope', id: 'ship-sighted', type: 'front', emoji: '🚢' },
            { lives: 0, backId: 'rocks', id: 'sos', type: 'front', emoji: '🆘' },
            { lives: 0, backId: 'higher-ground', id: 'lit-beacon', type: 'front', emoji: '🔥' },
            { lives: 0, backId: 'bottle', id: 'message', type: 'front', emoji: '📜' },
        ];

        this.shipCard = {
            type: 'ship',
            lives: 0,
            direction: undefined,
            id: 'ship',
            requirements: '',
            position: undefined,
            skipMove: true,
            moves: 0,
            emoji: '⛵'
        };

        // Game state
        this.lives = 16;
        this.occupiedPositions = new Map();
        this.playerPosition = null;
        this.currentPhase = 1;
        this.isPhaseTransitioning = false;
        this.selectedPosition = null;

        // Event emitter for game state changes
        this.events = new EventTarget();
    }

    // Add a new method to start the game
    startGame() {
        this.initializeGame();
    }

    initializeGame() {
        this.deck.sort(() => Math.random() - 0.5);
        this.placeCard(0, 0);
        this.playerPosition = '0,0';
        this.currentPhase = 1;
        this.isPhaseTransitioning = false;
        
        // Emit initial state
        const gameState = {
            lives: this.lives,
            deckLength: this.deck.length,
            playerPosition: this.playerPosition,
            currentPhase: this.currentPhase,
            occupiedPositions: Array.from(this.occupiedPositions.entries())
        };
        
        this.events.dispatchEvent(new CustomEvent('gameStateChanged', {
            detail: gameState
        }));
    }

    // Card placement and movement
    placeCard(row, col) {
        if (this.currentPhase !== 1 || !this.isValidPosition(row, col)) {
            return false;
        }

        if (this.occupiedPositions.has(`${row},${col}`)) {
            return this.movePlayer(row, col);
        }

        const cardObj = this.deck[this.deck.length - 1];
        this.lives = Math.min(16, this.lives + cardObj.lives);
        this.deck.pop();
        
        this.occupiedPositions.set(`${row},${col}`, cardObj);
        
        if (cardObj.direction && ['NW', 'NE', 'SW', 'SE'].includes(cardObj.direction) && !this.shipCard.direction) {
            this.placeShip(cardObj.direction);
        }

        this.movePlayer(row, col);

        // Emit state change
        this.events.dispatchEvent(new CustomEvent('cardPlaced', {
            detail: {
                row,
                col,
                card: cardObj,
                lives: this.lives,
                deckLength: this.deck.length,
                occupiedPositions: Array.from(this.occupiedPositions.entries())
            }
        }));

        return true;
    }

    // Ship management
    placeShip(direction) {
        if (this.shipCard.direction === direction) return;

        let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
        let shipRow, shipCol;

        const cardPositions = Array.from(this.occupiedPositions.entries())
            .filter(([_, card]) => card !== this.shipCard)
            .map(([pos]) => pos.split(',').map(Number));

        if (cardPositions.length === 0) return;

        cardPositions.forEach(([row, col]) => {
            minRow = Math.min(minRow, row);
            maxRow = Math.max(maxRow, row);
            minCol = Math.min(minCol, col);
            maxCol = Math.max(maxCol, col);
        });

        switch(direction) {
            case 'NW':
                shipRow = minRow - 1;
                shipCol = minCol - 1;
                break;
            case 'NE':
                shipRow = minRow - 1;
                shipCol = maxCol + 1;
                break;
            case 'SW':
                shipRow = maxRow + 1;
                shipCol = minCol - 1;
                break;
            case 'SE':
                shipRow = maxRow + 1;
                shipCol = maxCol + 1;
                break;
        }

        this.shipCard.direction = direction;
        this.shipCard.position = `${shipRow},${shipCol}`;

        // Emit ship placed event
        this.events.dispatchEvent(new CustomEvent('shipPlaced', {
            detail: {
                row: shipRow,
                col: shipCol,
                shipCard: this.shipCard
            }
        }));
    }

    // Game phase management
    nextPhase() {
        if (this.isPhaseTransitioning) return;
        
        this.isPhaseTransitioning = true;
        this.currentPhase = this.currentPhase % 4 + 1;

        const gameState = {
            lives: this.lives,
            deckLength: this.deck.length,
            playerPosition: this.playerPosition,
            currentPhase: this.currentPhase,
            occupiedPositions: Array.from(this.occupiedPositions.entries())
        };

        // Emit phase change
        this.events.dispatchEvent(new CustomEvent('phaseChanged', {
            detail: {
                phase: this.currentPhase,
                isTransitioning: this.isPhaseTransitioning
            }
        }));

        this.events.dispatchEvent(new CustomEvent('gameStateChanged', {
            detail: gameState
        }));

        if (this.currentPhase === 2) {
            this.decreaseLives();
            setTimeout(() => {
                this.currentPhase = 3;
                this.isPhaseTransitioning = false;
                const newGameState = {
                    lives: this.lives,
                    deckLength: this.deck.length,
                    playerPosition: this.playerPosition,
                    currentPhase: this.currentPhase,
                    occupiedPositions: Array.from(this.occupiedPositions.entries())
                };
                
                this.events.dispatchEvent(new CustomEvent('phaseChanged', {
                    detail: {
                        phase: this.currentPhase,
                        isTransitioning: this.isPhaseTransitioning
                    }
                }));
                
                this.events.dispatchEvent(new CustomEvent('gameStateChanged', {
                    detail: newGameState
                }));
            }, 500);
        } else if (this.currentPhase === 4) {
            this.tryMoveShip();
            setTimeout(() => {
                this.currentPhase = 1;
                this.isPhaseTransitioning = false;
                const newGameState = {
                    lives: this.lives,
                    deckLength: this.deck.length,
                    playerPosition: this.playerPosition,
                    currentPhase: this.currentPhase,
                    occupiedPositions: Array.from(this.occupiedPositions.entries())
                };
                
                this.events.dispatchEvent(new CustomEvent('phaseChanged', {
                    detail: {
                        phase: this.currentPhase,
                        isTransitioning: this.isPhaseTransitioning
                    }
                }));
                
                this.events.dispatchEvent(new CustomEvent('gameStateChanged', {
                    detail: newGameState
                }));
            }, 1000);
        } else {
            this.isPhaseTransitioning = false;
        }
    }

    // Card flipping
    canFlipCard(cardObj) {
        if (cardObj.type === 'front') return false;
        
        if (cardObj.requirements) {
            if (cardObj.requirements === '_ship-set-sail') {
                return this.shipCard.direction !== undefined && this.shipCard.skipMove;
            }
            
            for (const [_, card] of this.occupiedPositions) {
                if (card.id === cardObj.requirements) {
                    return true;
                }
            }
            return false;
        }
        
        return true;
    }

    tryFlipCard(row, col) {
        if (this.currentPhase !== 3) return false;
        
        const cardObj = this.occupiedPositions.get(`${row},${col}`);
        if (!cardObj || !this.canFlipCard(cardObj)) return false;

        const frontCard = this.frontDeck.find(card => card.backId === cardObj.id);
        if (!frontCard) return false;

        Object.assign(cardObj, {
            type: frontCard.type,
            id: frontCard.id,
            lives: frontCard.lives,
            emoji: frontCard.emoji
        });
        delete cardObj.requirements;
        delete cardObj.direction;

        // Emit card flipped event
        this.events.dispatchEvent(new CustomEvent('cardFlipped', {
            detail: {
                row,
                col,
                card: cardObj
            }
        }));

        return true;
    }

    // Victory and game end conditions
    checkVictory() {
        let sosPosition = null;
        let beaconPosition = null;
        
        for (const [pos, card] of this.occupiedPositions) {
            if (card.type === 'front') {
                if (card.id === 'sos') {
                    sosPosition = pos.split(',').map(Number);
                } else if (card.id === 'lit-beacon') {
                    beaconPosition = pos.split(',').map(Number);
                }
            }
        }
        
        if (!this.shipCard.position || !this.shipCard.skipMove) return false;
        
        const [shipRow, shipCol] = this.shipCard.position.split(',').map(Number);
        const sosVictory = sosPosition && shipRow === sosPosition[0];
        const beaconVictory = beaconPosition && shipCol === beaconPosition[1];
        
        return sosVictory || beaconVictory;
    }

    // Utility functions
    isValidPosition(row, col) {
        if (row < -3 || row > 3 || col < -3 || col > 3) return false;
        if (Math.abs(row) === 3 && Math.abs(col) === 3) return false;
        
        if (!this.hasMaxRowsOrColumns(row, col)) return false;

        if (this.playerPosition) {
            const [currentRow, currentCol] = this.playerPosition.split(',').map(Number);
            const isAdjacent = Math.abs(row - currentRow) + Math.abs(col - currentCol) === 1;
            if (!isAdjacent) return false;
        }
        
        if (this.shipCard.direction) {
            let minRow = 3, maxRow = -3, minCol = 3, maxCol = -3;
            this.occupiedPositions.forEach((card, pos) => {
                if (card.id === 'ship') return;
                const [cardRow, cardCol] = pos.split(',').map(Number);
                minRow = Math.min(minRow, cardRow);
                maxRow = Math.max(maxRow, cardRow);
                minCol = Math.min(minCol, cardCol);
                maxCol = Math.max(maxCol, cardCol);
            });

            switch(this.shipCard.direction) {
                case 'NE':
                    if (row < minRow || col > maxCol) return false;
                    break;
                case 'SE':
                    if (row > maxRow || col > maxCol) return false;
                    break;
                case 'SW':
                    if (row > maxRow || col < minCol) return false;
                    break;
                case 'NW':
                    if (row < minRow || col < minCol) return false;
                    break;
            }
        }
        
        return true;
    }

    hasMaxRowsOrColumns(row, col) {
        const positions = Array.from(this.occupiedPositions.entries())
            .filter(([_, card]) => card !== this.shipCard)
            .map(([pos]) => pos.split(',').map(Number));
        positions.push([row, col]);
        
        const uniqueRows = [...new Set(positions.map(pos => pos[0]))];
        const uniqueCols = [...new Set(positions.map(pos => pos[1]))];
        
        return uniqueRows.length <= 4 && uniqueCols.length <= 4;
    }

    // Movement handling
    movePlayer(row, col) {
        if (row < -3 || row > 3 || col < -3 || col > 3) {
            return false;
        }

        if (this.playerPosition) {
            const [currentRow, currentCol] = this.playerPosition.split(',').map(Number);
            const isAdjacent = Math.abs(row - currentRow) + Math.abs(col - currentCol) === 1;
            if (!isAdjacent) {
                return false;
            }
        }
        
        this.playerPosition = `${row},${col}`;
        
        // Emit player moved event
        this.events.dispatchEvent(new CustomEvent('playerMoved', {
            detail: {
                row,
                col,
                playerPosition: this.playerPosition
            }
        }));
        
        return true;
    }
}
