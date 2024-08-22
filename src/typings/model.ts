import { FieldDataType, PermissionType, Point, ResourceType, RoleType, UserEventResourceType, UserEventType } from './tslp'

export interface Tokens {
  id: number
  verificationKey: string
  verifyCode: string
  otpExpires: Date
  updatedAt?: Date
  createdAt?: Date
}

export interface Roles {
  id: number
  name: RoleType
  isDefaultAdmin: boolean
  description: string
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}
export interface Users {
  userId: string
  username: string
  profileImageKey?: string
  isProfileSet?: boolean
  phone: string
  email?: string
  lastActiveTime?: Date
  createdAt?: string
  updatedAt?: string
  orgId: number
  isActive: boolean
  isBlocked: boolean
  lastLoginTime: Date
  isVerified: boolean
  createdBy?: string
  updatedBy?: string
}

export interface Actions {
  id: number
  actionName: string
  description: string
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Addresses {
  id: number
  address: string
  city: string
  state: string
  country: string
  pinCode: string
  lat?: string
  long?: string
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}
export interface UserAddress extends Addresses {
  userId: string
  updatedAt?: Date
  createdAt?: Date
}

export interface OrgAddress extends Addresses {
  orgId: number
  updatedAt?: Date
  createdAt?: Date

}

export interface Clients {
  id: number
  name: string
  isActive?: boolean
  isDelete?: boolean
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Groups {
  id: number
  description: string
  name: string
  orgId: number
  createdBy?: string
  updatedBy?: string
  isActive?: boolean
  isDelete?: boolean
  updatedAt?: Date
  createdAt?: Date
}

export interface Organizations {
  id: number
  orgName: string
  description?: string
  registrationNumber: string
  clientId: number
  isActive?: boolean
  isDelete?: boolean
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface UserGroups {
  id: number
  userId: string
  groupId: number
  createdBy?: string
  updatedBy?: string
  Groups?: Groups[]
  updatedAt?: Date
  createdAt?: Date
}

export interface UserRoles {
  id: number
  userId: string
  roleId: number
  Role: Roles
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date

}

export interface FormFieldTypes {
  id: number
  fieldText: string
  fieldName: string
  fabIcon: string
  isParent: boolean
  childRequire: boolean
  repeatCountRequire: boolean
  createdBy?: string
  isActive: boolean
  isDelete: boolean
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface FormTemplates {
  id: number
  name: string
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Projects {
  id: string
  name: string
  description: string
  projectOwnerId: string
  orgId: number
  isActive?: boolean
  isDelete?: boolean
  createdBy?: string
  updatedBy?: string
  startDate: Date
  endDate: Date
  priority: number
  status: 1 | 2
  updatedAt?: Date
  createdAt?: Date
}

export interface ProjectForms {
  id: number
  name: string
  description: string
  orgId: number
  isPublish: boolean
  isDelete?: boolean
  isActive?: boolean
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}
export interface UserFormFieldData {
  id: number
  value: string
  fieldType?: string
  valueType: FieldDataType
  userId: string
  sequence: string
  userFromId: number
  valueName: string
  counter?: number
  point?: Point
  projectFormId: number
  projectFormFieldId: number
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}
export interface ProjectFormFields {
  id: number
  title: string
  defaultValue?: string
  validatePattern?: string
  staticValue?: string
  maxLength?: number
  minLength?: number
  maxValue?: number
  minValue?: number
  required?: boolean
  visible?: boolean
  fieldType: string
  valueType: string
  source: string
  childRequire: boolean
  parentId?: number
  repeatCount?: number
  projectFormId: number
  sequence: string
  children: ProjectFormFields[]
  parent?: ProjectFormFields
  createdBy?: string
  updatedBy?: string
  counter?: number
  fieldValue?: UserFormFieldData[]
  updatedAt?: Date
  createdAt?: Date
}

export interface TemplateFormFields {
  id: number
  title: string
  defaultValue?: string
  validatePattern?: string
  staticValue?: string
  maxLength?: number
  minLength?: number
  maxValue?: number
  minValue?: number
  required?: boolean
  visible?: boolean
  fieldType: string
  valueType: string
  source: string
  childRequire: boolean
  parentId: number
  templateId: number
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Password {
  id: number
  name: RoleType
  description: string
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface UserProjectForm {
  id: number
  status: 1 | 2 | 3 | 4 | 5 | number
  isActive: boolean
  isDelete?: boolean
  title: string
  userId: string
  commentByAdmin?: string
  description?: string
  projectFormId: number
  projectId: string
  orgId: number
  taskId: number
  createdBy?: string
  updatedBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserProjects {
  id: number
  createdBy?: string
  updatedBy?: string
  userId: string
  projectId: string
  updatedAt?: Date
  createdAt?: Date
}

export interface S3Keys {
  id: string
  s3Keys: string
  userId: string
  counter: number
  projectFormFieldId: number
  updatedAt?: Date
  createdAt?: Date
}

export interface ResourceSharing {
  id: number
  resource: ResourceType
  permission: PermissionType
  email: string
  orgId: number
  isDelete?: boolean
  projectId?: string
  projectFormId?: number
  userFromId?: number
  createdBy?: string
  updatedBy?: string
  groupId?: number
  userId?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Tasks {
  id: number
  name: string
  description: string
  projectId: string
  taskCompleteDurationInDay: number
  startDate: Date
  workflowId: string
  endDate: Date
  taskAddress: string
  taskPoint: Point
  isActive?: boolean
  taskTemplateId: number
  isDelete?: boolean
  orgId: number
  createdBy?: string
  updatedBy?: string
  status: number
  priority: number
  sequence: number
  updatedAt?: Date
  createdAt?: Date
}

export interface UserTasks {
  id: number
  userId: string
  taskId: number
  action: 'view' | 'create'
  createdBy: string
  status: number
  updatedBy: string
  updatedAt?: Date
  createdAt?: Date
}

export interface TaskForms {
  id: number
  projectFormId: number
  taskId: number
  createdBy?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface UserEvents {
  id: number
  location?: Point
  address: string
  orgId: number
  deviceName: string
  platform: string
  deviceId: string
  recourseName: UserEventResourceType
  recourseId: string
  eventName: UserEventType
  comment: string
  userId: string
  isActive: boolean
  isDelete: boolean
  updatedAt?: Date
  createdAt?: Date
}

export interface UserSession {
  id: number
  location?: Point
  address: string
  deviceName: string
  platform: string
  deviceId: string
  userId: string
  orgId: number
  isActive: boolean
  isDelete: boolean
  lastActiveTime: Date
  updatedAt?: Date
  createdAt?: Date
}

export interface TaskTemplate {
  id: number
  name: string
  description: string
  taskAcceptanceCriteria: string
  isActive: boolean
  isDelete: boolean
  orgId: number
  createdBy: string
  projectFormId: number
  updatedBy: string
  isPublish: boolean
  updatedAt?: Date
  createdAt?: Date
}
