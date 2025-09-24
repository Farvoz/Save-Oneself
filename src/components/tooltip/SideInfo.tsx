import React from 'react';
import './SideInfo.css';

interface SideInfoProps {
    emoji: string;
    name: string;
    description: string;
    lives?: number;
    score?: number;
    direction?: string;
    className?: string;
    grayscale?: boolean;
}

export const SideInfo: React.FC<SideInfoProps> = ({ 
    emoji, 
    name, 
    description, 
    lives, 
    score, 
    direction, 
    className = '',
    grayscale = false
}) => {
    return (
        <div className={`side-info ${className} ${grayscale ? 'grayscale' : ''}`}>
            <div className="side-header">
                <span className="side-emoji">{emoji}</span>
                <span className="side-name">{name}</span>
            </div>
            <div className="side-description">{description}</div>
            
            {(lives !== undefined || score !== undefined || direction) && (
                <div className="side-stats">
                    {lives !== undefined && (
                        <span className="stat">
                            {lives > 0 ? "💖" : "💔"} {lives}
                        </span>
                    )}
                    {score !== undefined && (
                        <span className="stat">⭐ {score}</span>
                    )}
                    {direction && (
                        <span className="stat">🧭 {direction}</span>
                    )}
                </div>
            )}
        </div>
    );
};
