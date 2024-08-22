import { registry } from 'dependencyjs'
import { env } from '../config'
import { DatabaseInitializer } from '../database/DatabaseInitializer'
import { LoggerService, SeederService } from '../services'
import { AuthenticationStrategy, BasicAuthenticationStrategy, EmailAuthenticationStrategy, GuestJwtAuthenticationStrategy, JWTAuthenticationStrategy, OtpAuthenticationStrategy, SecretTokenAuthenticationStrategy } from '../strategies'

export class MigrationObserver {
  private readonly seederService: SeederService
  constructor() {
    this.seederService = new SeederService()
  }

  start(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.migrateSchema()
    this.registerAuthenticationStrategy()
  }

  async migrateSchema(): Promise<void> {
    LoggerService.Instance.logger.info('Migration start.')
    await DatabaseInitializer.getInstance().setupDatabaseProviders()
    await this.seederService.saveSeedData()
    LoggerService.Instance.logger.info('Migration complete.')
  }

  registerAuthenticationStrategy() {
    registry.register(AuthenticationStrategy, new GuestJwtAuthenticationStrategy(), env.GUEST_JWT_STRATEGY_NAME)
    registry.register(AuthenticationStrategy, new OtpAuthenticationStrategy(), env.OTP_STRATEGY_NAME)
    registry.register(AuthenticationStrategy, new JWTAuthenticationStrategy(), env.JWT_STRATEGY_NAME)
    registry.register(AuthenticationStrategy, new BasicAuthenticationStrategy(), env.BASIC_STRATEGY_NAME)
    registry.register(AuthenticationStrategy, new EmailAuthenticationStrategy(), env.EMAIL_STRATEGY_NAME)
    registry.register(AuthenticationStrategy, new SecretTokenAuthenticationStrategy(), env.SECRET_TOKEN_STRATEGY_NAME)
  }
}
