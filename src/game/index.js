// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameLogic = new GameLogic();
    new GameUI(gameLogic);
    gameLogic.startGame();

    // Expose game instance to window for debugging if needed
    window.game = gameLogic;
}); 