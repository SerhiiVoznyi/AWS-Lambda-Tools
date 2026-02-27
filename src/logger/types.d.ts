import crypto from 'node:crypto'
import { LogConfig, TraceData } from './types.d'

export const DEFAULT_LOG_TRACE_ID_ENV_NAME = '_X_AMZN_TRACE_ID'

/**
 * Trace Date type is describe the minimum params required for log record tracing
 * - traceId - unique log session id. Helps distinguish log records between lambda executions.
 */
export interface TraceData {
  [key: string]: string
  traceId: string
}

export class TraceDataBuilder {
  private traceData: TraceData = {
    traceId: cripto.randomUUID(),
  }

  public fromDefaults(traceData?: Partial<TraceData>): this {
    const input = traceData ?? {}
    this.traceData = {
      ...input,
      traceId:
        input.traceId ||
        process.env[DEFAULT_LOG_TRACE_ID_ENV_NAME] ||
        `session-${crypto.randomUUID()}`,
    }
    return this
  }

  public state(): TraceData {
    return this.traceData
  }
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
  displayName: string
  minLogLevel: LogLevel
  logAsSingleString?: boolean
  logEventLimitInBytes?: number
  sensitiveDataKeys?: Array<string>
}

export function initConfig(overrides?: Partial<LogConfig>): LogConfig {
  const parseBool = (value?: string, defaultValue = false) =>
    value?.toLowerCase() === 'true' ?? defaultValue

  const parseNumber = (value?: string, defaultValue: number = 0) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : defaultValue
  }

  const parseLogLevel = (value?: string, defaultLevel: LogLevel = LogLevel.Information) => {
    if (!value) return defaultLevel
    const key = value as keyof typeof LogLevel
    if (key in LogLevel) return LogLevel[key]
    return defaultLevel
  }

  let sensitiveDataKeys: Array<string> = ['authorization', 'cookie', 'cookies']
  if (process.env.LOG_SENSITIVE_DATA_KEYS) {
    sensitiveDataKeys = process.env.LOG_SENSITIVE_DATA_KEYS.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
  }
  if (Array.isArray(overrides?.sensitiveDataKeys)) {
    sensitiveDataKeys = [...sensitiveDataKeys, ...overrides.sensitiveDataKeys]
  }

  const config: LogConfig = {
    displayName:
      overrides?.displayName ??
      process.env.AWS_LAMBDA_FUNCTION_NAME ??
      process.env.LOG_SERVICE_NAME ??
      'unknown',
    minLogLevel:
      overrides?.minLogLevel ?? parseLogLevel(process.env.LOG_MIN_LEVEL, LogLevel.Information),
    logAsSingleString:
      overrides?.logAsSingleString ?? parseBool(process.env.LOG_AS_SINGLE_STRING, false),
    logEventLimitInBytes:
      overrides?.logEventLimitInBytes ??
      parseNumber(process.env.LOG_EVENT_LIMIT_IN_BYTES, DEFAULT_LOG_EVENT_LIMIT_BYTES),
    sensitiveDataKeys,
  }

  return config
}

export interface LogRecord {
  severity: string
  message: string
  timestamp: string
  level: LogLevel
  trace?: TraceData
  details?: Record<string, unknown>
}
