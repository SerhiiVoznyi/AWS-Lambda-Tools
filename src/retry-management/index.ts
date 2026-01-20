import { IRetryOptions, IRetryOptionsStrict, IExecutionWithRetryResult } from './types'

/**
 * Default retry options used when no specific options are provided.
 * - attempts: 5
 * - minDelayMs: 1000 (1 second)
 * - maxDelayMs: 0 (won't be applied to execution)
 * - factor: 2 (exponential backoff)
 */
export const DEFAULT_RETRY_OPTIONS: IRetryOptionsStrict = {
  attempts: 5,
  minDelayMs: 1000,
  maxDelayMs: 0,
  factor: 2
}

/**
 * Function to resolve retry options by merging provided options with default values. *
 * @param options Partial retry options provided by the user.
 * @returns Complete retry options with all required fields.
 */
export function resolveOptionsWithDefaults (
  options: IRetryOptions = {}
): IRetryOptionsStrict {
  return {
    attempts: options.attempts ?? DEFAULT_RETRY_OPTIONS.attempts,
    minDelayMs: options.minDelayMs ?? DEFAULT_RETRY_OPTIONS.minDelayMs,
    maxDelayMs: options.maxDelayMs ?? DEFAULT_RETRY_OPTIONS.maxDelayMs,
    factor: options.factor ?? DEFAULT_RETRY_OPTIONS.factor
  }
}

/**
 * Function to execute an asynchronous operation with retry logic.
 * @param operation Name or description of the operation being retried.
 * @param fn Asynchronous function to be executed.
 * @param options Partial retry options provided by the user.
 * @throws Error if all retry attempts fail.
 * @returns Result of the execution with retry, including success status, result, error, and log.
 */
export async function executeWithRetry<T> (
  operation: string,
  fn: () => Promise<T>,
  options: IRetryOptions = {},
  log: (logLevel: LogLevel, message: string) => void = (logLevel, message) => {
    _log.writeLog(logLevel, message)
  }
): Promise<IExecutionWithRetryResult<T>> {
  const { attempts, minDelayMs, maxDelayMs, factor } = resolveOptionsWithDefaults(options)
  const executionLog: Array<{ attempt: number, delayMs: number, success: boolean, error?: string }> = []
  let result: T | undefined
  let finalError: Error | undefined
  let attempt = 1
  let delay = 0
  do {
    try {
      log(LogLevel.Information, `Try to execute ${operation}`)
      result = await fn()
      executionLog.push({ attempt, delayMs: delay, success: true })
      break
    } catch (ex) {
      const error = ex as Error
      const reason = error?.message ?? JSON.stringify(error, Object.getOwnPropertyNames(error))
      const message: string = `Operation "${operation}" execution failed. Reason: ${reason}`
      executionLog.push({ attempt, delayMs: delay, success: false, error: message })
      log(LogLevel.Warning, message)
      if (attempt === attempts || ex instanceof NonRetryableException) {
        finalError = error
        break
      }
    }

    delay = minDelayMs * Math.pow(factor, attempt - 1)
    if (maxDelayMs > 0) {
      delay = Math.min(delay, maxDelayMs)
    }
    if (attempt <= attempts) {
      log(LogLevel.Information, `${operation} retry attempt ${attempt} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
    attempt++
  } while (attempt <= attempts)

  return {
    success: finalError === undefined,
    result,
    error: finalError,
    log: executionLog
  }
}