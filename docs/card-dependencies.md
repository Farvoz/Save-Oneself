# Граф зависимостей карт

## Карты тыльной стороны (INITIAL_DECK)
```mermaid
graph TD
    %% Карты тыльной стороны
    hook[🎣 hook] --> water[💧 water]
    water --> telescope[🔭 telescope]
    telescope --> higher_ground[⛰️ higher-ground]
    higher_ground --> torch[🔥 torch]
    
    flint[⚡ flint] --> vines[🌿 vines]
    vines --> palm_trees[🌴 palm-trees]
    palm_trees --> rocks[🧱 rocks]
    rocks --> higher_ground
    
    sticks[🥢 sticks] --> flint
    
    bottle[🍾 bottle] --> ship_set_sail[⛵ ship-set-sail]
    
    %% Стили для карт
    classDef backCard fill:#F5F5DC,stroke:#333,stroke-width:2px;
    class hook,water,telescope,higher_ground,torch,flint,vines,palm_trees,rocks,sticks,bottle,ship_set_sail backCard;
```

## Карты лицевой стороны (INITIAL_FRONT_DECK)
```mermaid
graph TD
    %% Карты лицевой стороны
    fish[🐟 fish] --> hook
    waterfall[🌊 waterfall] --> water
    torch_front[🔥 torch] --> flint
    coconuts[🥥 coconuts] --> palm_trees
    spear[🗡️ spear] --> sticks
    shelter[🏠 shelter] --> vines
    ship_sighted[🚢 ship-sighted] --> telescope
    sos[🆘 sos] --> rocks
    lit_beacon[🔥 lit-beacon] --> higher_ground
    message[📜 message] --> bottle
    
    %% Стили для карт
    classDef frontCard fill:#E8F5E9,stroke:#333,stroke-width:2px;
    class fish,waterfall,torch_front,coconuts,spear,shelter,ship_sighted,sos,lit_beacon,message frontCard;
```

## Легенда
- 🎣 hook - Крюк
- 💧 water - Вода
- 🔭 telescope - Телескоп
- ⛰️ higher-ground - Возвышенность
- 🔥 torch - Факел
- ⚡ flint - Кремень
- 🌿 vines - Лозы
- 🌴 palm-trees - Пальмы
- 🧱 rocks - Камни
- 🥢 sticks - Палки
- 🍾 bottle - Бутылка
- ⛵ ship-set-sail - Корабль

### Карты лицевой стороны
- 🐟 fish - Рыба
- 🌊 waterfall - Водопад
- 🔥 torch - Факел
- 🥥 coconuts - Кокосы
- 🗡️ spear - Копье
- 🏠 shelter - Укрытие
- 🚢 ship-sighted - Замеченный корабль
- 🆘 sos - SOS
- 🔥 lit-beacon - Зажженный маяк
- 📜 message - Сообщение 