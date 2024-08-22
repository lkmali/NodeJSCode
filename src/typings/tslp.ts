import { Request, Response } from 'express'
import { Algorithm } from 'jsonwebtoken'
import { WhereOptions } from 'sequelize/types'
import { Dialect, Options } from 'sequelize/types/sequelize'
import { Actions, Addresses, Organizations, ProjectFormFields, ProjectForms, Projects, ResourceSharing, Roles, Tasks, UserFormFieldData, UserGroups, UserProjectForm, UserSession, UserTasks, Users } from './model'
export interface ApplicationConfig {
  NODE_ENV?: string
  SERVER_URL?: string
  TEST_MODE?: boolean
  EMAIL_TEST_MODE?: boolean
  PORT?: number
  SQL_HOST?: string
  ALTER_TABLE?: boolean
  SQL_PORT?: number
  SQL_LOG?: boolean
  SQL_USER?: string
  SQL_PASSWORD?: string
  SQL_DATABASE?: string
  MESSAGE_BASE_URL?: string
  MESSAGE_API_KEY?: string
  OTP_TEMPLATED_ID?: string
  MESSAGE_SENDER?: string
  SWAGGER_HOST?: string
  JWT_ALGO?: Algorithm
  JWT_EXPIRES_IN?: string | number
  NETWORK_WEBHOOK_SECRET?: string
  ALLOWED_ORIGINS?: string[]
  JWT_ISSUER?: string
  PASSWORD_ROUNDS?: number
  FROM_EMAIL?: string
  JWT_AUDIENCE?: string
  AWS_REGION?: string
  AWS_BUCKET_NAME?: string
  AWS_CLOUD_FRONT_BASE_URL?: string
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  ENCRYPTION_KEY?: string
  ENCRYPTION_IV?: string
  ENCRYPTION_ALGORITHM?: string
  SERVER_UI_URL?: string
  CLOUD_FRONT_PRIVATE_KEY?: string
  SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE?: number
  AWS_SMTP_USER?: string
  AWS_SMTP_PASSWORD?: string
  AWS_SMTP_DOMAIN?: string
  AWS_SMTP_PORT?: number
  APP_TESTING_PHONE?: string
  APP_TESTING_OTP?: string
  WORK_FLOW_SERVICE_BASE_URL?: string
  FIREBASE_TYPE?: string
  FIREBASE_PROJECT_ID?: string
  FIREBASE_PRIVATE_KEY_ID?: string
  FIREBASE_PRIVATE_KEY?: string
  FIREBASE_CLIENT_EMAIL?: string
  FIREBASE_CLIENT_ID?: string
  FIREBASE_AUTH_URI?: string
  FIREBASE_TOKEN_URI?: string
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL?: string
  FIREBASE_CLIENT_X509_CERT_URL?: string
  FIREBASE_DB_URL?: string
  WHATSAPP_PHONE_NUMBER_ID?: string
  WHATSAPP_API_VERSION?: string
  WHATSAPP_BASE_URL?: string
  WHATSAPP_ACCESS_TOKEN?: string
  API_ACCESS_TOKEN?: string
}

export type JWTScopes = Array<'auth' | 'reset_password' | 'verification' | 'intercom' | 'guest'>

export interface JWTAuthenticationStrategyOptions {
  scopes: JWTScopes
}

export type AuthenticationStrategyType = 'jwtAuth' | 'basicAuth' | 'otpAuth' | 'emailAuth' | 'guestJwtAuth' | 'secretToken'

export type UserEventType = 'LOGIN_EVENT' | 'OPEN_FORM_MODEL' | 'CLOSE_FORM_MODEL' | 'LOGOUT_USER' | 'SUBMIT_FORM' | 'SAVE_FORM' | 'UPDATE_ADDRESS' | 'ACCEPT_TASK' | 'REJECT_TASK'
export type UserEventResourceType = 'USER' | 'PROJECT_FORM' | 'TASK' | 'GROUP' | 'PROJECT' | 'ADDRESS' | 'TASK_FORM'
export type DbType = 'MySql'
export type RoleType = 'superAdmin' | 'admin' | 'manager' | 'execution_partner' | 'surveyor' | 'acquisitions' | 'maintenance' | 'string'

export type DbModelName = 'Actions' | 'Addresses' | 'Clients' | 'ClientSubscriptions' |
  'FormFieldTypes' |
  'Groups' |
  'Organizations' |
  'OrganizationServices' |
  'Password' |
  'Projects' |
  'ProjectForms' |
  'ProjectFormFields' |
  'Resources' |
  'ResourceSharing' |
  'Roles' |
  'S3Keys' |
  'Services' |
  'Subscriptions' |
  'Tasks' |
  'TaskForms' |
  'Tokens' |
  'Users' |
  'UserEvents' |
  'UserFormFieldData' |
  'UserGroups' |
  'UserGroupPermissions' |
  'UserProjectForm' |
  'UserProjects' |
  'UserRoles' |
  'UserSession' |
  'UserTasks' | 'sequelize'

export interface DataSourceSqlOptions extends Options {
  host: string
  port: number
  dialect: Dialect
  database: string
  username: string
  password: string
}

export interface DBModels {
  Actions: any
  Addresses: any
  Clients: any
  ClientSubscriptions: any
  FormFieldTypes: any
  Groups: any
  Organizations: any
  OrganizationServices: any
  Password: any
  Projects: any
  ProjectForms: any
  ProjectFormFields: any
  Resources: any
  ResourceSharing: any
  Roles: any
  S3Keys: any
  Services: any
  Subscriptions: any
  TaskTemplate: any
  Tasks: any
  TaskForms: any
  Tokens: any
  Users: any
  UserEvents: any
  UserFormFieldData: any
  UserGroups: any
  UserGroupPermissions: any
  UserProjectForm: any
  UserProjects: any
  UserRoles: any
  UserSession: any
  UserTasks: any
  sequelize: any
}

export type TimeFormat = 'h' | 'w' | 'm' | 'y' | 'd'

export type FieldDataType = 'kml' | 'string' | 'number' | 'point' | 'boolean' | 'time' | 'date' | 'dateTime' | 'image' | 'video' | 'audio' | 'pdf' | 'xlsx' | 'word' | 'ppt' | 'csv'

export interface ResponseData {
  auth?: AuthenticationStrategyType
  code?: number
  async?: boolean
  topic?: string
  roles?: RoleType[]
}

export interface ImageUploadRequest {
  imageType: string
  fileExtension: string
  fileSize: number
  isProfileSet: boolean
  profileImageKey: string
}

export interface FormFieldUploadFileRequest {
  mimeType: string
  fileExtension: string
  fileSize: number
  userId: string
  counter: number
  projectFormFieldId: number
}

export interface LoginData {
  userId: string
  username: string
  phone: string
  profileImageKey: string
  isProfileSet: boolean
  isVerified: boolean
  email: string
  Roles: Roles[]
  Groups: { id: number; name: string; UserGroups: UserGroups }[]
  Actions: Actions[]
  Organization: Organizations
}

export interface ProfileData {
  userId: string
  username: string
  phone: string
  isVerified: boolean
  email: string
  address: Addresses
}
export interface UserGroupRolePermission {
  groupId: number
  roles: string[]
  permission: string[]
}
export interface UserProfile {
  userId: string
  clientId: number
  username: string
  isProfileSet: boolean
  profileImageKey: string
  phone: string
  scopes: string
  isVerified: boolean
  email: string
  roles: string[]
  organization: { orgId: number; orgName: string }
}
export interface UserGroupRoleAndPermission {
  groupId: number
  Roles: Roles[]
  Actions: Actions[]
}

export interface ControllersRequest {
  request: Request
  response: Response
  userProfile: UserProfile
}

export interface ClientRegistrationRequest {
  clientName: string
  organizationAdminEmail: string
  organizationAdminName: string
  organizationsName: string
  registrationNumber: string
  organizationAdminPhone: string
}

export interface CreateProjectFormFieldRequest {
  title: string
  validatePattern?: string
  staticValue?: string
  maxLength?: number
  minLength?: number
  maxValue?: number
  minValue?: number
  required?: boolean
  isDelete?: boolean
  visible?: boolean
  fieldType: string
  id?: number
  repeatCount: number
  sequence: string
  children: CreateProjectFormFieldRequest[]
}

export interface ProjectFormFieldRequest {
  projectFormId: number
  parentId?: number
}

export interface SignUpNewUser {
  phone: string
  username: string
  email?: string
}

export interface UpdateUserInformation {
  userId: string
  username: string
  email?: string
  phone: string
}

export interface NodeMailerEmailRequest {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  attachments?: any[]
  html?: string
  subject: string
  text?: string
}

export interface EmailRequest {
  from?: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  attachments?: any[]
  html?: string
  subject: string
  message?: string
}

export interface EmailTemplateRequest {
  email: string
  html: string
  subject: string
}

export interface CreateEmailTemplateRequest {
  email: string
  username: string
  otp: string
  adminEmail?: string
}

export interface SharedResourceEmailTemplateRequest {
  email: string
  otp: string
  resource: string
  adminEmail: string
}

export interface PasswordMailRequest {
  email: string
  username: string
  expiry?: number
  type: 'SET_PASSWORD' | 'RESET_PASSWORD'
  adminEmail?: string
}

export interface NodeMailerConfigRequest {
  service: string
  host: string
  port: number
  auth: {
    user: string
    password: string
  }
  secure?: boolean
};

export interface SesRequest {
  fromEmailAddress: string
  region: string
};

export interface SMSRequest {
  to: string
  from?: string
  message: string
  subject?: string
  services: {
    nexmo?: boolean
    twilio?: boolean
    aws_sns?: boolean
  }
};

export interface UserCredentials { email: string; password: string }

export type DataType = 'string' | 'array' | 'number'

export interface Point {
  type: 'Point' | 'LineString' | 'MultiPoint' | 'Polygon'
  coordinates: Array<Array<string>> | Array<string>
}
export interface GeoLocation {
  latitude: string
  longitude: string
}

export interface UploadFile {
  value: string
  title: string
}

export interface UserFormFieldRequest {
  userId: string
  counter?: number
  date?: Date
  time?: Date
  formFieldId: number
  value: string | number
  maxValue?: number
  values: Array<string | number>
  minValue?: number
  points: GeoLocation[]
  files: UploadFile[]
}

export interface UserFormValidatorRequest {
  parentData?: ProjectFormFields
  childValue: ProjectFormFields
  value: UserFormFieldRequest
  userId: string
}

export interface NearByProject {
  latitude: string
  longitude: string
  userId: string
  maxDistance: number
}
export interface ValidateFileDataRequest {
  userId: string
  projectFormFieldId: number
  value: string
  counter?: number
  type: string
}

export interface RegisterUserRequest {
  username: string
  phone: string
  email: string
  orgId: number
  role: RoleType
}

export interface CreateUsersGroup {
  adminUserId: string
  emails: string[]
  groupId: number
  orgId: number
}

export interface CreateProjectFormGroup {
  adminUserId: string
  orgId: number
  groups: number[]
  projectFormId: number
}

export interface RemoveProjectFormGroup {
  orgId: number
  groupIds: number[]
  projectFormId: number
}

export interface SaveProjectForm {
  projectFormId: number
  orgId: number
  groupId: number
  projectId: string
  adminUserId: string
}

export interface RemoveProjectForm {
  projectFormId: number
  groupId: number
  orgId: number
  projectId: string
}

export interface UserProjectData {

  userId: string
  username: string
  email: string
  projects: Projects[]
}

export interface UserProjectFrom {

  userId: string
  username: string
  email: string
  projectForms: ProjectForms[]
}

export interface CreateProject {
  name: string
  description: string
  projectOwner: string
  orgId: number
  startDate: Date
  endDate: Date
  priority: number
}

export interface CreateProjectForms {
  name: string
  description: string
}

export interface PaginateDataType<T> {
  count: number
  data: T[]
}

export interface UserProjectFormDataValue {
  value: string
  valueType: string
  valueName: string
  sequence: string
  point?: Point
}

export interface ValidateUserFormFieldData {
  value: string
  s3Id?: string
  values?: string[]
  fieldType: string
  valueType: FieldDataType
  sequence: string
  valueName: string
  counter?: number
  point?: Point
  projectFormFieldId: number
}

export interface Filter {
  userProjectForm: WhereOptions<UserProjectForm>
  projects: WhereOptions<Projects>
  projectForms: WhereOptions<ProjectForms>
  users: WhereOptions<Users>
}

export interface UserTaskFormFilter {
  userTaskQuery: WhereOptions<UserTasks>
  taskQuery: WhereOptions<Tasks>
  userProjectForm: WhereOptions<UserProjectForm>
}

export interface TaskFilter {
  task: WhereOptions<Tasks>
  projects: WhereOptions<Projects>
  users: WhereOptions<Users>
  userTaskQuery: WhereOptions<UserTasks>
}

export interface FormsFilter {
  projectForms: WhereOptions<ProjectForms>
  users: WhereOptions<Users>
}

export interface SharingFilter {
  share: WhereOptions<ResourceSharing>
  userProjectForm: WhereOptions<UserProjectForm>
  users: WhereOptions<Users>
}

export interface ProjectFormDataWithFields extends ProjectForms {
  fields: ProjectFormFields[]
}

export interface UserProjectFormFieldData extends UserProjectForm {
  ProjectForm: ProjectFormDataWithFields
  fieldsValue: UserFormFieldData[]
  title: string
}

export interface UserProjectFormFormat {
  formName: string
  formFields: {
    [key: string]: { title: string; fieldType: string }
  }
  data: { [key: string]: any }[]
  maxCharByCell: { [key: string]: number }
}

export interface DownloadXlsxRequest {
  formFieldId?: number[]
  userFromId?: number[]
  projectId?: string
  taskId?: number
  userTaskIds?: number[]
  status?: number[]
  sortBy?: 'id' | 'createdAt' | 'updatedAt'
  orderBy?: 'ASC' | 'DESC'
}

export type ResourceType = 'project' | 'user' | 'group' | 'project-form' | 'form-data'
export type PermissionType = 'all' | 'view' | 'edit' | 'delete' | 'create'

export interface AdminInfo {
  email: string
  userId: string
  orgId: number
}
export interface GuestAuth {
  email: string
  userId: string
  roles: string[]
}

export interface ResourceSharingRequest {
  permission: PermissionType
  email: string[]
  orgId: number
  isDelete?: boolean
  projectId?: string[]
  projectFormId?: number[]
  userFromId?: number[]
}

export interface CreateTaskFromTemplateRequest {
  workflowId: string
  workflowName: string
  taskTemplateId: number
  projectId: string
  taskCompleteDurationInDay: number
  taskAddress: string
  latitude: string
  longitude: string
  priority: number
  orgId: number
  userIds: string[]
  status?: number
}

export interface LoginHistoryRequest {
  address: string
  deviceName: string
  devicename: string
  platform: string
  deviceId: string
  deviceid: string
  latitude: string
  orgId: number
  longitude: string
  email: string
}

export interface UserEventRequest {
  address: string
  deviceName: string
  devicename: string
  platform: string
  orgId: number
  deviceId: string
  deviceid: string
  latitude: string
  longitude: string
  recourseName: UserEventResourceType
  recourseId: string
  eventName: UserEventType
  comment: string
}

export interface UserTaskForms extends ProjectForms {
  UserProjectForms: UserProjectForm[]
}

export interface CopyTaskTemplateRequest {
  workflowName: string
  workflowId: string
  taskTemplateId: number
  adminId: string
  projectId: string
  startDate: Date
  endDate: Date
  latitude: string
  longitude: string
  taskAddress: string
  userIds: string[]
}

export interface CreateWorkflowStage {
  workflowName: string
  projectId: string
  workflowPosition: string
  taskTemplateId: number
  adminId: string
  taskCompleteDurationInDay: number
  latitude: string
  longitude: string
  taskAddress: string
  orgId: number
  userIds: string[]
  workflowId: string
  position: number[]
}

export interface CreateWorkflowTemplateStage {
  workflowTemplateName: string
  taskTemplateId: number
  orgId: number
  workflowPosition: string
  workflowTemplateId: string
  position: number[]
}

export interface CreateWorkflowTemplateRequest {
  taskTemplateName: string
  taskTemplateId: number
  orgId: number
  workflowTemplateId: string
  position: number[]
  workflowPosition: string
}

export interface CreateMultipleTaskRequest {
  workflowName: string
  projectId: string
  taskTemplateIds: number[]
  orgId: number
  workflowId: string
  adminId: string
}
export interface CreateWorkflowRequest {
  taskId: number
  taskName: string
  position: number[]
  workflowPosition: string
}
export interface Workflow {
  workflowName: string
  projectId: string
  projectName: string
}

export interface UserSessionFilter {
  userSession: WhereOptions<UserSession>
  user: WhereOptions<Users>
}
export interface FirebaseConfig {
  type?: string
  projectId?: string
  privateKeyId?: string
  privateKey?: string
  clientEmail?: string
  clientId?: string
  authUri?: string
  tokenUri?: string
  authProviderX509CertUrl?: string
  clientX509CertUrl?: string
  databaseURL?: string
}

export interface MultiCastPushNotificationRequest { data: string }
export interface FirebaseUserSnapshot {
  [x: string]: {
    userId: string
    registrationToken: string
  }
}
export interface PushNotificationError {
  errorMessage: string
  failedToken: string
}
export interface NotificationRequest {
  title: string
  body: string
  propertyType: string
  event: string
  sound?: string
  image?: string
  icon?: string
}
export interface TopicPushNotificationRequest {
  data: {
    title: string
    body: string
    propertyType: string
    event: string
    sound?: string
    image?: string
    icon?: string
  }
  topic: string
}
export interface SendNotificationResult {
  status: number
  result: string
}

export interface NotificationResponse {
  status: string
  message: string
}

export interface CreateTaskRequest {
  name: string
  description: string
  workflowId: string
  projectId: string
  taskCompleteDurationInDay: number
  taskAddress: string
  latitude: string
  longitude: string
  priority: number
  taskTemplateId: number
  orgId: number
  userIds: string[]
  status?: number
  projectFormIds: number[]
}

export interface UpdateTaskRequest {
  description: string
  taskCompleteDurationInDay: number
  taskAddress: string
  latitude: string
  longitude: string
  priority: number
  orgId: number
  userIds: string[]
  projectFormIds: number[]
}
export type TransformCasingOptions = { [key in 'upperCase' | 'lowerCase']: 'toUpperCase' | 'toLowerCase' }
