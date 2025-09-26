import { GameContext, GameEvent } from "./initial";
import { CardSide } from "./Card";

export class InventoryItem {
    id: string;
    emoji: string;
    russianName: string;
    description: string;
    score?: number;
    lives?: number;
    requirements?: string;
    requirementsText?: string;
    nextCardSide?: CardSide;
    canActivate: (context: GameContext) => boolean;
    cardSide: CardSide;

    // Колбэки для игровых событий
    onRoundStart?: (context: GameContext, event?: GameEvent) => GameContext;
    onBeforeShipMove?: (context: GameContext, event?: GameEvent) => GameContext;
    
    constructor(cardSide: CardSide, nextCardSide?: CardSide) {
        this.id = cardSide.id;
        this.emoji = cardSide.emoji;
        this.russianName = cardSide.russianName || 'Неизвестно';
        this.description = cardSide.description || 'Описание недоступно';
        this.score = cardSide.score;
        this.lives = cardSide.lives;
        this.requirements = cardSide.requirements;
        this.requirementsText = cardSide.requirementsText;
        
        // Копируем колбэки
        this.onRoundStart = cardSide.onRoundStart;
        this.onBeforeShipMove = cardSide.onBeforeShipMove;
        this.nextCardSide = nextCardSide;
        this.cardSide = cardSide;

        this.canActivate = cardSide.canActivate ?? this._canActivate;
    }

    // Дефолтный метод проверки можно ли перевернуть карту
    _canActivate(context: GameContext): boolean {
        const requirements = this.requirements;
        if (!requirements) return false;
        
        // Проверяем базовые требования (карты на поле или в инвентаре)
        return context.positionSystem.findCardById(requirements) !== null || context.inventory.findById(requirements) !== null;
    }

    activate(context: GameContext): GameContext {
        if (!this.nextCardSide) {
            return context;
        }

        // Создаем новый элемент инвентаря из следующей стороны карты
        // Используем ID следующей стороны для корректного поиска
        const nextInventoryItem = new InventoryItem(this.nextCardSide, this.cardSide);
        
        // Заменяем текущий элемент на следующий в инвентаре
        const newInventory = context.inventory.updateById(this.id, nextInventoryItem);
        
        // Применяем эффекты следующей стороны карты
        let newContext = { ...context, inventory: newInventory };
        if (this.nextCardSide.onPlace) {
            newContext = this.nextCardSide.onPlace(newContext);
        }
        
        return newContext;
    }
}

export class Inventory {
    private items: InventoryItem[];

    constructor(items: InventoryItem[] = []) {
        this.items = [...items];
    }

    /**
     * Добавляет новый элемент в инвентарь
     */
    add(item: InventoryItem): Inventory {
        return new Inventory([...this.items, item]);
    }

    /**
     * Обновляет элемент в инвентаре по ID
     */
    updateById(id: string, updatedItem: InventoryItem): Inventory {
        const index = this.items.findIndex(item => item.id === id);
        
        if (index === -1) {
            return this;
        }

        const newItems = [...this.items];
        newItems[index] = updatedItem;
        return new Inventory(newItems);
    }

    /**
     * Удаляет элемент из инвентаря по ID
     */
    removeById(id: string): Inventory {
        const newItems = this.items.filter(item => item.id !== id);
        return new Inventory(newItems);
    }

    /**
     * Находит элемент по ID
     */
    findById(id: string): InventoryItem | null {
        return this.items.find(item => item.id === id) || null;
    }

    /**
     * Получает все элементы инвентаря
     */
    getAllItems(): InventoryItem[] {
        return [...this.items];
    }


    /**
     * Проверяет, пуст ли инвентарь
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    /**
     * Создаёт пустой инвентарь
     */
    static empty(): Inventory {
        return new Inventory();
    }
}
