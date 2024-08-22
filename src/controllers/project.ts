import { isNil } from 'lodash'
import { send } from '../provider'
import { ProjectService } from '../services'
import { ControllersRequest } from '../typings'

async function createProject({ request, userProfile }: ControllersRequest) {
  const data = request.body
  data['orgId'] = userProfile.organization.orgId
  return ProjectService.Instance.createProject(data, userProfile.userId)
}

async function getAllProject({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'name'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return ProjectService.Instance.getAllProject(userProfile.organization.orgId, query)
}

async function updateProject({ request, userProfile }: ControllersRequest) {
  const data = request.body
  data['orgId'] = userProfile.organization.orgId
  await ProjectService.Instance.updateProject(data, request.params.projectId, userProfile.userId)
}

async function getProject({ request, userProfile }: ControllersRequest) {
  return ProjectService.Instance.getProject(userProfile.organization.orgId, request.params.projectId)
}

async function getProjectNames({ userProfile }: ControllersRequest) {
  return ProjectService.Instance.getProjectNames(userProfile.organization.orgId)
}

async function activateInActiveProject({ request, userProfile }: ControllersRequest) {
  const projectId = request.params.projectId
  const isActive = request.params.status === 'active'
  await ProjectService.Instance.activateInActiveProject(userProfile.organization.orgId, projectId, isActive, userProfile.userId)
}
async function getProjectGroupByAdmin({ request, userProfile }: ControllersRequest) {
  return ProjectService.Instance.getProjectGroupByAdmin(request.params.projectId,
    userProfile.organization.orgId)
}

async function getUserProject({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }

  query['isDelete'] = false
  query['isActive'] = true
  return ProjectService.Instance.getUserProject(userProfile.userId,
    userProfile.organization.orgId, query)
}

// async function removeProjectsUsers ({ request, userProfile }: ControllersRequest) {
//   const data = request.body
//   await ProjectService.Instance.removeProjectsUsers({
//     orgId: userProfile.organization.orgId,
//     userIds: getUniqArray(data),
//     projectId: request.params.projectId
//   })
// }

module.exports = {
  getProjectNames: send(getProjectNames, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  updateProject: send(updateProject, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  activateInActiveProject: send(activateInActiveProject, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  createProject: send(createProject, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getAllProject: send(getAllProject, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getProjectGroupByAdmin: send(getProjectGroupByAdmin, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getProject: send(getProject, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getUserProject: send(getUserProject, { auth: 'jwtAuth' })
}
