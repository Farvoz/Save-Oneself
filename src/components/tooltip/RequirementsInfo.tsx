import React from 'react';
import './RequirementsInfo.css';

interface RequirementsInfoProps {
    requirementsText: string;
    title?: string;
    className?: string;
}

export const RequirementsInfo: React.FC<RequirementsInfoProps> = ({ 
    requirementsText, 
    title = "📋 Требования для активации:",
    className = '' 
}) => {
    return (
        <div className={`requirements-info ${className}`}>
            <div className="requirements-title">{title}</div>
            <div className="requirements-text">{requirementsText}</div>
        </div>
    );
};
