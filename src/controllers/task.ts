import { isNil } from 'lodash'
import { send } from '../provider'
import { TaskService, UserTaskService } from '../services'
import { TaskNotificationService } from '../services/taskNotification.service'
import { ControllersRequest, UpdateTaskRequest, UserEventRequest } from '../typings'
import { saveUserEvent } from '../utils'

async function updateTaskByAdmin({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const body = request.body as UpdateTaskRequest

  return TaskService.Instance.updateTaskByAdmin(taskId, {
    ...body,
    orgId: userProfile.organization.orgId
  }, userProfile.userId)
}

async function startTask({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  return TaskService.Instance.startTask(taskId, userProfile.organization.orgId, userProfile.userId)
}

async function assignTaskToUsers({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const userIds = request.body as string[]

  return TaskService.Instance.assignTaskToUsers(
    {
      taskId,
      userIds,
      adminId: userProfile.userId,
      orgId: userProfile.organization.orgId
    }
  )
}

async function getTaskUserByAdmin({ request }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  return TaskService.Instance.getTaskUserByAdmin(taskId)
}

async function getFormsByTasksByAdmin({ request }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  return TaskService.Instance.getFormsByTasksByAdmin(taskId)
}

// async function addProjectFormInTask({ request, userProfile }: ControllersRequest) {
//   const taskId = Number(request.params.taskId)
//   const projectFormIds = request.body as number[]

//   return TaskService.Instance.addProjectFormInTask(
//     {
//       taskId,
//       projectFormIds,
//       adminId: userProfile.userId,
//       orgId: userProfile.organization.orgId
//     }
//   )
// }

async function deleteUsersFromTask({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const ids = request.body as number[]

  return TaskService.Instance.deleteUsersFromTask(
    taskId, userProfile.organization.orgId, ids
  )
}

async function deleteFormFormTask({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const ids = request.body as number[]

  return TaskService.Instance.deleteFormFormTask(
    taskId, userProfile.organization.orgId, ids
  )
}

async function activateInActiveTask({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const isActive = request.params.status === 'active'
  await TaskService.Instance.activateInActiveTask(userProfile.organization.orgId, taskId, isActive, userProfile.userId)
}

async function getAllTaskByAdmin({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'updatedAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  query['searchBy'] = !isNil(query['searchBy']) ? query['searchBy'] : 'taskName'
  return TaskService.Instance.getAllTaskByAdmin({ ...query, orgId: userProfile.organization.orgId })
}

async function getAllUserTaskByAdmin({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'updatedAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  query['searchBy'] = !isNil(query['searchBy']) ? query['searchBy'] : 'taskName'
  return TaskService.Instance.getAllUserTaskByAdmin({ ...query, orgId: userProfile.organization.orgId })
}

async function getUserTaskByUserId({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'updatedAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserTaskService.Instance.getUserTaskByUserId(userProfile.userId, { ...query, orgId: userProfile.organization.orgId })
}

async function getTaskFormsByTaskId({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'updatedAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserTaskService.Instance.getTaskFormsByTaskId(taskId, { ...query, orgId: userProfile.organization.orgId }, userProfile.userId)
}
async function deleteTasks({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  return TaskService.Instance.deleteTaskByAdmin(taskId, userProfile.organization.orgId)
}

async function updateStatusByUser({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const status = Number(request.body.status)
  const data = request.body
  await UserTaskService.Instance.updateStatusByUser(userProfile.userId, taskId, status)
  const taskStatus = {
    1: 'ACCEPT_TASK',
    4: 'REJECT_TASK'
  } as { [key: string]: string }
  saveUserEvent(userProfile.userId, {
    ...request.headers,
    ...data,
    orgId: userProfile.organization.orgId,
    eventName: taskStatus[String(status)],
    recourseId: taskId,
    recourseName: 'TASK',
    comment: `user ${taskStatus[String(status)]}`
  } as UserEventRequest)
}

async function approveUserTaskByAdmin({ request, userProfile }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  const userId = request.params.userId
  return TaskService.Instance.approveUserTaskByAdmin(userId, taskId, userProfile.userId,
    request.headers.authorization as string)
}

function sendNotificationToTaskUsers({ request }: ControllersRequest) {
  const taskId = Number(request.params.taskId)
  return TaskNotificationService.Instance.sendNotificationToTaskUsers(taskId)
}

module.exports = {
  deleteTasks: send(deleteTasks, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  startTask: send(startTask, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  // createTask: send(createTask, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  updateTaskByAdmin: send(updateTaskByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  assignTaskToUsers: send(assignTaskToUsers, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  // addProjectFormInTask: send(addProjectFormInTask, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  deleteUsersFromTask: send(deleteUsersFromTask, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  deleteFormFormTask: send(deleteFormFormTask, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  activateInActiveTask: send(activateInActiveTask, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getAllTaskByAdmin: send(getAllTaskByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getAllUserTaskByAdmin: send(getAllUserTaskByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getFormsByTasksByAdmin: send(getFormsByTasksByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getTaskUserByAdmin: send(getTaskUserByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getUserTaskByUserId: send(getUserTaskByUserId, { auth: 'jwtAuth' }),
  getTaskFormsByTaskId: send(getTaskFormsByTaskId, { auth: 'jwtAuth' }),
  updateStatusByUser: send(updateStatusByUser, { auth: 'jwtAuth' }),
  approveUserTaskByAdmin: send(approveUserTaskByAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  sendNotificationToTaskUsers: send(sendNotificationToTaskUsers, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] })

}
