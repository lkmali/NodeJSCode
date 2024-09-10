
import { isArray, isNil } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { ProjectForms, Projects, ResourceSharing, Tasks, TimeFormat, UserProjectForm, UserSession, UserTasks, Users } from '../../typings'
import { andOperator, getSearchQuery, gteOperator, inOperator } from './sequelizeOperator'

/**
 * getDateQuery
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */

export function getDateQuery(time: number, format: TimeFormat): Date {
  const date = new Date()
  switch (format) {
    case 'h': {
      date.setHours(date.getHours() - time)
      return date
    }
    case 'd': {
      date.setDate(date.getDate() - time)
      return date
    }
    case 'w': {
      date.setDate(date.getDate() - time * 7)
      return date
    }
    case 'm': {
      date.setMonth(date.getMonth() - time)
      return date
    }
    case 'y': {
      date.setFullYear(date.getFullYear() - time)
      return date
    }
    default: {
      date.setDate(date.getDate() - 7)
      return date
    }
  }
}
/**
 * getUserProjectFormQueryForAdmin
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getUserProjectFormQueryForAdmin(query: { [key: string]: string | boolean | number }, searchValue = ['UserProjectForm.title']): WhereOptions<UserProjectForm> {
  let result: WhereOptions<UserProjectForm> = {}
  if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
    result['id'] = query.id

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
    result['userId'] = query.userId

  if (Object.prototype.hasOwnProperty.call(query, 'status') && !isNil(query['status']))
    result['status'] = Number(query.status)

  if (Object.prototype.hasOwnProperty.call(query, 'statusArray') && isArray(query['statusArray']) && query['statusArray'].length > 0)
    result['status'] = { [inOperator]: query['statusArray'] }

  if (Object.prototype.hasOwnProperty.call(query, 'projectFormId') && !isNil(query['projectFormId']))
    result['projectFormId'] = Number(query.projectFormId)

  if (Object.prototype.hasOwnProperty.call(query, 'taskId') && !isNil(query['taskId']))
    result['taskId'] = Number(query.taskId)

  if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
    result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

  if (!isNil(query['time']) && !isNil(query['format']))
    result['updatedAt'] = { [gteOperator]: getDateQuery(Number(query['time']) ?? 7, query['format'] as TimeFormat ?? 'd') }

  if (Object.prototype.hasOwnProperty.call(query, 'isActive') && !isNil(query['isActive']))
    result['isActive'] = query.isActive === true || query.isActive.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, searchValue)

    result = { ...andOperator([data]), ...result }
  }
  return result
}
/**
 * getUserQueryForAdmin
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getUserQueryForAdmin(query: { [key: string]: string | boolean | number }, searchValue = ['user.username', 'user.email', 'user.phone']): WhereOptions<Users> {
  let result: WhereOptions<Users> = {}
  if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
    result['userId'] = query.userId

  if (Object.prototype.hasOwnProperty.call(query, 'email') && !isNil(query['email']))
    result['email'] = query.email

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'phone') && !isNil(query['phone']))
    result['phone'] = query.phone

  if (Object.prototype.hasOwnProperty.call(query, 'isBlocked') && !isNil(query['isBlocked']))
    result['isBlocked'] = query.isBlocked === true || query.isBlocked.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'isActive') && !isNil(query['isActive']))
    result['isActive'] = query.isActive === true || query.isActive.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, searchValue)
    result = { ...andOperator([data]), ...result }
  }

  return result
}
/**
 * getProjectData
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getProjectQueryForAdmin(query: { [key: string]: string | boolean | number }, searchValue = ['Project.name']): WhereOptions<Projects> {
  let result: WhereOptions<Projects> = {}
  if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
    result['id'] = query.id

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
    result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'isActive') && !isNil(query['isActive']))
    result['isActive'] = query.isActive === true || query.isActive.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, searchValue)

    result = { ...andOperator([data]), ...result }
  }
  return result
}

/**
 * getProjectData
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getProjectFormQueryForAdmin(query: { [key: string]: string | boolean | number }, searchValue = ['ProjectForm.name']): WhereOptions<ProjectForms> {
  let result: WhereOptions<ProjectForms> = {}

  if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
    result['id'] = Number(query.id)

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
    result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'isPublish') && !isNil(query['isPublish']))
    result['isPublish'] = query.isPublish === true || query.isPublish.toString() === 'true'

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) &&
    (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, searchValue)
    result = { ...andOperator([data]), ...result }
  }

  return result
}

/**
 * getProjectData
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getTaskQueryForAdmin(query: { [key: string]: string | boolean | number }, searchValue = ['Task.name']): WhereOptions<Tasks> {
  let result: WhereOptions<Tasks> = {}

  if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
    result['id'] = Number(query.id)

  if (Object.prototype.hasOwnProperty.call(query, 'projectId') && !isNil(query['projectId']))
    result['projectId'] = query.projectId

  if (Object.prototype.hasOwnProperty.call(query, 'status') && !isNil(query['status']))
    result['status'] = query.status

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
    result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

  if (!isNil(query['time']) && !isNil(query['format']))
    result['endDate'] = { [gteOperator]: getDateQuery(Number(query['time']) ?? 7, query['format'] as TimeFormat ?? 'd') }

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) &&
    (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, searchValue)
    result = { ...andOperator([data]), ...result }
  }

  return result
}

/**
 * getProjectData
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getUserTaskQueryForAdmin(query: { [key: string]: string | boolean | number }): WhereOptions<UserTasks> {
  const result: WhereOptions<UserTasks> = {}

  if (Object.prototype.hasOwnProperty.call(query, 'isHomePage') && !isNil(query['isHomePage']))
    result['status'] = { [inOperator]: [1, 2, 6] }

  if (Object.prototype.hasOwnProperty.call(query, 'status') && !isNil(query['status']))
    result['status'] = Number(query.status)

  if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
    result['userId'] = query.userId

  if (!isNil(query['time']) && !isNil(query['format']))
    result['updatedAt'] = { [gteOperator]: getDateQuery(Number(query['time']) ?? 7, query['format'] as TimeFormat ?? 'd') }

  return result
}

// eslint-disable-next-line @typescript-eslint/tslint/config
export function getResourceSharingFoAdmin(query: { [key: string]: string | boolean | number }): WhereOptions<ResourceSharing> {
  let result: WhereOptions<ResourceSharing> = {}

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
    result['id'] = query.id

  if (Object.prototype.hasOwnProperty.call(query, 'projectId') && !isNil(query['projectId']))
    result['projectId'] = query.projectId

  if (Object.prototype.hasOwnProperty.call(query, 'projectFormId') && !isNil(query['projectFormId']))
    result['projectFormId'] = Number(query.projectFormId)

  if (Object.prototype.hasOwnProperty.call(query, 'userFromId') && !isNil(query['userFromId']))
    result['userFromId'] = Number(query.userFromId)

  if (Object.prototype.hasOwnProperty.call(query, 'groupId') && !isNil(query['groupId']))
    result['groupId'] = Number(query.groupId)

  if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
    result['userId'] = query.userId

  if (Object.prototype.hasOwnProperty.call(query, 'resource') && !isNil(query['resource']))
    result['resource'] = query.resource

  if (Object.prototype.hasOwnProperty.call(query, 'email') && !isNil(query['email']))
    result['email'] = query.email

  if (Object.prototype.hasOwnProperty.call(query, 'permission') && !isNil(query['permission']))
    result['permission'] = query.permission

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) &&
    (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, ['ResourceSharing.email'])
    result = { ...andOperator([data]), ...result }
  }

  return result
}

/**
 * getUserQueryForAdmin
 *
 * @export
 * @param {{ [key: string]: string | boolean }} query
 * @returns
 */
export function getUserSessionQueryForAdmin(query: { [key: string]: string | boolean | number }, searchValue = ['deviceName', 'platform']): WhereOptions<UserSession> {
  let result: WhereOptions<UserSession> = {}

  if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
    result['orgId'] = query.orgId

  if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
    result['userId'] = query.userId

  if (Object.prototype.hasOwnProperty.call(query, 'deviceName') && !isNil(query['deviceName']))
    result['deviceName'] = query.deviceName

  if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
    const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
    const data = getSearchQuery(search, searchValue)
    result = { ...andOperator([data]), ...result }
  }

  return result
}
