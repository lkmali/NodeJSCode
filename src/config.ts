import { load } from 'dotenv-extended'
import helmet from 'helmet'
import { Algorithm } from 'jsonwebtoken'
import winston from 'winston'
import { ConsoleTransportOptions } from 'winston/lib/winston/transports'
import { ApplicationConfig, DataSourceSqlOptions, FirebaseConfig } from './typings'

const environment: ApplicationConfig = load({ errorOnExtra: true, errorOnRegex: true, includeProcessEnv: true })

class EnvironmentConfig {
  JWT_STRATEGY_NAME = 'jwtAuth'
  BASIC_STRATEGY_NAME = 'basicAuth'
  OTP_STRATEGY_NAME = 'otpAuth'
  GUEST_JWT_STRATEGY_NAME = 'guestJwtAuth'
  EMAIL_STRATEGY_NAME = 'emailAuth' // secretToken
  SECRET_TOKEN_STRATEGY_NAME = 'secretToken'
  saveProfileImageFolder = 'profile-image'
  projectFileFolder = 'projects-files'
  NODE_ENV: string
  PORT: number
  SERVER_URL: string
  APP_TESTING_PHONE: string
  APP_TESTING_OTP: string
  SWAGGER_HOST: string
  SQL_HOST: string
  SQL_USER: string
  SQL_PASSWORD: string
  SQL_PORT: number
  DIALECT = 'postgres'
  MESSAGE_BASE_URL?: string
  MESSAGE_API_KEY?: string
  OTP_TEMPLATED_ID?: string
  MESSAGE_SENDER?: string
  JWT_ALGO: Algorithm
  PASSWORD_ROUNDS = 10
  JWT_ISSUER: string
  JWT_AUDIENCE: string
  JWT_EXPIRES_IN: number
  OTP_LENGTH = 6
  TEST_MODE: boolean
  EMAIL_TEST_MODE: boolean
  SQL_LOG: boolean
  ALTER_TABLE: boolean
  SQL_DATABASE: string
  ALLOWED_ORIGINS: string[]
  NETWORK_WEBHOOK_SECRET: string
  FROM_EMAIL: string
  AWS_REGION: string
  AWS_BUCKET_NAME: string
  AWS_ACCESS_KEY_ID: string
  SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE: number
  AWS_SECRET_ACCESS_KEY: string
  ENCRYPTION_KEY: string
  ENCRYPTION_IV: string
  CLOUD_FRONT_PRIVATE_KEY: string
  AWS_CLOUD_FRONT_BASE_URL: string
  ENCRYPTION_ALGORITHM: string
  SERVER_UI_URL: string
  WORK_FLOW_SERVICE_BASE_URL: string
  API_ACCESS_TOKEN: string
  WHATSAPP_PHONE_NUMBER_ID: string
  WHATSAPP_API_VERSION: string
  WHATSAPP_BASE_URL: string
  WHATSAPP_ACCESS_TOKEN: string
  configSqlDb: DataSourceSqlOptions
  consoleTransportOptions: ConsoleTransportOptions
  awsEmailSmtp: any
  helmetConfig: Parameters<typeof helmet>[0]
  sequelizeConfig = {
    excludedDefaultAttributes: ['createdBy', 'updatedBy', 'orgId'],
    excludedDefaultAttributesForUser: ['createdBy', 'updatedBy', 'orgId', 'projectOwnerId'],
    excludedUserAttributes: ['password'],
    excludedUserAttributesOfRole: ['createdAt', 'updatedAt', 'password', 'userName', 'secretKey', 'isActive', 'isBlocked',
      'unsuccessfulAttempt', 'LastPasswordUpdatedDate', 'LastLoginDate', 'orgId', 'profileId'
    ]
  }

  logOption: any = {
    level: 'debug',
    maxFiles: 120,
    datePattern: 'DD-MM-YYYY'
  }

  supportFileType = ['pdf', 'video', 'audio', 'image', 'kml', 'xlsx', 'word', 'ppt', 'csv']
  supportFieldType = ['number', 'string', 'boolean', 'date', 'time', 'dateTime', 'image', 'video', 'audio', 'pdf',
    'xlsx', 'word', 'ppt', 'csv']

  firebaseConfig: FirebaseConfig

  constructor(config: ApplicationConfig) {
    this.NODE_ENV = config?.NODE_ENV ?? 'dev'
    this.PORT = config?.PORT ?? 3000
    this.SQL_HOST = config.SQL_HOST ?? 'localhost'
    this.TEST_MODE = (config?.TEST_MODE ?? false).toString() === 'true' ?? false
    this.EMAIL_TEST_MODE = (config?.EMAIL_TEST_MODE ?? false).toString() === 'true' ?? false
    this.SQL_PORT = config?.SQL_PORT ?? 5432
    this.SQL_LOG = (config?.SQL_LOG ?? false).toString() === 'true' ?? false
    this.ALTER_TABLE = (config?.ALTER_TABLE ?? false).toString() === 'true' ?? false
    this.SQL_USER = config?.SQL_USER ?? ''
    this.SQL_PASSWORD = config?.SQL_PASSWORD ?? ''
    this.SQL_DATABASE = config?.SQL_DATABASE ?? ''
    this.MESSAGE_BASE_URL = String(config?.MESSAGE_BASE_URL)
    this.MESSAGE_API_KEY = String(config?.MESSAGE_API_KEY)
    this.OTP_TEMPLATED_ID = String(config?.OTP_TEMPLATED_ID)
    this.MESSAGE_SENDER = String(config?.MESSAGE_SENDER)
    this.SWAGGER_HOST = config?.SWAGGER_HOST ?? 'localhost:3000'
    this.SERVER_URL = config?.SERVER_URL ?? 'http://localhost:3000'
    this.JWT_ALGO = config?.JWT_ALGO ?? 'HS256'
    this.JWT_EXPIRES_IN = Number(config?.JWT_EXPIRES_IN)
    this.NETWORK_WEBHOOK_SECRET = String(config.NETWORK_WEBHOOK_SECRET)
    this.ALLOWED_ORIGINS = config.ALLOWED_ORIGINS ?? ['*']
    this.JWT_ISSUER = String(config?.JWT_ISSUER)
    this.JWT_AUDIENCE = String(config?.JWT_AUDIENCE)
    this.FROM_EMAIL = String(config?.FROM_EMAIL)
    this.AWS_ACCESS_KEY_ID = String(config?.AWS_ACCESS_KEY_ID)
    this.AWS_SECRET_ACCESS_KEY = String(config?.AWS_SECRET_ACCESS_KEY)
    this.AWS_REGION = String(config?.AWS_REGION)
    this.AWS_BUCKET_NAME = String(config?.AWS_BUCKET_NAME)
    this.AWS_CLOUD_FRONT_BASE_URL = String(config?.AWS_CLOUD_FRONT_BASE_URL)
    this.ENCRYPTION_KEY = String(config?.ENCRYPTION_KEY)
    this.ENCRYPTION_IV = String(config?.ENCRYPTION_IV)
    this.ENCRYPTION_ALGORITHM = String(config?.ENCRYPTION_ALGORITHM)
    this.SERVER_UI_URL = String(config?.SERVER_UI_URL)
    this.WORK_FLOW_SERVICE_BASE_URL = String(config?.WORK_FLOW_SERVICE_BASE_URL)
    this.SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE = Number(config?.SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE ?? 300)
    this.PASSWORD_ROUNDS = Number(config.PASSWORD_ROUNDS ?? this.PASSWORD_ROUNDS)
    this.CLOUD_FRONT_PRIVATE_KEY = Buffer.from(String(config?.CLOUD_FRONT_PRIVATE_KEY), 'base64').toString('utf-8')
    this.APP_TESTING_PHONE = String(config?.APP_TESTING_PHONE)
    this.APP_TESTING_OTP = String(config?.APP_TESTING_OTP)
    this.WHATSAPP_PHONE_NUMBER_ID = String(config?.WHATSAPP_PHONE_NUMBER_ID)
    this.API_ACCESS_TOKEN = String(config?.API_ACCESS_TOKEN)
    this.WHATSAPP_API_VERSION = String(config?.WHATSAPP_API_VERSION)
    this.WHATSAPP_BASE_URL = String(config?.WHATSAPP_BASE_URL)
    this.WHATSAPP_ACCESS_TOKEN = String(config?.WHATSAPP_ACCESS_TOKEN)

    this.configSqlDb = {
      database: this.SQL_DATABASE,
      dialect: 'postgres',
      host: this.SQL_HOST,
      port: this.SQL_PORT,
      username: this.SQL_USER,
      password: this.SQL_PASSWORD,
      logging: (str: string) => {
        if (this.SQL_LOG === true)
          // eslint-disable-next-line no-console
          console.log(str)
      },
      define: {
        freezeTableName: true
      }
    }

    this.awsEmailSmtp = {
      host: String(config?.AWS_SMTP_DOMAIN ?? ''),
      port: Number(config.AWS_SMTP_PORT ?? 587),
      secure: true,
      auth: {
        user: config.AWS_SMTP_USER,
        pass: config.AWS_SMTP_PASSWORD
      }
    }

    this.consoleTransportOptions = {
      level: 'info',
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }

    this.firebaseConfig = {
      type: config?.FIREBASE_TYPE,
      projectId: config?.FIREBASE_PROJECT_ID,
      privateKeyId: config?.FIREBASE_PRIVATE_KEY_ID,
      privateKey: Buffer.from(String(config?.FIREBASE_PRIVATE_KEY), 'base64').toString('utf-8'),
      clientEmail: config?.FIREBASE_CLIENT_EMAIL,
      clientId: config?.FIREBASE_CLIENT_ID,
      authUri: config?.FIREBASE_AUTH_URI,
      tokenUri: config?.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: config?.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: config?.FIREBASE_CLIENT_X509_CERT_URL,
      databaseURL: config?.FIREBASE_DB_URL
    }

    this.helmetConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
          styleSrcElem: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net'],
          scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net'],
          // objectSrc: ["'self'"],
          fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com', 'data:'],
          upgradeInsecureRequests: [],
          reportUri: '/report-violation',
          connectSrc: ["'self'"]
        }
      },
      referrerPolicy: {
        policy: 'same-origin'
      }
    }
  }
}

export const env = new EnvironmentConfig(environment)
