import {
  LogConfig,
  LogConfigBuilder,
  LogLevel,
  LogRecord,
  TraceData,
  TraceDataBuilder,
} from './types'

export class SimpleLogger {
  private static config: LogConfig
  private static traceData: TraceData

  public static setup(config?: Partial<LogConfig>, traceData?: TraceData): void {
    this.config = new LogConfigBuilder().fromDefaults(config).state()
    this.traceData = new TraceDataBuilder().fromDefaults(traceData).state()
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

  public static log(severity: LogLevel, message: string, details?: Record<string, unknown>): void {
    if(this.config == null) {
      throw new Error('SimpleLogger.setup() must be called before logging.')
    }

    if (severity < this.config.minLogLevel) {
      return
    }

    const record: LogRecord = {
      severity: LogLevel[severity],
      level: severity,
      timestamp: new Date().toISOString(),
      message,
      details
    }

    const logMessage: any = this.config.logAsSingleString
      ? JSON.stringify(record).replaceAll(/(?:\r\n|\r|\n)/g, ' ')
      : JSON.stringify(record)

     switch (+severity) {
      case LogLevel.Trace:
        console.trace(logMessage)
        break
      case LogLevel.Warning:
        console.warn(logMessage)
        break
      case LogLevel.Critical:
      case LogLevel.Error:
        console.error(logMessage)
        break
      default:
        console.log(logMessage)
        break;
     }
  }

  public static state(): { config: LogConfig; stack: Array<LogRecord>, trace: TraceData } {
    return {
      config: this.config,
      stack: this.stack,
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
        if
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
