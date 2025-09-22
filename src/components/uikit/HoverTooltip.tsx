import React, { useState, useRef, useEffect, useCallback } from 'react';

import './HoverTooltip.css';

export interface HoverTooltipProps {
    /** Дочерние элементы, при наведении на которые показывается тултип. Оборачивает своим div */
    children: React.ReactNode;
    /** Контент, который будет показан в тултипе. Использует position:fixed */
    content: React.ReactNode;
    /** Позиция тултипа относительно элемента */
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    /** Задержка перед показом тултипа (в миллисекундах) */
    delay?: number;
    /** Задержка перед скрытием тултипа (в миллисекундах) */
    hideDelay?: number;
    /** Отключить тултип */
    disabled?: boolean;
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({
    content,
    position = 'auto',
    delay = 300,
    hideDelay = 100,
    disabled = false,
    children
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left?: number; right?: number }>({
        top: 0,
        left: 0
    });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Функция для расчета позиции тултипа
    const calculatePosition = useCallback((): void => {
        if (!containerRef.current || !tooltipRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 10;

        let finalPosition = position;
        let top = 0;
        let left: number | undefined = 0;
        let right: number | undefined = undefined;

        // Если позиция 'auto', определяем лучшую позицию
        if (position === 'auto') {
            const spaceTop = containerRect.top;
            const spaceBottom = viewportHeight - containerRect.bottom;
            const spaceRight = viewportWidth - containerRect.right;

            if (spaceBottom >= tooltipRect.height + margin) {
                finalPosition = 'bottom';
            } else if (spaceTop >= tooltipRect.height + margin) {
                finalPosition = 'top';
            } else if (spaceRight >= tooltipRect.width + margin) {
                finalPosition = 'right';
            } else {
                finalPosition = 'left';
            }
        }

        // Рассчитываем позицию в зависимости от выбранного направления
        switch (finalPosition) {
            case 'top':
                top = containerRect.top - tooltipRect.height - margin;
                left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = containerRect.bottom + margin;
                left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
                left = containerRect.left - tooltipRect.width - margin;
                break;
            case 'right':
                top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
                left = undefined;
                right = viewportWidth - containerRect.left + containerRect.width + containerRect.width/2;
                break;
        }

        // Проверяем границы экрана и корректируем позицию
        if (left !== undefined) {
            if (left < margin) {
                left = margin;
            } else if (left + tooltipRect.width > viewportWidth - margin) {
                left = viewportWidth - tooltipRect.width - margin;
            }
        }
        
        if (right !== undefined) {
            if (right < margin) {
                right = margin;
            } else if (right + tooltipRect.width > viewportWidth - margin) {
                right = viewportWidth - tooltipRect.width - margin;
            }
        }

        if (top < margin) {
            top = margin;
        } else if (top + tooltipRect.height > viewportHeight - margin) {
            top = viewportHeight - tooltipRect.height - margin;
        }

        setTooltipPosition({ top, left, right });
    }, [position]);

    // Показать тултип
    const showTooltip = (): void => {
        if (disabled) return;
        
        clearTimeout(hideTimeoutRef.current);
        showTimeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    // Скрыть тултип
    const hideTooltip = (): void => {
        clearTimeout(showTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, hideDelay);
    };

    // Пересчитываем позицию при изменении видимости
    useEffect(() => {
        if (isVisible) {
            calculatePosition();
        }
    }, [isVisible, position, calculatePosition]);

    // Очищаем таймеры при размонтировании
    useEffect(() => {
        return () => {
            clearTimeout(showTimeoutRef.current);
            clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`hover-tooltip-container`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`hover-tooltip`}
                    style={{
                        top: `${tooltipPosition.top}px`,
                        ...(tooltipPosition.left !== undefined && { left: `${tooltipPosition.left}px` }),
                        ...(tooltipPosition.right !== undefined && { right: `${tooltipPosition.right}px` })
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};
