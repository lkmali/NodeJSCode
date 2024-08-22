import { registry } from 'dependencyjs'
import { Request, Response } from 'express'
import { get, isNil } from 'lodash'
import { LoggerService } from '../services/logger.service'
import { AuthenticationStrategy } from '../strategies'
import { AuthenticationStrategyType, ResponseData, UserProfile } from '../typings'
import { AuthorizationProvider } from './authorization.provider'
const authenticate = async (request: Request, auth: AuthenticationStrategyType): Promise<UserProfile> => {
  const authService: AuthenticationStrategy = registry.resolve(AuthenticationStrategy, auth)
  return authService.authenticate(request)
}
const getRequestParams = (request: Request): { [key: string]: any } => {
  const swaggerParams = get(get(request, 'swagger', {}), 'params', {}) as any
  const params: { [key: string]: any } = {}

  for (const value in swaggerParams)
    if (Object.prototype.hasOwnProperty.call(swaggerParams, value))
      params[value] = get(swaggerParams[value], 'value', null)

  return params
}
const getHeader = (request: Request) => {
  const headers = request.headers
  const body = request.body
  const query = request.query as { [key: string]: string | boolean }

  if (!isNil(body) && !isNil(body['userCurrentAddress']) && body['userCurrentAddress'].length > 0)
    headers['address'] = body['userCurrentAddress']

  if (Object.prototype.hasOwnProperty.call(query, 'userCurrentAddress') && !isNil(query['userCurrentAddress']))
    headers['address'] = query['userCurrentAddress'] as string

  return headers
}
export const send = (next: Function, data: ResponseData) => async (request: Request, response: Response) => {
  const log = LoggerService.Instance
  const authorizationProvider = new AuthorizationProvider()
  try {
    let userProfile = {}
    request['params'] = getRequestParams(request)
    request['headers'] = getHeader(request)
    const { auth = null, async = true, roles = [] } = data
    if (!isNil(auth))
      userProfile = await authenticate(request, auth)

    if (roles.length > 0)
      authorizationProvider.authorization(roles, userProfile as UserProfile)

    const result = async ? await next({ request, response, userProfile }) : next({ request, response, userProfile })
    response.status(200).json(result)
  } catch (error: any) {
    log.logger.error('error', error)
    const statusCode = Object.prototype.hasOwnProperty.call(error, 'statusCode') ? error.statusCode : 500
    const message = Object.prototype.hasOwnProperty.call(error, 'statusCode') ? error.error : { message: 'Internal server error' }
    response.status(statusCode).send(message)
  }
}
