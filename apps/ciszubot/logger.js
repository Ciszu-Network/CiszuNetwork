const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.logFile = path.join(this.logDir, 'bot.log');
        this.errorFile = path.join(this.logDir, 'error.log');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        // Log levels
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        // Current log level (can be set via environment variable)
        this.currentLevel = this.levels[process.env.LOG_LEVEL?.toUpperCase()] || this.levels.INFO;
    }
    
    /**
     * Get current timestamp in readable format
     */
    getTimestamp() {
        return new Date().toISOString();
    }
    
    /**
     * Format log message
     */
    formatMessage(level, message, data = null) {
        const timestamp = this.getTimestamp();
        let formattedMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (data) {
            if (data instanceof Error) {
                formattedMessage += `\n${data.stack}`;
            } else if (typeof data === 'object') {
                formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
            } else {
                formattedMessage += ` ${data}`;
            }
        }
        
        return formattedMessage;
    }
    
    /**
     * Write log to file
     */
    writeToFile(message, isError = false) {
        const file = isError ? this.errorFile : this.logFile;
        
        try {
            fs.appendFileSync(file, message + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    
    error(message, data = null) {
        if (this.currentLevel >= this.levels.ERROR) {
            const formattedMessage = this.formatMessage('ERROR', message, data);
            console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red color
            this.writeToFile(formattedMessage, true);
        }
    }
    
    warn(message, data = null) {
        if (this.currentLevel >= this.levels.WARN) {
            const formattedMessage = this.formatMessage('WARN', message, data);
            console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow color
            this.writeToFile(formattedMessage);
        }
    }
    
    /**
     * Log info messages
     */
    info(message, data = null) {
        if (this.currentLevel >= this.levels.INFO) {
            const formattedMessage = this.formatMessage('INFO', message, data);
            console.log('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan color
            this.writeToFile(formattedMessage);
        }
    }
    
    /**
     * Log debug messages
     */
    debug(message, data = null) {
        if (this.currentLevel >= this.levels.DEBUG) {
            const formattedMessage = this.formatMessage('DEBUG', message, data);
            console.log('\x1b[37m%s\x1b[0m', formattedMessage); // White color
            this.writeToFile(formattedMessage);
        }
    }
    
    /**
     * Log command execution
     */
    command(commandName, user, guild = null) {
        const location = guild ? `in ${guild}` : 'in DM';
        this.info(`Command executed: ${commandName} by ${user} ${location}`);
    }
    
    /**
     * Log bot events
     */
    event(eventName, data = null) {
        this.info(`Event: ${eventName}`, data);
    }
    
    /**
     * Clean old log files (optional maintenance)
     */
    cleanOldLogs(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        try {
            const files = fs.readdirSync(this.logDir);
            
            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    this.info(`Deleted old log file: ${file}`);
                }
            });
        } catch (error) {
            this.error('Failed to clean old log files:', error);
        }
    }
}

// Export a singleton instance
module.exports = new Logger();
