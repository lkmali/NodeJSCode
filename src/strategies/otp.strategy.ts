import { Request } from 'express'
import { get, isNil } from 'lodash'
import { TokenRepository } from '../database/repository'
import { UserService } from '../services'
import { UserProfile } from '../typings'
import { unauthorized } from '../utils'
import { AuthenticationStrategy } from './authentication.strategies'

export class OtpAuthenticationStrategy implements AuthenticationStrategy {
  private readonly tokenRepository: TokenRepository
  private readonly userService: UserService
  constructor() {
    this.tokenRepository = new TokenRepository()
    this.userService = new UserService()
  }

  async authenticate(request: Request): Promise<UserProfile> {
    const credentials = get(request, 'body', {}) as { otp: string; phone: string }
    const token = await this.tokenRepository.getTokenWithOtp(credentials.phone, credentials.otp)
    if (isNil(token))
      throw unauthorized('invalid otp')

    const currentTime = new Date()
    if (token.otpExpires < currentTime)
      throw unauthorized('invalid otp')

    await this.tokenRepository.removeToken(token.id)
    return this.userService.prepareUserProfileData(credentials.phone)
  }
}
