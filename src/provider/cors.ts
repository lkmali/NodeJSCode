import cors from 'cors'
import { Application, Request, Response } from 'express'
import { isNil } from 'lodash'
import { env } from '../config'
export class CorsProvider {
 options: cors.CorsOptions = {
   credentials: true,
   methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
   origin: (origin: any, callback: Function) => {
     if (this.isDomainAllowed(origin, env.ALLOWED_ORIGINS))
       callback(null, true)
     else
       callback(null, false)
   },
   preflightContinue: false
 }

 isDomainAllowed (originRequest: string, allowedDomains: string[]): boolean {
   let index
   let domain
   if (allowedDomains.indexOf('*') !== -1)
     return true

   for (index = 0; index !== allowedDomains.length; index++) {
     domain = allowedDomains[index]
     if (!isNil(originRequest) && originRequest.indexOf(domain) !== -1)
       return true
   }
   return false
 }

 corsRequest = (app: Application) => {
   app.use(cors<Request>(this.options))
   app.use((request: Request, response: Response, next: Function) => {
     let allowedDomainName
     if (request.method === 'OPTIONS')
       return response.status(405).end()
     else {
       //  response.setHeader('Access-Control-Allow-Origin', request.headers.origin ?? env.ALLOWED_ORIGINS)
       allowedDomainName = this.isDomainAllowed(request.headers.origin as string, env.ALLOWED_ORIGINS) ? request.headers.origin : null
       if (!isNil(allowedDomainName))
         response.header('Access-Control-Allow-Origin', allowedDomainName)

       response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
       response.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET')
       response.header('X-Frame-Options', 'DENY')
       next()
     }
   })
 }
}
