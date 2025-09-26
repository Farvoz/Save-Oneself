import React from 'react';
import './InventoryTooltip.css';
import { InventoryItem } from '../core';
import { SideInfo, RequirementsInfo } from './tooltip';

interface InventoryTooltipProps {
    item: InventoryItem;
}

export const InventoryTooltip: React.FC<InventoryTooltipProps> = ({ item }) => {

    return (
        <div className="inventory-tooltip">
            <div className="inventory-tooltip-content">
                {/* Текущий элемент */}
                <SideInfo
                    emoji={item.emoji}
                    name={item.russianName}
                    description={item.description}
                    lives={item.lives}
                    score={item.score}
                    className="inventory-tooltip-current"
                    grayscale={false}
                />
                
                {/* Требования активации */}
                {item.requirementsText && (
                    <RequirementsInfo
                        requirementsText={item.requirementsText}
                        className="inventory-tooltip-requirements"
                    />
                )}
                
                {/* Будущее преобразование */}
                {item.nextCardSide && (
                    <SideInfo
                        emoji={item.nextCardSide.emoji}
                        name={item.nextCardSide.russianName || 'Неизвестно'}
                        description={item.nextCardSide.description || 'Описание недоступно'}
                        lives={item.nextCardSide.lives}
                        score={item.nextCardSide.score}
                        className="inventory-tooltip-future"
                        grayscale={true}
                    />
                )}
            </div>
        </div>
    );
};
