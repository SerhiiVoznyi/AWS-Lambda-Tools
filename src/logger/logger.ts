import { LogConfig, LogLevel, LogRecord, TraceData } from './types'

export const TRACE_HEADER_NAME = '_X_AMZN_TRACE_ID'
export const CLOUD_WATCH_LOG_EVENT_LIMIT_BYTES = 256 * 1024

export class LambdaLogger {
  private static _config: LogConfig
  private static _stack: Array<LogRecord> = []

  public static setup (config?: LogConfig): void {
    this._stack = []

    this._config = config ?? ({} as unknown as LogConfig)
    this._config.appName ??= process.env.AWS_LAMBDA_FUNCTION_NAME ?? 'unknown'
    this._config.minLogLevel ??=
      LogLevel[process.env.LOG_MIN_LEVEL as keyof typeof LogLevel] ?? LogLevel.Information
    this._config.traceData ??= {
      traceId: process.env[TRACE_HEADER_NAME] ?? `${crypto.randomUUID()}`,
    }
    this._config.logAsSingleString ??= process.env.LOG_AS_SINGLE_STRING === 'true'
    this._config.logOnDemand ??= process.env.LOG_ON_DEMAND === 'true'
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
      data: this.safeSerialize(data),
    })
  }

  public static addLogRecord (
    severity: LogLevel,
    message: string,
    details?: Record<string, unknown>
  ): void {
    if (severity < this._config.minLogLevel) {
      return
    }

    const record: LogRecord = { severity, message, details }

    this._stack.push(record)

    if (!this._config.logOnDemand) {
      this.flash()
    }
  }

  public static flash (): void {
    if (this._stack.length === 0) {
      return
    }

    const level = (array: LogRecord[] = []): LogLevel =>
      array.some(_ => _.severity === LogLevel.Error)
        ? LogLevel.Error
        : array.some(_ => _.severity === LogLevel.Warning)
          ? LogLevel.Warning
          : array.some(_ => _.severity === LogLevel.Trace)
            ? LogLevel.Trace
            : LogLevel.Debug

    const fits = (logMessage: unknown) =>
      Buffer.byteLength(JSON.stringify(logMessage), 'utf8') < CLOUD_WATCH_LOG_EVENT_LIMIT_BYTES

    const logMessage: { steps?: LogRecord[]; trace: TraceData } = {
      trace: this._config.traceData,
      steps: this._config.logOnDemand ? [] : undefined,
    }

    for (const element of this._stack) {
      if (!this._config.logOnDemand) {
        this.write(level([element]), { trace: this._config.traceData, ...element })
        continue
      }

      const next = { ...logMessage, steps: [...(logMessage.steps ?? []), element] }
      if (!fits(next)) {
        this.write(level(logMessage.steps), logMessage)
        logMessage.steps = []
      }
      logMessage.steps!.push(element)
    }

    this.write(level(logMessage.steps), logMessage)
    this._stack = []
  }

  public static state (): { config: LogConfig, stack:Array<LogRecord> } {
    return {
      config: this._config,
      stack: this._stack
    }
  }

  private static write (level: LogLevel, record: { steps?: LogRecord[]; trace: TraceData }) {
    const logMessage = this._config.logAsSingleString
      ? JSON.stringify(record).replaceAll(/(?:\r\n|\r|\n)/g, ' ')
      : record

    switch (+level) {
    case LogLevel.Trace:
      console.trace(logMessage)
      break
    case LogLevel.Warning:
      console.warn(logMessage)
      break
    case LogLevel.Error:
      console.error(logMessage)
      break
    default:
      console.log(logMessage)
      break
    }
  }

  private static safeSerialize (data?: unknown): Record<string, unknown> | undefined {
    if (data == null) {
      return undefined
    }
    const seen = new WeakSet()
    return JSON.parse(
      JSON.stringify(data, (_key, value) => {
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
