import React from 'react';
import './InventoryTooltip.css';
import { InventoryItem } from '../core';

interface InventoryTooltipProps {
    item: InventoryItem;
}

export const InventoryTooltip: React.FC<InventoryTooltipProps> = ({ item }) => {
    // Функция для получения информации о текущем элементе
    const getCurrentItemInfo = () => {
        return (
            <div className="inventory-tooltip-current">
                <div className="inventory-tooltip-header">
                    <span className="inventory-tooltip-emoji">{item.emoji}</span>
                    <span className="inventory-tooltip-name">{item.russianName}</span>
                </div>
                <div className="inventory-tooltip-description">{item.description}</div>
                
                {(item.lives || item.score) && (
                    <div className="inventory-tooltip-stats">
                        {item.lives !== undefined && (
                            <span className="inventory-tooltip-stat">
                                {item.lives > 0 ? "💖" : "💔"} {item.lives}
                            </span>
                        )}
                        {item.score !== undefined && (
                            <span className="inventory-tooltip-stat">⭐ {item.score}</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Функция для получения информации о требованиях активации
    const getActivationRequirements = () => {
        if (!item.requirementsText) return null;

        return (
            <div className="inventory-tooltip-requirements">
                <div className="inventory-tooltip-section-title">📋 Требования для активации:</div>
                <div className="inventory-tooltip-requirement-text">{item.requirementsText}</div>
            </div>
        );
    };

    // Функция для получения информации о будущем преобразовании
    const getFutureTransformation = () => {
        if (!item.nextCardSide) return null;

        return (
            <div className="inventory-tooltip-future">
                <div className="inventory-tooltip-section-title">🔄 После активации:</div>
                <div className="inventory-tooltip-future-content">
                    <div className="inventory-tooltip-future-header">
                        <span className="inventory-tooltip-future-emoji">❓</span>
                        <span className="inventory-tooltip-future-name">
                            {item.nextCardSide.russianName || 'Неизвестно'}
                        </span>
                    </div>
                    <div className="inventory-tooltip-future-description">
                        {item.nextCardSide.description || 'Описание недоступно'}
                    </div>
                    {(item.nextCardSide.lives || item.nextCardSide.score) && (
                        <div className="inventory-tooltip-future-stats">
                            {item.nextCardSide.lives !== undefined && (
                                <span className="inventory-tooltip-future-stat">
                                    {item.nextCardSide.lives > 0 ? "💖" : "💔"} {item.nextCardSide.lives}
                                </span>
                            )}
                            {item.nextCardSide.score !== undefined && (
                                <span className="inventory-tooltip-future-stat">⭐ {item.nextCardSide.score}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="inventory-tooltip">
            <div className="inventory-tooltip-content">
                {getCurrentItemInfo()}
                {getActivationRequirements()}
                {getFutureTransformation()}
            </div>
        </div>
    );
};
