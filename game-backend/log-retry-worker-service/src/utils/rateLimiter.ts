export class TokenBucketRateLimiter {
    private tokens: number;
    private readonly capacity: number;
    private readonly refillAmount: number;
    private readonly refillInterval: number;
  
    constructor(capacity: number, refillRatePerSecond: number) {
      this.capacity = capacity;
      this.tokens = capacity;
      this.refillAmount = refillRatePerSecond;
      this.refillInterval = 1000;
  
      setInterval(() => {
        this.tokens = Math.min(this.capacity, this.tokens + this.refillAmount);
      }, this.refillInterval);
    }
  
    public async wait(): Promise<void> {
      while (this.tokens <= 0) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      this.tokens--;
    }
  }
  