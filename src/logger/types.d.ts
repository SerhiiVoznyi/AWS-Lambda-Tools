import { LogConfig, TraceData } from './types.d';

export const DEFAULT_LOG_TRACE_ID_ENV_NAME = '_X_AMZN_TRACE_ID'
export const DEFAULT_LOG_EVENT_LIMIT_BYTES = 256 * 1024

/**
 * Trace Date type is describe the minimum params required for log record tracing
 * - traceId - unique log session id. Helps distinguish log records between lambda executions.
 */
export interface TraceData{
  [key: string]: string
  traceId: string
}

export class TraceDataBuilder {
  private traceData: TraceData


}

/**
 * Log message Severity level
 * Source: https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loglevel?view=dotnet-plat-ext-5.0
 * 0 -   Trace - Logs that contain the most detailed messages.These messages may contain sensitive application data.
 * 1 -   Debug - Logs that are used for interactive investigation during development.
 * 2 -   Information - Logs that track the general flow of the application.These logs should have long-term value.
 * 3 -   Warning - Logs that highlight an abnormal or unexpected event in the application flow.
 * 4 -   Error - Logs that highlight when the current flow of execution is stopped due to a failure.
 * 5 -   Critical - Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires immediate attention.
 * 6 -   Alert - Explicit severity level that tells reporting framework to alert on this event
 * 100 - None - Not used for writing log messages.Specifies that a logging category should not write any messages.
 */
export enum LogLevel {
  Trace = 0,
  Debug = 1,
  Information = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
  Alert = 6,
  None = 100,
}

export interface LogConfig {
  displayName: string,
  minLogLevel: LogLevel  
  logAsSingleString?: boolean
  logOnDemand?: boolean
  logEventLimitInBytes?: number
}

export class LogConfigBuilder {
  private config: LogConfig = {
    displayName: process.env.AWS_LAMBDA_FUNCTION_NAME ?? 'unknown',
    minLogLevel: LogLevel[process.env.LOG_MIN_LEVEL as keyof typeof LogLevel] ?? LogLevel.Information,
    logAsSingleString: (process.env.LOG_AS_SINGLE_STRING ?? 'false').toLocaleLowerCase() === 'true',
    logOnDemand: (process.env.LOG_ON_DEMAND ?? 'false').toLocaleLowerCase() === 'true',
    logEventLimitInBytes: Number.parseInt(process.env.LOG_EVENT_LIMIT_IN_BYTES) ?? DEFAULT_LOG_EVENT_LIMIT_BYTES,
  }

  public fromDefaults (config?: Partial<LogConfig>): LogConfigBuilder {
    this.config.displayName = config?.displayName ?? this.config.displayName
    this.config.minLogLevel = config?.minLogLevel ??  this.config.minLogLevel
    this.config.logAsSingleString = config?.logAsSingleString ?? this.config.logAsSingleString
    this.config.logOnDemand = config?.logOnDemand ?? this.config.logOnDemand
    this.config.logEventLimitInBytes = config?.logEventLimitInBytes ?? this.config.logEventLimitInBytes
    return this
  }

  public withName (displayName: string): LogConfigBuilder {
    this.config.displayName = displayName
    return this
  }

  public withMinLogLevel (minLogLevel: LogLevel): LogConfigBuilder {
    this.config.minLogLevel = minLogLevel
    return this
  }

  public withLogAsSingleString (logAsSingleString: boolean = true): LogConfigBuilder {
    this.config.logAsSingleString = logAsSingleString
    return this
  }

  public withLogOnDemand (logOnDemand: boolean = true): LogConfigBuilder {
    this.config.logOnDemand = logOnDemand
    return this
  }

  public state (): LogConfig {
    return this.config
  }
}

export interface LogRecord {
  severity: string
  message: string
  timestamp: string
  level: LogLevel
  trace?: TraceData
  details?: Record<string, unknown>
}