// Enhanced logging utility for debugging in Android
export class Logger {
  private static instance: Logger;
  private logBuffer: string[] = [];
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}`;
    
    // Console log (visible in dev tools)
    console.log(logEntry);
    if (data) {
      console.log('Data:', data);
    }
    
    // Store in buffer for debugging
    this.logBuffer.push(`${logEntry} ${data ? JSON.stringify(data) : ''}`);
    
    // Keep only last 100 entries
    if (this.logBuffer.length > 100) {
      this.logBuffer.shift();
    }
    
    // Try to alert on error for Android debugging
    if (level === 'ERROR' && typeof window !== 'undefined') {
      setTimeout(() => {
        // Show in UI for mobile debugging
        this.showMobileAlert(logEntry, data);
      }, 100);
    }
  }

  private showMobileAlert(message: string, data?: any) {
    try {
      const fullMessage = data ? `${message}\n\nData: ${JSON.stringify(data, null, 2)}` : message;
      // Store in localStorage for debugging
      localStorage.setItem('lastError', fullMessage);
      localStorage.setItem('lastErrorTime', new Date().toISOString());
    } catch (e) {
      // Fallback
    }
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  error(message: string, data?: any) {
    this.log('ERROR', message, data);
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }

  getLogs(): string[] {
    return [...this.logBuffer];
  }

  clearLogs() {
    this.logBuffer = [];
  }
}

export const logger = Logger.getInstance();