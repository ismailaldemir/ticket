const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../uploads/logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(
  logDir,
  `app-${new Date().toISOString().slice(0, 10)}.log`
);

const log = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
  if (process.env.NODE_ENV !== "production") {
    // Geliştirme ortamında konsola da yaz
    // eslint-disable-next-line no-console
    console[level] ? console[level](message, meta) : console.log(message, meta);
  }
};

module.exports = {
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};
