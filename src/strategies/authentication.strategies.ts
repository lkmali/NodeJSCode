import { Request } from 'express'
import { UserProfile } from '../typings'

export abstract class AuthenticationStrategy {
    abstract authenticate (request: Request): Promise<UserProfile>
}
