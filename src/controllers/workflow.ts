import { send } from '../provider'
import { TaskService, WorkflowService } from '../services'
import { ControllersRequest, CreateWorkflowStage } from '../typings'

async function addWorkflowStage({ request, userProfile }: ControllersRequest) {
  const workflowId = request.params.workflowId
  const body = request.body as CreateWorkflowStage
  return WorkflowService.Instance.addWorkflowStage({
    ...body,
    adminId: userProfile.userId,
    workflowId,
    orgId: userProfile.organization.orgId
  } as unknown as CreateWorkflowStage, request.headers.authorization as string)
}

async function deleteTaskByWorkflowId({ request, userProfile }: ControllersRequest) {
  const workflowId = request.params.workflowId
  return TaskService.Instance.removeTaskByWorkflowId(workflowId, userProfile.organization.orgId)
}

module.exports = {
  addWorkflowStage: send(addWorkflowStage, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  deleteTaskByWorkflowId: send(deleteTaskByWorkflowId, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] })
}
