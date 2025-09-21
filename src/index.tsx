import { createRoot } from 'react-dom/client';

import Game from './components/Game';

// Create React root and render the app
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Game  />); 