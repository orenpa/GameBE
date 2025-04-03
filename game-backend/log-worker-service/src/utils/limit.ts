import pLimit from 'p-limit';
import { env } from '../config/env';

export const mongoWriteLimit = pLimit(env.maxConcurrentWrites);
