import React from 'react';
import { InventoryItem, Inventory as InventoryClass } from '../core';
import { HoverTooltip } from './uikit';
import { InventoryTooltip } from './InventoryTooltip';
import './Inventory.css';

interface InventoryProps {
    inventory: InventoryClass;
    onItemClick?: (id: string) => void;
    canActivate: (id: string) => boolean;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onItemClick, canActivate }) => {
    const handleItemClick = (item: InventoryItem) => {
        if (onItemClick) {
            onItemClick(item.id);
        }
    };

    const isItemClickable = (item: InventoryItem) => {
        return onItemClick && canActivate(item.id);
    };

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h3>Инвентарь</h3>
            </div>
            <div className="inventory-grid">
                {inventory.getAllItems().map((item, index) => {
                    const clickable = isItemClickable(item);
                    return (
                        <HoverTooltip
                            key={`${item.id}-${index}`}
                            content={<InventoryTooltip item={item} />}
                            position="right"
                            delay={200}
                            hideDelay={100}
                        >
                            <div 
                                className={`inventory-item ${clickable ? 'inventory-item-clickable' : ''}`}
                                onClick={() => clickable && handleItemClick(item)}
                                title={clickable ? 'Кликните для переворота карты' : ''}
                            >
                                <div className="inventory-item-emoji">{item.emoji}</div>
                                <div className="inventory-item-info">
                                    <div className="inventory-item-name">{item.russianName}</div>
                                </div>
                                {item.requirementsText && (
                                    <div className="inventory-item-requirements">
                                        {item.requirementsText}
                                    </div>
                                )}
                            </div>
                        </HoverTooltip>
                    );
                })}
                {inventory.isEmpty() && (
                    <div className="inventory-empty">
                        <div className="inventory-empty-emoji">🎒</div>
                        <div className="inventory-empty-text">Инвентарь пуст</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
