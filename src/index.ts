/* eslint-disable no-console */

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { Application, Request, Response } from 'express'
import helmet from 'helmet'
import { createServer, IncomingMessage } from 'http'
import morgan from 'morgan'
import path from 'path'
import { initializeMiddleware, Middleware20, SwaggerSecurityCallback } from 'swagger-tools'
import swaggerDocument from '../api/swagger/swagger.json'
import { env } from './config'
import { RequestInterception } from './interceptors'
import { MigrationObserver } from './observers/migration.observer'
import { swaggerUi } from './provider'
import { CorsProvider } from './provider/cors'
import { LoggerService } from './services/logger.service'
const log = LoggerService.Instance
const migrationObserver = new MigrationObserver()
const app: Application = express()
swaggerDocument.host = env.SWAGGER_HOST

// const options = {
//   swaggerFile: ['../api/swagger/swagger.json', './path/to/swagger2.json']
// }
initializeMiddleware(swaggerDocument, (middleware: Middleware20) => {
  migrationObserver.start()
  app.use(middleware.swaggerMetadata())

  app.use(middleware.swaggerSecurity({
    Bearer: function (_request: IncomingMessage, _securityDefinition: any, _scopes: string | string[], next: SwaggerSecurityCallback) {
      next()
    }
  }))

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')

  new CorsProvider().corsRequest(app)
  // new core().corsConfiguration(app);

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'jade')
  app.use(middleware.swaggerUi())
  swaggerUi(app, swaggerDocument)
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))
  app.disable('x-powered-by')
  app.use(helmet(env.helmetConfig))
  app.use(middleware.swaggerValidator({ validateResponse: false }))
  new RequestInterception().requestInterception(app)
  app.use(middleware.swaggerRouter({ useStubs: false, controllers: path.join(__dirname, 'controllers') }))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: any, _request: Request, response: Response, _next: Function) => {
    if (typeof error !== 'object')
      // If the object is not an Error, create a representation that appears to be
      error = {
        message: String(error) // Coerce to string
      }
    else
      // Ensure that err.message is enumerable (It is not by default)
      Object.defineProperty(error, 'message', { enumerable: true })

    Object.defineProperty(error, 'message', { enumerable: true })

    // Return a JSON representation of #/definitions/ErrorResponse
    response.setHeader('Content-Type', 'application/json')
    response.status(400).send({ message: JSON.stringify(error) })

    // // format errors
    // response.status(get(error, 'status') ?? 500).send({
    //   message: get(error, 'message'),
    //   errors: get(error, 'errors')
    // })
  })
  const port = env.PORT
  createServer(app).listen(port)
  // app.listen(port)

  log.logger.info(`your server is running on Port ${port}`)
})
process.on('unhandledRejection', (reason: {} | null | undefined) => {
  log.logger.error('unhandledRejection. Something went wrong with application. Blame this ', reason)
}).on('uncaughtException', (err: Error) => {
  console.log('uncaughtException', err)
  log.logger.error('uncaughtException. Something went wrong with application. Blame this ', err)
})
process.on('warning', (warning: any) => {
  console.log('I am warning name ', warning.name)
  console.log('I am warning message ', warning.message)
  console.log('I am warning stack', warning.stack)
})
