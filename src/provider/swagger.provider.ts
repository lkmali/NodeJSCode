import { Application } from 'express'
import { JsonObject, serve, setup } from 'swagger-ui-express'
export const swaggerUi = (app: Application, swaggerDocument: JsonObject) => {
  app.use('/api-docs', serve, setup(swaggerDocument, {
    swaggerOptions: {
      authAction: {
        JWT: {
          name: 'JWT',
          schema: { type: 'apiKey', in: 'header', name: 'Authorization', description: '' },
          value: 'Bearer <JWT>'
        }
      }
    }
  }))
}
