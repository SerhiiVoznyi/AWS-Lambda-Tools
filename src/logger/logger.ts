import { LogConfig, LogLevel, LogRecord } from './types'

export const TRACE_HEADER_NAME = '_X_AMZN_TRACE_ID'

export class LambdaLogger {
  private static _config: LogConfig
  private static _stack: LogRecord[] = []

  public static setup (config: LogConfig): void {
    this._stack = []
    this._config = config
    this._config.minLogLevel ??=
      LogLevel[process.env.MIN_LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.Information
    this._config.traceData ??= {
      traceId: process.env[TRACE_HEADER_NAME] ?? `${crypto.randomUUID()}`,
    }
  }

  public static info (message: string, data?: Record<string, unknown>): void {
    this.addLogRecord(LogLevel.Information, message, data)
  }

  public static warn (message: string, data?: Record<string, unknown>): void {
    this.addLogRecord(LogLevel.Warning, message, data)
  }

  public static error (message: string, ex?: Error, data?: Record<string, unknown>): void {
    this.addLogRecord(LogLevel.Error, message, {
      error: this.safeSerialize(ex),
      data: this.safeSerialize(data)
    })
  }

  private static addLogRecord (
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (level < this._config.minLogLevel) {
      return
    }
    this._stack.push({ level, message, data })
  }

  private static safeSerialize (data?:unknown): Record<string, unknown> | undefined {
    if (data == null) { 
      return undefined 
    }
    const seen = new WeakSet()
    return JSON.parse(
      JSON.stringify(data, (_key, value) => {
        if (typeof value === 'object' && value != null) {
          if (seen.has(value)) { return undefined }
          seen.add(value)
        }
        return value
      })
    )
  }
}
