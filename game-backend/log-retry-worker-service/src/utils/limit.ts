import pLimit from 'p-limit';

// Allow up to 3 concurrent writes
export const mongoWriteLimit = pLimit(3);
