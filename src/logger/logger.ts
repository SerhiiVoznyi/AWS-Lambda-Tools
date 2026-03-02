import { LogConfig, LogLevel, LogRecord, TraceData, initTraceData, initConfig } from './types'

export class SimpleLogger {
  private static config: LogConfig
  private static traceData: TraceData

  public static setup(config?: Partial<LogConfig>, traceData?: TraceData): void {
    this.config = initConfig(config)
    this.traceData = initTraceData(traceData)
  }

  public static info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.Information, message, data)
  }

  public static trace(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.Trace, message, data)
  }

  public static warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.Warning, message, data)
  }

  public static error(message: string, ex?: Error, data?: Record<string, unknown>): void {
    this.log(LogLevel.Error, message, {
      error: this.safeSerialize(ex),
      data: this.safeSerialize(data),
    })
  }

  public static critical(message: string, ex?: Error, data?: Record<string, unknown>): void {
    this.log(LogLevel.Critical, message, {
      error: this.safeSerialize(ex),
      data: this.safeSerialize(data),
    })
  }

  public static log(level: LogLevel, message: string, details?: Record<string, unknown>): void {
    if (this.config == null) {
      throw new Error('SimpleLogger.setup() must be called before logging.')
    }

    if (level < this.config.minLogLevel) {
      return
    }

    const record: LogRecord = {
      severity: LogLevel[level],
      timestamp: new Date().toISOString(),
      message,
      details,
      trace: this.traceData,
    }

    const logMessage: any = this.config.logAsSingleString
      ? JSON.stringify(record).replaceAll(/(?:\r\n|\r|\n)/g, ' ')
      : JSON.stringify(record)

    const consoleMap: Record<LogLevel, (message?: any, ...optionalParams: any[]) => void> = {
      [LogLevel.None]: () => {},
      [LogLevel.Trace]: console.trace,
      [LogLevel.Debug]: console.debug,
      [LogLevel.Information]: console.info,
      [LogLevel.Warning]: console.warn,
      [LogLevel.Error]: console.error,
      [LogLevel.Critical]: console.error,
      [LogLevel.Alert]: console.error,
    }
    const logFn = consoleMap[level] ?? console.log
    logFn(logMessage)
  }

  public static state(): { config: LogConfig; trace: TraceData } {
    return {
      config: this.config,
      trace: this.traceData,
    }
  }

  private static safeSerialize(data?: unknown): Record<string, unknown> | undefined {
    if (data == null) {
      return undefined
    }
    const seen = new WeakSet()
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (typeof key === 'string' && this.config.sensitiveDataKeys?.has(key.toLowerCase())) {
          return '[REDACTED]'
        }
        if (typeof value === 'object' && value != null) {
          if (seen.has(value)) {
            return undefined
          }
          seen.add(value)
        }
        return value
      })
    )
  }
}
