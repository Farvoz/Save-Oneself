type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, LogLevel> = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

const COLORS: Record<LogLevel | 'RESET' | 'TIMESTAMP' | 'DATA', string> = {
    INFO: '\x1b[36m', // Cyan
    WARN: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m', // Red
    RESET: '\x1b[0m',  // Reset
    TIMESTAMP: '\x1b[90m', // Gray
    DATA: '\x1b[35m'  // Magenta
};

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    });
};

const formatData = (data: Record<string, unknown>): string => {
    if (Object.keys(data).length === 0) return '';
    return `\n${COLORS.DATA}${JSON.stringify(data, null, 2)}${COLORS.RESET}`;
};

const formatLogMessage = (level: LogLevel, message: string, data: Record<string, unknown> = {}): string => {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    
    return `${COLORS.TIMESTAMP}[${formatTimestamp(timestamp)}]${COLORS.RESET} ${color}[${level}]${COLORS.RESET} ${message}${formatData(data)}`;
};

export const gameLogger = {
    info: (message: string, data: Record<string, unknown> = {}) => {
        console.log(formatLogMessage(LOG_LEVELS.INFO, message, data));
    },
    warn: (message: string, data: Record<string, unknown> = {}) => {
        console.warn(formatLogMessage(LOG_LEVELS.WARN, message, data));
    },
    error: (message: string, data: Record<string, unknown> = {}) => {
        console.error(formatLogMessage(LOG_LEVELS.ERROR, message, data));
    }
}; 