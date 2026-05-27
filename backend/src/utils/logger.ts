import fs from 'fs';
import path from 'path';
import os from 'os';

const LOG_DIR = path.join(os.homedir(), 'Documents', '薄荷集市', 'logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, 'app.log');

function writeLog(level: string, message: string) {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] [${level}] ${message}\n`;
  
  // 输出到控制台
  if (level === 'ERROR') {
    console.error(log);
  } else {
    console.log(log);
  }
  
  // 写入文件
  fs.appendFileSync(logFile, log);
}

export const logger = {
  info: (message: string) => writeLog('INFO', message),
  warn: (message: string) => writeLog('WARN', message),
  error: (message: string, err?: Error) => {
    if (err) {
      writeLog('ERROR', `${message}: ${err.message}\n${err.stack}`);
    } else {
      writeLog('ERROR', message);
    }
  }
};