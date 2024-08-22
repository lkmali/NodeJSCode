/* eslint-disable @typescript-eslint/tslint/config */
import { constants, promises as fs } from 'fs'
import { generate } from 'generate-password'
import { isNil } from 'lodash'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { EncryptionService, UserEventService } from '../../services'
import { DataType, GeoLocation, ProjectFormFields, UploadFile, UserEventRequest, UserProfile, UserProjectData, UserProjectFrom } from '../../typings'
export const generatePassword = (): string => generate({
  strict: true,
  length: 30,
  numbers: true,
  uppercase: true,
  lowercase: true,
  symbols: true
})

export const generateV4ID: string = uuidv4()

/**
 * Generates a random OTP for use
 *
 * @param length length of the OTP to generate
 *
 * @returns string
 */
export function generateRandomOTP(length: number): string {
  const randomValue = []
  for (let i = 0; i < length; i++)
    randomValue.push(Math.floor(Math.random() * 10))

  return randomValue.join('')
}

/**
 * check if file exists
 *
 * @export
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function fileExists(path: string): Promise<boolean> {
  const exists = await fs.access(path, constants.F_OK).then(() => true).catch(() => false)
  return exists
}

/**
 * readFiles
 *
 * @export
 * @param {string[]} paths
 * @returns
 */
export async function readFiles(paths: string[]): Promise<Buffer[]> {
  return Promise.all(paths.map(async path => fs.readFile(path)))
}

/**
 * write files
 *
 * @export
 * @param {Array<{ path: string; content: string }>} files
 * @returns {Promise<PromiseSettledResult<void>[]>}
 */
export async function writeFiles(files: Array<{ path: string; content: string }>): Promise<void[]> {
  return Promise.all(files.map(async ({ path, content }) => fs.writeFile(path, content)))
}

/**
 * isValidType
 *
 * @export
 * @param {string | number | Array<string>} value
 * @returns  boolean
 */
export function isValidType(value: string | undefined | null | number | Array<string | number> | UploadFile[] | GeoLocation[],
  type: DataType): boolean {
  if (isNil(value))
    return false

  switch (type) {
    case 'string': {
      return true
    }
    case 'number': {
      return !isNaN(value as number)
    }
    case 'array': {
      return Array.isArray(value)
    }
    default: {
      return false
    }
  }
}

/**
 * jsonParse
 *
 * @export
 * @param {any} data
 * @returns
 */
export function jsonParse(data: any): any {
  try {
    return JSON.parse(data)
  } catch (_error) {
    return data
  }
}

/**
 * jsonParse
 *
 * @export
 * @param {any} data
 * @returns
 */
export function getTimestampInSeconds(date = new Date()) {
  return date.valueOf()
}

/**
 * jsonStringify
 * @export
 * @param {any} data
 * @returns
 */
export function jsonStringify(data: any): any {
  try {
    return JSON.stringify(data)
  } catch (_error) {
    return data
  }
}

/**
 * getDecryptData
 *
 * @export
 * @param {any} data
 * @returns
 */
export function getDecryptData(data: any): any {
  try {
    return JSON.parse(EncryptionService.Instance.decrypt(data))
  } catch (_error) {
    return data
  }
}

/**
 * getUniqArray
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getUniqArray(array: any[]): any[] {
  return array.filter((value, index, self) => self.indexOf(value) === index)
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getProjectData(data: any): UserProjectData {
  if (isNil(data))
    return {
      projects: [],
      userId: '',
      username: '',
      email: ''
    }

  const projectIds = []
  for (const project of data.Projects)
    projectIds.push(project.id)

  for (const group of data.Groups)
    if (!isNil(group.Projects))
      for (const value of group.Projects)
        if (projectIds.indexOf(value.id) < 0) {
          delete value.ProjectGroups
          projectIds.push(value.id)
          data.Projects.push(value)
        }

  return {
    userId: data.userId,
    username: data.username,
    email: data.email,
    projects: data.Projects
  }
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getProjectFormData(data: any, data2?: any): UserProjectFrom {
  const projectFormsIds: any[] = []
  const projectForms: any[] = []
  const result: any = {
    userId: '',
    username: '',
    email: '',
    projectForms: []
  }
  if (!isNil(data) && !isNil(data.Groups)) {
    result.userId = data.userId
    result.username = data.username
    result.email = data.email
    for (const group of data.Groups)
      if (!isNil(group.ProjectForms))
        for (const value of group.ProjectForms)
          if (projectFormsIds.indexOf(value.id) < 0) {
            delete value.ProjectFormGroups
            projectForms.push(value)
            projectFormsIds.push(value.id)
          }
  }

  if (!isNil(data2) && !isNil(data2.Projects)) {
    const projects = data2.Projects
    result.userId = data2.userId
    result.username = data2.username
    result.email = data2.email
    for (const project of projects)
      if (!isNil(project.ProjectForms))
        for (const value of project.ProjectForms)
          if (projectFormsIds.indexOf(value.id) < 0) {
            projectFormsIds.push(value.id)
            projectForms.push({ ...value, Project: { name: project.name } })
          }
  }

  result.projectForms = projectForms

  return result
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function valueOf(object: any): any[] {
  const result = []
  for (const value in object)
    if (Object.hasOwnProperty.call(object, value))
      if (!isNil(object[value].id))
        result.push(object[value])

  return result
}
/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getPoint(data: any) {
  return !isNil(data) && !isNil(data.coordinates) ? data.coordinates : null
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getPointLetLong(data: any) {
  const result = getPoint(data)
  if (!isNil(result) && result.length >= 2)
    return { latitude: result[0], longitude: result[1] }
  else
    return { latitude: '', longitude: '' }
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function formatData(fields: { [key: string]: any }) {
  const result: { [key: string]: string } = {}
  if (!isNil(fields.fieldValue) && fields.fieldValue.length > 0)
    fields['fieldValue'] = fields.fieldValue.map((value: any) => ({ ...value, point: getPoint(value.point) }))

  for (const field in fields)
    if (Object.hasOwnProperty.call(fields, field) && !isNil(fields[field]))
      result[field] = fields[field]

  if (Object.hasOwnProperty.call(fields, 'point') && !isNil(fields['point']))
    fields.point = getPoint(fields.point)

  return result
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function prepareData(request: ProjectFormFields[]): any[] {
  const object: { [key: number]: ProjectFormFields | { children: ProjectFormFields[] } } = {}

  for (const fields of request) {
    const data = formatData(fields as unknown as { [key: string]: string }) as unknown as ProjectFormFields

    if (!isNil(data.parentId)) {
      object[data.id] = Object.hasOwnProperty.call(object, data.id) ? object[data.id] : { children: [] }
      object[data.parentId] = Object.hasOwnProperty.call(object, data.parentId) ? object[data.parentId] : { children: [] }
      object[data.parentId].children.push({ ...data, ...object[data.id] })
    } else {
      object[data.id] = Object.hasOwnProperty.call(object, data.id) ? object[data.id] : { children: [] }
      object[data.id] = { ...data, ...object[data.id] }
    }
  }

  return valueOf(object)
}

/**
 * getProjectData
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getProjectFormStatus(value: number): string {
  const data: { [key: string]: string } = {
    1: 'DRAFT',
    2: 'SUBMITTED',
    3: 'VERIFIED',
    4: 'REJECTED',
    5: 'PENDING'
  }
  return Object.hasOwnProperty.call(data, value.toString()) ? data[value.toString()] : 'INVALID'
}

export function getRoleFlag(roles: string[], userProfile: UserProfile) {
  const userRoles = userProfile.roles
  let flag = false

  for (const role of userRoles)
    flag = flag || roles.indexOf(role) >= 0

  return flag
}

export function getStartAndEndDateBasesOnDays(duration: number) {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + duration)
  return { startDate, endDate: moment(endDate).endOf('day').toDate() }
}

export function isOverDue(projectEndDate: string, status: number): boolean {
  const currentDate = moment(new Date()).endOf('day').toDate()
  const projectEndDateMoment = moment(projectEndDate).startOf('day').toDate()
  currentDate.setDate(currentDate.getDate() - 1)
  const dateOverDue = projectEndDateMoment < currentDate
  const statusDue = [2, 7].indexOf(status) < 0
  return dateOverDue && statusDue
}

export function isUserOnline(lastActiveTime: string): string {
  const currentDate = new Date()
  currentDate.setMinutes(currentDate.getMinutes() - 6)
  const isLive = currentDate < new Date(lastActiveTime)
  currentDate.setDate(currentDate.getDate() - 15)
  const isActive = currentDate < new Date(lastActiveTime)
  return isActive ? isLive ? 'online' : 'offline' : 'inActive'
}

export function saveUserEvent(userId: string, request: UserEventRequest) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  UserEventService.Instance.saveUserEvent(userId, request)
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}
