import { useEffect, useState } from 'react';
import { GameState } from '../core/initial';
import './Counters.css';
import { HoverTooltip } from './uikit';
import { TooltipContent } from './TooltipContent';

type GamePhase = 'moving' | 'decreasingLives' | 'checkingFlippable' | 'shipMoving' | 'gameOver';

const GAME_PHASES = [
    { id: 'moving' as GamePhase, emoji: '🚶', title: 'Выберите клетку для перемещения' },
    { id: 'decreasingLives' as GamePhase, emoji: '💔', title: 'Вам становится все труднее оставаться на острове...' },
    { id: 'checkingFlippable' as GamePhase, emoji: '🔄', title: 'Переверните карту или пропустите фазу' },
    { id: 'shipMoving' as GamePhase, emoji: '⛵', title: 'Движение корабля' }
];

const COUNTERS_TOOLTIPS = {
    lives: {
        title: "Жизни",
        description: "Ваш запас сил для выживания на острове",
        details: [
            "Если жизни заканчиваются, вы проигрываете игру",
            "Жизни теряются в опасных ситуациях: шторм, дикие животные, невозможность сделать ход",
            "Жизни можно восстановить, переворачивая полезные карты: рыба (+3), мясо (+3), кокосы (+2), вода (+2), убежище (+2)",
            "Когда жизней остается 5 или меньше, число подсвечивается красным цветом",
            "Максимальное количество жизней — 16"
        ],
        mechanics: "Жизни — это основной ресурс выживания. Управляйте ими осторожно!"
    },
    
    deck: {
        title: "Колода карт",
        description: "Количество оставшихся карт в колоде",
        details: [
            "Когда колода заканчивается, игра завершается",
            "Если колоды остается 5 или меньше карт, число подсвечивается красным",
            "В начале игры в колоде 15 карт",
            "Каждый ход вытягивается одна карта из колоды"
        ],
        mechanics: "Следите за колодой — это индикатор оставшегося времени игры!"
    },
    
    phases: {
        title: "Фазы игры",
        description: "Текущая фаза игрового хода",
        details: [
            "🚶 Перемещение: выберите клетку для движения персонажа",
            "💔 Уменьшение жизней: проверка опасных клеток и штрафов",
            "🔄 Переворот карт: возможность перевернуть карту или пропустить фазу",
            "⛵ Движение корабля: корабль перемещается по берегу острова"
        ],
        mechanics: "Каждая фаза имеет свои правила и возможности. Используйте их стратегически!"
    },
    
    skipButton: {
        title: "Пропустить фазу",
        description: "Пропустить текущую фазу переворота карт",
        details: [
            "Позволяет пропустить фазу переворота карт",
            "Используйте, когда нет подходящих карт для переворота",
            "Или когда хотите сохранить карту для будущего использования",
            "После пропуска сразу начинается движение корабля"
        ],
        mechanics: "Иногда лучше пропустить фазу, чем переворачивать неподходящую карту!"
    },
    
    helpRules: {
        title: "Правила игры",
        description: "Ссылка на официальные правила Marooned",
        details: [
            "Открывает официальные правила игры на BoardGameGeek",
            "Содержит полное описание механик и стратегий",
            "Полезно для изучения тонкостей игры",
            "Рекомендуется прочитать перед первой игрой"
        ],
        mechanics: "Знание правил поможет принимать более эффективные решения!"
    },
    
    helpVideo: {
        title: "▶️ Видео-обучение",
        description: "Летсплей с объяснением игры",
        details: [
            "Видео-демонстрация игры Marooned",
            "Показывает стратегии и тактики в действии",
            "Помогает понять игровые механики на практике",
            "Полезно для визуального изучения игры"
        ],
        mechanics: "Видео поможет лучше понять, как применять правила на практике!"
    }
} as const;

interface CountersProps {
    lives: number;
    deckLength: number;
    state: GameState;
    handleSkipPhase: () => void;
}

const Counters: React.FC<CountersProps> = ({ lives, deckLength, state, handleSkipPhase }) => {
    const [livesAnimation, setLivesAnimation] = useState<string>('');
    const [prevLives, setPrevLives] = useState<number>(lives);

    useEffect(() => {
        if (lives !== prevLives) {
            setLivesAnimation(lives > prevLives ? 'lives-increase' : 'lives-decrease');
            setPrevLives(lives);
            
            // Remove animation class after animation completes
            const timer = setTimeout(() => {
                setLivesAnimation('');
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [lives, prevLives]);

    const currentPhase = typeof state.value === 'object' ? state.value.playing as GamePhase : state.value as GamePhase;
    const currentPhaseData = GAME_PHASES.find(phase => phase.id === currentPhase);
    const message = currentPhaseData?.title || '';
    const showSkipButton = currentPhase === 'checkingFlippable';

    return (
        <div className="counters">
            <div className="game-stats">
                <HoverTooltip
                    content={
                        <TooltipContent
                            title={COUNTERS_TOOLTIPS.lives.title}
                            description={COUNTERS_TOOLTIPS.lives.description}
                            details={COUNTERS_TOOLTIPS.lives.details}
                            mechanics={COUNTERS_TOOLTIPS.lives.mechanics}
                        />
                    }
                >
                    <div className="stat-item" style={{ color: lives <= 5 ? 'red' : 'inherit' }}>
                        <span className="counter-label">❤️ </span>
                        <span className={`counter-value ${livesAnimation}`}>{lives}</span>
                    </div>
                </HoverTooltip>
                <HoverTooltip
                    content={
                        <TooltipContent
                            title={COUNTERS_TOOLTIPS.deck.title}
                            description={COUNTERS_TOOLTIPS.deck.description}
                            details={COUNTERS_TOOLTIPS.deck.details}
                            mechanics={COUNTERS_TOOLTIPS.deck.mechanics}
                        />
                    }
                >
                    <div className="stat-item" style={{ color: deckLength <= 5 ? 'red' : 'inherit' }}>
                        <span className="counter-label">🎴 </span>
                        <span className="counter-value">{deckLength}</span>
                    </div>
                </HoverTooltip>
                <div className="phase-content">
                    <HoverTooltip
                        content={
                            <TooltipContent
                                title={COUNTERS_TOOLTIPS.phases.title}
                                description={COUNTERS_TOOLTIPS.phases.description}
                                details={COUNTERS_TOOLTIPS.phases.details}
                                mechanics={COUNTERS_TOOLTIPS.phases.mechanics}
                            />
                        }
                    >
                        <div className="game-phases">
                            {GAME_PHASES.map((phase, index) => (
                                <>
                                    <span
                                        className={`phase-emoji ${currentPhase === phase.id ? 'active' : ''}`}
                                        title={phase.title}
                                    >
                                        {phase.emoji}
                                    </span>
                                    {index < GAME_PHASES.length - 1 && (
                                        <span key={`arrow-${index}`} className="phase-arrow">→</span>
                                    )}
                                </>
                            ))}
                        </div>
                    </HoverTooltip>
                    <span className="phase-message">{message}</span>
                    {showSkipButton && (
                        <HoverTooltip
                            content={
                                <TooltipContent
                                    title={COUNTERS_TOOLTIPS.skipButton.title}
                                    description={COUNTERS_TOOLTIPS.skipButton.description}
                                    details={COUNTERS_TOOLTIPS.skipButton.details}
                                    mechanics={COUNTERS_TOOLTIPS.skipButton.mechanics}
                                />
                            }
                        >
                            <button
                                className="skip-phase-button"
                                onClick={handleSkipPhase}
                            >
                                Пропустить
                            </button>
                        </HoverTooltip>
                    )}
                    {/* Кнопка "Остаться здесь" удалена - теперь можно кликнуть на фигурку игрока */}
                </div>
                <div className="help-links">
                    <HoverTooltip
                        content={
                            <TooltipContent
                                title={COUNTERS_TOOLTIPS.helpRules.title}
                                description={COUNTERS_TOOLTIPS.helpRules.description}
                                details={COUNTERS_TOOLTIPS.helpRules.details}
                                mechanics={COUNTERS_TOOLTIPS.helpRules.mechanics}
                            />
                        }
                    >
                        <a href="https://boardgamegeek.com/filepage/132096/marooned-rules" target="_blank" rel="noreferrer noopener" className="help-link-text">?</a>
                    </HoverTooltip>
                    <HoverTooltip
                        content={
                            <TooltipContent
                                title={COUNTERS_TOOLTIPS.helpVideo.title}
                                description={COUNTERS_TOOLTIPS.helpVideo.description}
                                details={COUNTERS_TOOLTIPS.helpVideo.details}
                                mechanics={COUNTERS_TOOLTIPS.helpVideo.mechanics}
                            />
                        }
                    >
                        <a href="https://www.youtube.com/watch?v=WcO8Ln88VQU" target="_blank" rel="noreferrer noopener" className="help-link-text">▶</a>
                    </HoverTooltip>
                </div>
            </div>
        </div>
    );
};

export default Counters; 