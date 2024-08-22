import fs from 'fs'
import { isArray, isNil } from 'lodash'
import 'moment'
import path from 'path'
import winston, { Logger, createLogger, format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { env } from '../config'
const { combine, timestamp, printf } = format
require('moment')

export class LoggerService {
  private static instance: LoggerService
  public logger: { error: Function; debug: Function; info: Function } =
    {
      error: (message: string, ...meta: any[]) => this.log.error(`${message}${this.createProperMessage(meta)}`),
      debug: (message: string, ...meta: any[]) => this.log.debug(`${message}${this.createProperMessage(meta)}`),
      info: (message: string, ...meta: any[]) => this.log.info(`${message}${this.createProperMessage(meta)}`)
    }

  private log: Logger

  constructor() {
    const file = path.join(__dirname, '../../../logs')
    if (!fs.existsSync(file))
      fs.mkdirSync(file)

    const myFormat = printf(({ level, message }: any) => JSON.stringify({
      timestamp: new Date().toUTCString(),
      message: message,
      level: level
    }))
    this.log = createLogger({
      format: combine(
        timestamp(),
        myFormat
      ),
      transports: [
        new (winston.transports.Console)(env.consoleTransportOptions),

        // new files will be generated each day, the date patter indicates the frequency of creating a file.

        new DailyRotateFile({
          filename: '/debug-%DATE%.log' as unknown as undefined,
          dirname: file,
          level: 'debug',
          options: { flags: 'a', mode: 0o777 },
          datePattern: env.logOption.datePattern,
          maxFiles: 200,
          maxSize: 1024 * 1024 * 10
        }),
        new DailyRotateFile({
          filename: '/errors-%DATE%.log' as unknown as undefined,
          dirname: file,
          level: 'error',
          datePattern: env.logOption.datePattern,
          maxFiles: 200,
          options: { flags: 'a', mode: 0o755 },
          maxSize: 1024 * 1024 * 10
        })
      ]
    })

    this.setLoggerMethod()
  }

  private getData = (data?: any): string => {
    if (isArray(data) && data.length > 0) {
      const object = data[0]
      return this.getSingleData(object)
    } else
      return this.getSingleData(data)
  }

  private jsonStringy(object: any) {
    try {
      return JSON.stringify(object)
    } catch {
      return object
    }
  }

  private getSingleData = (object?: any): string => {
    // eslint-disable-next-line no-console
    console.log('getSingleData', object)
    if (object instanceof Error)
      return object as any
    else if (!isNil(object) && typeof object === 'object' && Object.keys(object).length > 0)
      return this.jsonStringy(object)
    else if (!isNil(object))
      return object
    else
      return ''
  }

  private createProperMessage(...meta: any[]): string {
    let message = ''
    for (const data of meta)
      message = `${message}${this.getData(data)}`

    return message
  }

  private setLoggerMethod() {
    this.logger = {
      error: (message: string, ...meta: any[]) => this.log.error(`${message}${this.createProperMessage(meta)}`),
      debug: (message: string, ...meta: any[]) => this.log.debug(`${message}${this.createProperMessage(meta)}`),
      info: (message: string, ...meta: any[]) => this.log.info(`${message}${this.createProperMessage(meta)}`)
    }
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
