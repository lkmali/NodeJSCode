import { isNil } from 'lodash'
import { send } from '../provider'
import { TaskTemplateService } from '../services'
import { ControllersRequest } from '../typings'

async function createTaskTemplate({ request, userProfile }: ControllersRequest) {
  const body = request.body
  return TaskTemplateService.Instance.createTaskTemplate({
    ...body,
    orgId: userProfile.organization.orgId
  }, userProfile.userId)
}

async function updateTaskTemplateByAdmin({ request, userProfile }: ControllersRequest) {
  const taskTemplateId = Number(request.params.taskTemplateId)
  const body = request.body

  return TaskTemplateService.Instance.updateTaskTemplate(taskTemplateId, {
    ...body,
    orgId: userProfile.organization.orgId
  }, userProfile.userId)
}
async function publishTaskTemplate({ request, userProfile }: ControllersRequest) {
  const taskTemplateId = Number(request.params.taskTemplateId)
  return TaskTemplateService.Instance.publishTaskTemplate(taskTemplateId, userProfile.organization.orgId, userProfile.userId)
}

async function deleteTaskTemplate({ request, userProfile }: ControllersRequest) {
  const taskTemplateId = Number(request.params.taskTemplateId)
  return TaskTemplateService.Instance.deleteTaskTemplate(
    taskTemplateId, userProfile.organization.orgId
  )
}

async function getAllTaskTemplateByAdmin({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'updatedAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return TaskTemplateService.Instance.getAllTaskByAdmin({ ...query, orgId: userProfile.organization.orgId })
}

module.exports = {
  deleteTaskTemplate: send(deleteTaskTemplate, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getAllTaskTemplateByAdmin: send(getAllTaskTemplateByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  createTaskTemplate: send(createTaskTemplate, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  updateTaskTemplateByAdmin: send(updateTaskTemplateByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  publishTaskTemplate: send(publishTaskTemplate, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] })

}
