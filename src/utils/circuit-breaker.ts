

import { ProtocolError } from '@modelcontextprotocol/server';

/**
 * Circuit Breaker states
 */
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit Breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  successThreshold: number;
}

/**
 * Circuit Breaker implementation for external API calls
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      timeout: config.timeout || 60000, // 1 minute
      successThreshold: config.successThreshold || 2
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    countsAsFailure: (error: unknown) => boolean = () => true
  ): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Service temporarily unavailable due to previous failures');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (countsAsFailure(error)) {
        this.onFailure();
      }
      throw error;
    }
  }

  /**
   * Check if circuit breaker is open
   */
  private isOpen(): boolean {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successes = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successes = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.CLOSED && this.failures >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.successes = 0;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Whether an error suggests the upstream service is unhealthy. Client
 * mistakes (protocol errors such as unknown names or invalid params, and
 * "not found" lookups) must not trip the breaker, or a few bad component
 * names would lock out every tool.
 */
export function isUpstreamFailure(error: unknown): boolean {
  if (ProtocolError.isInstance(error)) return false;
  const message = error instanceof Error ? error.message : String(error);
  return !/not found/i.test(message);
}

/**
 * Circuit breaker instances for different services
 */
export const circuitBreakers = {
  github: new CircuitBreaker({ failureThreshold: 3, timeout: 30000 }),
  external: new CircuitBreaker({ failureThreshold: 5, timeout: 60000 })
}; 