/**
 * Interface defining the structure of retry options.
 * - attempts: Number of retry attempts.
 * - minDelayMs: Minimum delay between retries in milliseconds.
 * - maxDelayMs: Maximum delay between retries in milliseconds.
 * -- When maxDelayMs is ZERO or not set won't be taken into execution.
 * - factor: Exponential backoff factor.
 */
export interface IRetryOptions {
  attempts?: number
  minDelayMs?: number
  maxDelayMs?: number
  factor?: number
}

/**
 * Interface defining the structure of strict retry options.
 * All properties are required.
 */
export interface IRetryOptionsStrict extends IRetryOptions {
  attempts: number
  minDelayMs: number
  maxDelayMs: number
  factor: number
}

/** Interface defining the result of an execution with retry.
 * - result: The successful result, if any.
 * - error: The error encountered, if any.
 * - log: An array of log entries for each attempt.
 */
export interface IExecutionWithRetryResult<T> {
  success: boolean
  result?: T
  error?: Error
  log: Array<{ attempt: number, delayMs: number, success: boolean, error?: string }>
}