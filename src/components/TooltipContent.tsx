import React from 'react';
import './TooltipContent.css';

interface TooltipContentProps {
    title: string;
    description: string;
    details: readonly string[];
    mechanics: string;
    maxWidth?: number;
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
    title,
    description,
    details,
    mechanics,
    maxWidth = 280
}) => {
    return (
        <div className="tooltip-content" style={{ maxWidth }}>
            <div className="tooltip-title">
                {title}
            </div>
            <div className="tooltip-description">
                {description}
            </div>
            <ul className="tooltip-details">
                {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                ))}
            </ul>
            <div className="tooltip-mechanics">
                {mechanics}
            </div>
        </div>
    );
};
