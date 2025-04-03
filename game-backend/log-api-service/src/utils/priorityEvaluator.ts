import { LogPriority } from '../constants/priority.enum';
import { LogTypes, LogKeywords } from '../constants/log.constants';

interface LogInput {
  playerId: string;
  logData: string;
  logType?: string;
}

export function evaluateLogPriority(log: LogInput): LogPriority {
  const { logData, logType } = log;

  const isCrashLog = logType === LogTypes.CRASH;
  const isCritical = logData?.toLowerCase().includes(LogKeywords.CRITICAL);

  if (isCrashLog || isCritical) {
    return LogPriority.HIGH;
  }

  return LogPriority.LOW;
}
