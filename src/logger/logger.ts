import { LogConfig, LogConfigBuilder, LogLevel, LogRecord, TraceData } from './types'

export class SimpleLogger {
  private static config: LogConfig
  private static traceData: TraceData
  private static stack: Array<LogRecord> = []

  public static setup (config?: Partial<LogConfig>, traceData?: TraceData): void {
    this.stack = []
    this.config = new LogConfigBuilder().fromDefaults(config).state()
    this.traceData ??= traceData ?? {
      traceId: process.env[DEFAULT_LOG_TRACE_ID_ENV_NAME] ?? `${crypto.randomUUID()}`,
    }
  }

  public static info (message: string, data?: Record<string, unknown>): void {
    this.addLogRecord(LogLevel.Information, message, data)
  }

  public static trace (message: string, data?: Record<string, unknown>): void {
    this.addLogRecord(LogLevel.Trace, message, data)
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
    if (severity < this.config.minLogLevel) {
      return
    }

    const record: LogRecord = { severity, message, details }

    this.stack.push(record)

    if (!this.config.logOnDemand) {
      this.flash()
    }
  }

  public static flash (): void {
    if (this.stack.length === 0) {
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
      trace: this.config.traceData,
      steps: this.config.logOnDemand ? [] : undefined,
    }

    for (const element of this.stack) {
      if (!this.config.logOnDemand) {
        this.write(level([element]), { trace: this.config.traceData, ...element })
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
    this.stack = []
  }

  public static state (): { config: LogConfig, stack:Array<LogRecord> } {
    return {
      config: this.config,
      stack: this.stack
    }
  }

  private static write (level: LogLevel, record: { steps?: LogRecord[]; trace: TraceData }): void {
    const logMessage = this.config.logAsSingleString
      ? JSON.stringify(record).replaceAll(/(?:\r\n|\r|\n)/g, ' ')
      : JSON.stringify(record)

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
