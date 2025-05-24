// UI Module for Marooned Game
class GameUI {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;

        // DOM Elements
        this.container = document.getElementById('game-container');
        this.livesCounter = document.getElementById('lives');
        this.cardsCounter = document.getElementById('cards-left');
        this.gameOverDiv = document.getElementById('game-over');
        this.gamePhaseDiv = document.getElementById('game-phase');
        this.phaseText = document.getElementById('phase-text');
        this.skipPhaseButton = document.getElementById('skip-phase');

        // Game state
        this.occupiedPositions = new Map();
        this.playerPosition = null;

        // Initialize event listeners
        this.createGrid();
        this.initializeEventListeners();
        this.subscribeToGameEvents();
    }

    subscribeToGameEvents() {
        // Subscribe to game state changes
        this.gameLogic.events.addEventListener('gameStateChanged', (e) => {
            const { lives, deckLength, playerPosition, currentPhase, occupiedPositions } = e.detail;
            this.updateGameState(lives, deckLength);
            this.playerPosition = playerPosition;
            this.occupiedPositions = new Map(occupiedPositions);
            this.updatePhaseDisplay(currentPhase);
            this.updateHighlights();
        });

        // Subscribe to card placement
        this.gameLogic.events.addEventListener('cardPlaced', (e) => {
            const { row, col, card, lives, deckLength } = e.detail;
            this.createCard(row, col, card);
            this.updateGameState(lives, deckLength);
            this.updateHighlights();
        });

        // Subscribe to ship placement
        this.gameLogic.events.addEventListener('shipPlaced', (e) => {
            const { row, col, shipCard } = e.detail;
            this.createCard(row, col, shipCard);
            this.updateHighlights();
        });

        // Subscribe to phase changes
        this.gameLogic.events.addEventListener('phaseChanged', (e) => {
            const { phase, isTransitioning } = e.detail;
            this.updatePhaseDisplay(phase);
            if (!isTransitioning) {
                this.updateHighlights();
            }
        });

        // Subscribe to card flipping
        this.gameLogic.events.addEventListener('cardFlipped', (e) => {
            const { row, col, card } = e.detail;
            const cardElement = document.querySelector(`.card[data-position="${row},${col}"]`);
            if (cardElement) {
                cardElement.innerHTML = '';
                const cardContent = this.createCardContent(card);
                cardElement.appendChild(cardContent);
                cardElement.style.backgroundColor = '#E8F5E9';
                cardElement.style.cursor = 'default';
            }
        });

        // Subscribe to player movement
        this.gameLogic.events.addEventListener('playerMoved', (e) => {
            const { playerPosition } = e.detail;
            this.playerPosition = playerPosition;
            this.updateHighlights();
        });
    }

    initializeEventListeners() {
        // Skip phase button handler
        this.skipPhaseButton.addEventListener('click', () => {
            if (this.gameLogic.currentPhase === 3 && !this.gameLogic.isPhaseTransitioning) {
                this.gameLogic.nextPhase();
            }
        });
    }

    // Grid creation and management
    createGrid() {
        // Сохраняем существующие карты
        const existingCards = new Map();
        document.querySelectorAll('.card').forEach(card => {
            const position = card.getAttribute('data-position');
            existingCards.set(position, card);
        });

        // Очищаем только клетки сетки, но не карты
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach(cell => cell.remove());
        
        // Создаем новые клетки
        for (let row = -3; row <= 3; row++) {
            for (let col = -3; col <= 3; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (Math.abs(row) === 3 || Math.abs(col) === 3) {
                    cell.classList.add('coordinate');
                    if (Math.abs(row) === 3 && Math.abs(col) === 3) {
                        cell.textContent = `${row},${col}`;
                    } else if (Math.abs(row) === 3) {
                        cell.textContent = col;
                    } else {
                        cell.textContent = row;
                    }
                }
                
                this.container.appendChild(cell);
            }
        }

        // Восстанавливаем карты на их позициях
        existingCards.forEach((card, position) => {
            this.container.appendChild(card);
        });
    }

    // Card management
    createCard(row, col, cardObj) {
        const coords = this.polarToCartesian(row, col);
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-position', `${row},${col}`);
        card.style.left = coords.x + 'px';
        card.style.top = coords.y + 'px';

        if (this.playerPosition === `${row},${col}`) {
            card.classList.add('player-position');
            const marker = document.createElement('div');
            marker.className = 'player-marker';
            marker.textContent = 'Игрок';
            card.appendChild(marker);
        }

        const cardContent = this.createCardContent(cardObj);
        card.appendChild(cardContent);

        // Set card background color based on type
        this.setCardBackground(card, cardObj);

        // Add click handlers for back cards
        if (cardObj.type === 'back' && this.gameLogic.currentPhase === 3) {
            this.addCardClickHandler(card, row, col);
        }

        this.container.appendChild(card);
        return card;
    }

    addCardClickHandler(card, row, col) {
        card.addEventListener('click', () => {
            if (this.gameLogic.currentPhase === 1) {
                this.gameLogic.placeCard(row, col);
            } else if (this.gameLogic.currentPhase === 3) {
                this.gameLogic.tryFlipCard(row, col);
            }
        });
    }

    createCardContent(cardObj) {
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        if (cardObj.lives > 0) {
            const livesDiv = document.createElement('div');
            livesDiv.className = 'card-lives';
            livesDiv.textContent = cardObj.lives;
            cardContent.appendChild(livesDiv);
        }

        if (cardObj.id) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'card-name';
            nameDiv.textContent = `${cardObj.emoji} ${cardObj.id}`;
            cardContent.appendChild(nameDiv);
        }

        if (cardObj.direction) {
            const directionDiv = document.createElement('div');
            directionDiv.className = 'card-direction';
            directionDiv.textContent = cardObj.direction;
            cardContent.appendChild(directionDiv);
        }

        if (cardObj.type === 'back' && cardObj.requirements) {
            const requirementsDiv = this.createRequirementsDiv(cardObj);
            cardContent.appendChild(requirementsDiv);
        }

        return cardContent;
    }

    createRequirementsDiv(cardObj) {
        const requirementsDiv = document.createElement('div');
        requirementsDiv.className = 'card-requirements';
        requirementsDiv.style.cssText = 'font-size: 10px; color: #666; font-style: italic; margin-top: 2px; margin-bottom: 4px; text-align: center;';

        let requirementsText = '';
        if (cardObj.requirements === '_ship-set-sail') {
            requirementsText = 'нужен корабль на паузе';
        } else {
            const requiredCard = [...this.gameLogic.deck, ...this.gameLogic.frontDeck].find(card => card.id === cardObj.requirements);
            const emoji = requiredCard ? requiredCard.emoji : '';
            requirementsText = `нужна ${emoji}`;
        }
        requirementsDiv.textContent = requirementsText;

        return requirementsDiv;
    }

    setCardBackground(card, cardObj) {
        if (cardObj === this.gameLogic.shipCard) {
            card.style.backgroundColor = '#87CEEB';
        } else if (cardObj.type === 'back') {
            card.style.backgroundColor = '#F5F5DC';
        } else if (cardObj.type === 'front') {
            card.style.backgroundColor = '#E8F5E9';
        }
    }

    // Highlight management
    updateHighlights() {
        this.clearHighlights();

        if (!this.playerPosition) return;

        this.updatePlayerMarker();

        if (this.gameLogic.currentPhase === 1) {
            this.showMovementHighlights();
        } else if (this.gameLogic.currentPhase === 3) {
            this.makeBackCardsClickable();
        }
    }

    clearHighlights() {
        document.querySelectorAll('.highlight, .player-marker').forEach(el => el.remove());
        document.querySelectorAll('.player-position').forEach(el => el.classList.remove('player-position'));
        document.querySelectorAll('.card').forEach(card => {
            card.style.cursor = 'default';
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });
    }

    updatePlayerMarker() {
        const currentCard = document.querySelector(`.card[data-position="${this.playerPosition}"]`);
        if (currentCard) {
            currentCard.classList.add('player-position');
            const marker = document.createElement('div');
            marker.className = 'player-marker';
            marker.textContent = 'Игрок';
            currentCard.appendChild(marker);
        }
    }

    showMovementHighlights() {
        const [row, col] = this.playerPosition.split(',').map(Number);
        const directions = [
            {dr: 0, dc: -1}, // left
            {dr: 0, dc: 1},  // right
            {dr: -1, dc: 0}, // top
            {dr: 1, dc: 0}   // bottom
        ];

        directions.forEach(({dr, dc}) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= -3 && newRow <= 3 && 
                newCol >= -3 && newCol <= 3 && 
                !(Math.abs(newRow) === 3 && Math.abs(newCol) === 3)) {
                
                const highlight = this.createHighlight(newRow, newCol);
                
                if (this.occupiedPositions.has(`${newRow},${newCol}`)) {
                    highlight.style.backgroundColor = 'rgba(255, 255, 243, 0.5)';
                    highlight.style.borderStyle = 'solid';
                }
            }
        });
    }

    createHighlight(row, col) {
        const coords = this.polarToCartesian(row, col);
        const highlight = document.createElement('div');
        highlight.className = 'highlight';
        highlight.style.left = coords.x + 'px';
        highlight.style.top = coords.y + 'px';
        
        highlight.addEventListener('click', () => this.handleHighlightClick(row, col));
        this.container.appendChild(highlight);
        return highlight;
    }

    handleHighlightClick(row, col) {
        if (this.gameLogic.currentPhase === 1) {
            this.gameLogic.placeCard(row, col);
        }
    }

    // Phase management
    updatePhaseDisplay(phase) {
        const phases = [
            'Фаза 1: Перемещение игрока',
            'Фаза 2: Уменьшение жизней',
            'Фаза 3: Переворот карты',
            'Фаза 4: Движение корабля'
        ];

        this.phaseText.textContent = phases[phase - 1];
        
        if (phase === 3) {
            this.skipPhaseButton.classList.add('visible');
            const hasCards = this.hasFlippableCards();
            this.skipPhaseButton.disabled = !hasCards;
            
            if (!hasCards) {
                setTimeout(() => this.gameLogic.nextPhase(), 500);
            }
        } else {
            this.skipPhaseButton.classList.remove('visible');
        }
        
        this.gamePhaseDiv.classList.add('phase-active');
    }

    // Game state updates
    updateGameState(lives, deckLength) {
        this.livesCounter.textContent = lives;
        this.cardsCounter.textContent = deckLength;
        this.livesCounter.style.color = lives <= 5 ? 'red' : 'inherit';
        this.cardsCounter.style.color = deckLength <= 5 ? 'red' : 'inherit';
    }

    // Utility functions
    polarToCartesian(row, col) {
        return {
            x: ((col + 3) * 100),
            y: ((row + 3) * 100)
        };
    }

    cartesianToPolar(x, y) {
        return {
            row: Math.round(y / 100) - 3,
            col: Math.round(x / 100) - 3
        };
    }

    // Game end handling
    endGame(message, isVictory = false) {
        this.gameOverDiv.textContent = message;
        this.gameOverDiv.style.display = 'block';
        if (isVictory) {
            this.gameOverDiv.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
        }
        this.container.style.pointerEvents = 'none';
        this.gameLogic.currentPhase = 0;
        this.gameLogic.isPhaseTransitioning = false;
        this.skipPhaseButton.classList.remove('visible');
    }

    hasFlippableCards() {
        for (const [pos, card] of this.occupiedPositions) {
            if (this.gameLogic.canFlipCard(card)) {
                return true;
            }
        }
        return false;
    }

    makeBackCardsClickable() {
        for (const [pos, card] of this.occupiedPositions) {
            if (card.type === 'back' && this.gameLogic.canFlipCard(card)) {
                const cardElement = document.querySelector(`.card[data-position="${pos}"]`);
                if (cardElement) {
                    cardElement.style.cursor = 'pointer';
                }
            }
        }
    }
}
