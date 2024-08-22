
import axios, { AxiosRequestConfig } from 'axios'
import { isNil } from 'lodash'
import { env } from '../config'
import { TokenRepository } from '../database/repository'
import { EmailRequest, EmailTemplateRequest, PasswordMailRequest, SharedResourceEmailTemplateRequest, Tokens } from '../typings'
import { badRequest, generateRandomOTP } from '../utils'
import { EmailService } from './aws/aws.email.service'
import { EmailTemplateService } from './emailTemplate.service '
import { EncryptionService } from './encryption.service'
import { LoggerService } from './logger.service'

export class NotificationService {
  private static instance: NotificationService
  public readonly smsBaseUrl: string
  private readonly messageApiKey: string
  private readonly messageSender: string
  private readonly otpTemplateId: string
  private readonly loggerService: LoggerService
  private readonly tokenRepository: TokenRepository
  private readonly emailService: EmailService
  constructor() {
    this.smsBaseUrl = env.MESSAGE_BASE_URL ?? ''
    this.messageApiKey = env.MESSAGE_API_KEY ?? ''
    this.messageSender = env.MESSAGE_SENDER ?? ''
    this.otpTemplateId = env.OTP_TEMPLATED_ID ?? ''
    this.tokenRepository = new TokenRepository()
    this.loggerService = new LoggerService()
    this.emailService = new EmailService()
  }

  async sendOTP(
    { phone, expiry = 30 }:
      { phone: string; username: string; expiry?: number }
  ): Promise<void> {
    // const waitMessage = `wait for ${expiry / 1000} secs and try again`

    // const token = await this.getToken(phone)
    const otp = env.APP_TESTING_PHONE === phone || env.TEST_MODE
      ? env.APP_TESTING_OTP
      : generateRandomOTP(env.OTP_LENGTH) // !isNil(token) ? token.verifyCode : generateRandomOTP(env.OTP_LENGTH)
    const body = `Dear Customer,
${otp} is your one-time password (OTP). Please enter the OTP to proceed.
Thank you,
Team Laxman`
    if (!env.TEST_MODE && env.APP_TESTING_PHONE !== phone)
      await this.sendSms(phone, body, this.otpTemplateId)
    // eslint-disable-next-line no-console
    else console.log('otp', otp)

    await this.setToken(expiry, otp, phone)
  }

  async getToken(verificationKey: string): Promise<Tokens> {
    return this.tokenRepository.getToken(verificationKey)
  }

  async setToken(expiry: number, verifyCode: string, verificationKey: string): Promise<void> {
    const otpExpires = new Date()
    otpExpires.setMinutes(otpExpires.getMinutes() + expiry)
    await this.tokenRepository.upsertToken({ verificationKey, verifyCode, otpExpires })
  }

  async sendPasswordMail({ email, username, expiry = 30, type, adminEmail }: PasswordMailRequest): Promise<void> {
    // const waitMessage = `wait for ${expiry / 1000} secs and try again`
    const otp = generateRandomOTP(env.OTP_LENGTH)

    // eslint-disable-next-line no-console
    console.log('env.EMAIL_TEST_MODE', env.EMAIL_TEST_MODE)

    if (!env.EMAIL_TEST_MODE)
      await this.sendEmailTemplate(EmailTemplateService.Instance.getTemplateRequest(type)({ username, otp, email, adminEmail }))
    // eslint-disable-next-line no-console
    else console.log('otp', EncryptionService.Instance.encrypt(otp))

    await this.setToken(expiry, otp, email)
  }

  async sendSetPasswordMail(
    { email, username, expiry = 30 }:
      { email: string; username: string; expiry?: number }
  ): Promise<void> {
    // const waitMessage = `wait for ${expiry / 1000} secs and try again`
    const otp = generateRandomOTP(env.OTP_LENGTH)

    const html = `<h1>Dear ${username}, your OTP for verification is ${otp}. Valid for 30 minutes.</h1>`

    if (!env.EMAIL_TEST_MODE)
      await this.sendEmailTemplate({ email, html, subject: 'Reset Password Otp' })
    // eslint-disable-next-line no-console
    else console.log('otp', otp)

    await this.setToken(expiry, otp, email)
  }

  async sharedResourceMail(data: SharedResourceEmailTemplateRequest): Promise<void> {
    if (!env.EMAIL_TEST_MODE)
      await this.sendEmailTemplate(EmailTemplateService.Instance.getTemplateRequest('SHARED_RESOURCE')(data))
    // eslint-disable-next-line no-console
    else console.log('otp')
  }

  private async sendSms(phone: string, message: string, tempId: string): Promise<void> {
    const url = `${this.smsBaseUrl}?apikey=${this.messageApiKey}&type=TEXT&sender=${this.messageSender}&mobile=
    ${phone}&message=${message}&tempId=${tempId}`
    const headers = { 'Content-Type': 'application/json' }
    const requestConfig: AxiosRequestConfig = { headers }
    const { data, status } = await axios.get<string>(url, requestConfig)
    if (status !== 200 || (!isNil(data) && data.includes('ERR'))) {
      this.loggerService.logger.error('error during send otp.', data)
      throw badRequest('error during send otp')
    }
  }

  private async sendEmailTemplate({ email, html, subject }: EmailTemplateRequest): Promise<void> {
    const request: EmailRequest = {
      to: [email],
      subject,
      message: '',
      html
    }
    await this.emailService.sendEmail(request)
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
