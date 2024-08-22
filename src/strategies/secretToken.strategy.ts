import { Request } from 'express'
import { env } from '../config'
import { unauthorized } from '../utils'
import { AuthenticationStrategy } from './authentication.strategies'

export class SecretTokenAuthenticationStrategy implements AuthenticationStrategy {
  authenticate(request: Request): any {
    const token: string = this.extractCredentials(request)
    if (env.API_ACCESS_TOKEN === token)
      return { userId: token } as any

    throw unauthorized('wrong token')
  }

  extractCredentials(request: Request): string {
    switch (true) {
      case request.headers.authorization === undefined:
        throw unauthorized('Authorization header not found.')
      default:
        return request.headers.authorization as string
    }
  }
}
