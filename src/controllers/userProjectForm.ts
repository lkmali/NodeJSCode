import { isNil } from 'lodash'
import { send } from '../provider'
import { SharedResourceService, UserFormFieldService, UserProjectFormService } from '../services'
import { ControllersRequest, UserEventRequest } from '../typings'
import { getRoleFlag, saveUserEvent } from '../utils'

async function getUserAllProjectForm({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'updatedAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserProjectFormService.Instance.getUserAllProjectForm(query, userProfile.userId)
}

async function getUserProjectFormHistory({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean | number }
  query['time'] = !isNil(query['time']) ? query['time'] : 7
  query['format'] = !isNil(query['format']) ? query['format'] : 'd'
  return UserProjectFormService.Instance.getUserProjectFormHistory(query, userProfile.userId)
}

async function getNearByCoordinate({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string }
  return UserProjectFormService.Instance.getNearByCoordinate({
    userId: userProfile.userId,
    latitude: query.latitude,
    longitude: query.longitude,
    maxDistance: query.maxDistance ? Number(query.maxDistance) : 20
  })
}

async function getUserAllProjectFormByAdmin({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  if (getRoleFlag(['admin', 'superAdmin'], userProfile)) {
    query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'title'
    query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
    query['searchBy'] = !isNil(query['searchBy']) ? query['searchBy'] : 'title'
    return UserProjectFormService.Instance.getUserAllProjectFormByAdmin(userProfile.organization.orgId, query)
  } else
    return SharedResourceService.Instance.getSharedResourceDataByResource(userProfile.email, 'form-data', query)
}

async function submitUserProjectFormData({ request, userProfile }: ControllersRequest) {
  const userFromId = Number(request.params.userFromId)
  const data = request.body ?? {}
  await UserProjectFormService.Instance.submitUserProjectFormData(userProfile.userId, userFromId)

  saveUserEvent(userProfile.userId, {
    ...request.headers,
    ...data,
    orgId: userProfile.organization.orgId,
    eventName: 'SUBMIT_FORM',
    recourseId: userFromId,
    recourseName: 'PROJECT_FORM',
    comment: 'user submit there project form'
  } as UserEventRequest)
}

async function downloadXlsx({ request, response, userProfile }: ControllersRequest) {
  if (getRoleFlag(['admin', 'superAdmin'], userProfile))
    return UserProjectFormService.Instance.downloadXlsx(request.body, response)
  else {
    const body = await SharedResourceService.Instance.downloadXlsxValidation(userProfile.email, request.body)
    return UserProjectFormService.Instance.downloadXlsx({ ...body, status: request.body.status ?? [] }, response)
  }
}

async function updateUserProjectFormStatusByAdmin({ request, userProfile }: ControllersRequest) {
  const userFromId = Number(request.params.userFromId)
  const body = request.body as { status: number; commentByAdmin: string }
  if (isNil(body.commentByAdmin))
    body.commentByAdmin = ''

  return UserProjectFormService.Instance.updateUserProjectFormStatusByAdmin(userProfile.userId, userFromId, body,
    request.headers.authorization as string)
}

async function saveProjectForms({ request, userProfile }: ControllersRequest) {
  const projectFormId = Number(request.params.projectFormId)
  const taskId = Number(request.params.taskId)
  return UserProjectFormService.Instance.saveProjectForms({
    userId: userProfile.userId,
    projectFormId,
    title: request.body['title'],
    orgId: userProfile.organization.orgId,
    taskId
  })
}

async function getUserProjectFormFieldData({ request, userProfile }: ControllersRequest) {
  const userFromId = Number(request.params.userFromId)
  return UserFormFieldService.Instance.getUserFormFieldData(userProfile.userId, userFromId)
}

async function getUserFormFieldDataByAdmin({ request, userProfile }: ControllersRequest) {
  const userFromId = Number(request.params.userFromId)
  if (!getRoleFlag(['admin', 'superAdmin'], userProfile))
    await SharedResourceService.Instance.validateResourceData({
      userFromId,
      resource: 'form-data',
      email: userProfile.email
    })

  return UserFormFieldService.Instance.getUserFormFieldDataByAdmin(userFromId)
}

async function getUserFormFieldDataId({ request, userProfile }: ControllersRequest) {
  const userFromId = Number(request.params.userFromId)
  return UserFormFieldService.Instance.getUserFormFieldDataID(userProfile.userId, userFromId)
}

async function updateUserProjectFormData({ request, userProfile }: ControllersRequest) {
  const userFromId = Number(request.params.userFromId)
  const data = request.body
  const result = await UserFormFieldService.Instance.updateUserFormData(request.body, userFromId, userProfile.userId)
  saveUserEvent(userProfile.userId, {
    ...request.headers,
    ...data,
    orgId: userProfile.organization.orgId,
    eventName: 'SAVE_FORM',
    recourseId: result.taskId,
    recourseName: 'TASK',
    comment: 'user save there project form'
  } as UserEventRequest)
}

async function getFileSignUrl({ userProfile, request }: ControllersRequest) {
  const body = request.body
  body['userId'] = userProfile.userId
  return UserFormFieldService.Instance.getFileSignUrl(body)
}

async function getViewFileUrl({ request }: ControllersRequest) {
  const key = request.query.key
  return UserFormFieldService.Instance.getViewFileUrl(key as string)
}

async function downloadFileByPublic({ request, response }: ControllersRequest) {
  const key = request.params.key
  return UserFormFieldService.Instance.downloadFileByPublic(key, request, response)
}

module.exports = {
  getNearByCoordinate: send(getNearByCoordinate, { auth: 'jwtAuth' }),
  getUserProjectFormHistory: send(getUserProjectFormHistory, { auth: 'jwtAuth' }),
  getUserFormFieldDataId: send(getUserFormFieldDataId, { auth: 'jwtAuth' }),
  updateUserProjectFormStatusByAdmin: send(updateUserProjectFormStatusByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getUserAllProjectFormByAdmin: send(getUserAllProjectFormByAdmin, { auth: 'guestJwtAuth' }),
  getFileSignUrl: send(getFileSignUrl, { auth: 'jwtAuth' }),
  getUserFormFieldDataByAdmin: send(getUserFormFieldDataByAdmin, { auth: 'guestJwtAuth' }),
  downloadXlsx: send(downloadXlsx, { auth: 'guestJwtAuth' }),
  getViewFileUrl: send(getViewFileUrl, { auth: 'guestJwtAuth' }),
  getUserAllProjectForm: send(getUserAllProjectForm, { auth: 'jwtAuth' }),
  saveProjectForms: send(saveProjectForms, { auth: 'jwtAuth' }),
  downloadFileByPublic: send(downloadFileByPublic, {}),
  updateUserProjectFormData: send(updateUserProjectFormData, { auth: 'jwtAuth' }),
  submitUserProjectFormData: send(submitUserProjectFormData, { auth: 'jwtAuth' }),
  getUserProjectFormFieldData: send(getUserProjectFormFieldData, { auth: 'jwtAuth' })
}
