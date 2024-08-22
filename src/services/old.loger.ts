import { addColors, createLogger, format, Logger, transports } from 'winston'
import { env } from '../config'

export class OldLoggerService {
  logger: Logger
  commonTransport = [new transports.Console(env.consoleTransportOptions)]

  constructor() {
    addColors({})
    this.logger = createLogger({
      level: 'info',
      silent: false,
      exitOnError: false,
      format: format.combine(format.metadata({ key: 'metadata' }), format.json()),
      transports: this.commonTransport,
      exceptionHandlers: []
    })
  }
}
