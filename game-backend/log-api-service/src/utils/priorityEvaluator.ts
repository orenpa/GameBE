import { LOG_PRIORITIES } from '../constants/log.constants';
import { LOG_TYPES, LOG_KEYWORDS } from '../constants/log.constants';

interface LogInput {
  playerId: string;
  logData: string;
  logType?: string;
}

export function evaluateLogPriority(log: LogInput): string {
  const { logData, logType } = log;

  const isCrashLog = logType === LOG_TYPES.CRASH;
  const isCritical = logData?.toLowerCase().includes(LOG_KEYWORDS.CRITICAL);

  if (isCrashLog || isCritical) {
    return LOG_PRIORITIES.HIGH;
  }

  return LOG_PRIORITIES.LOW;
}
