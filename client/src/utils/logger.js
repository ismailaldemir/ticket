/**
 * Loglama servisi
 * Console.log yerine bu servisi kullanarak daha kontrollü loglama yapabilirsiniz
 */
class Logger {
  static LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  // Geliştirme ortamında daha detaylı, production'da daha az log
  static currentLevel =
    process.env.NODE_ENV === "production"
      ? Logger.LOG_LEVEL.WARN
      : Logger.LOG_LEVEL.DEBUG;

  static debug(message, ...args) {
    if (Logger.currentLevel <= Logger.LOG_LEVEL.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  static info(message, ...args) {
    if (Logger.currentLevel <= Logger.LOG_LEVEL.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (Logger.currentLevel <= Logger.LOG_LEVEL.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message, ...args) {
    if (Logger.currentLevel <= Logger.LOG_LEVEL.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // Log seviyesini uygulamanın ihtiyacına göre değiştirmek için
  static setLogLevel(level) {
    Logger.currentLevel = level;
  }
}

export default Logger;
