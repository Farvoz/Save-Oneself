import React from 'react';
import { createRoot } from 'react-dom/client';

import Game from './components/Game';
import { GameLogic } from './game/gameLogic';

// Initialize game logic
const gameLogic = new GameLogic();

// Create React root and render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Game gameLogic={gameLogic} />); 