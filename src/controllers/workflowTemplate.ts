import { send } from '../provider'
import { TaskService, WorkflowTemplateService } from '../services'
import { ControllersRequest, CreateMultipleTaskRequest, CreateWorkflowTemplateStage } from '../typings'

async function addWorkflowTemplateStage({ request, userProfile }: ControllersRequest) {
  const workflowTemplateId = request.params.workflowTemplateId
  const body = request.body as CreateWorkflowTemplateStage
  return WorkflowTemplateService.Instance.addWorkflowTemplateStage({
    ...body,
    adminId: userProfile.userId,
    workflowTemplateId,
    orgId: userProfile.organization.orgId
  } as CreateWorkflowTemplateStage, request.headers.authorization as string)
}

async function createMultipleTaskUsingTaskTemplate({ request, userProfile }: ControllersRequest) {
  const workflowId = request.params.workflowId
  const body = request.body as CreateMultipleTaskRequest
  return TaskService.Instance.createMultipleTaskUsingTaskTemplate({
    ...body,
    adminId: userProfile.userId,
    orgId: userProfile.organization.orgId,
    workflowId
  })
}

module.exports = {
  addWorkflowTemplateStage: send(addWorkflowTemplateStage, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  createMultipleTaskUsingTaskTemplate: send(createMultipleTaskUsingTaskTemplate, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] })
}
