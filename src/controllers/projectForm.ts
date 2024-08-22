import { isNil } from 'lodash'
import { send } from '../provider'
import { ProjectFormService } from '../services'
import { ControllersRequest } from '../typings'

async function createProjectForm({ request, userProfile }: ControllersRequest) {
  const projectFormService = new ProjectFormService()
  const data = request.body
  return projectFormService.createProjectForm(data, userProfile.organization.orgId, userProfile.userId)
}

async function updateProjectForm({ request, userProfile }: ControllersRequest) {
  const projectFormService = new ProjectFormService()
  const data = request.body
  const projectFormId = Number(request.params.projectFormId)
  await projectFormService.updateProjectForm(projectFormId, data, userProfile.organization.orgId, userProfile.userId)
}

async function publishProjectForm({ request, userProfile }: ControllersRequest) {
  const projectFormService = new ProjectFormService()
  const projectFormId = Number(request.params.projectFormId)
  await projectFormService.publishProjectForm(projectFormId, userProfile.organization.orgId, userProfile.userId)
}
async function getProjectFormByAdmin({ request, userProfile }: ControllersRequest) {
  const projectFormService = new ProjectFormService()
  const projectFormId = Number(request.params.projectFormId)
  return projectFormService.getProjectFormById(projectFormId, userProfile.organization.orgId)
}

async function getAllProjectForm({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'name'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  query['searchBy'] = !isNil(query['searchBy']) ? query['searchBy'] : 'formName'
  return ProjectFormService.Instance.getAllProjectForm(userProfile.organization.orgId, query)
}

async function getProjectFormNames({ request, userProfile }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  return ProjectFormService.Instance.getProjectFormNames(userProfile.organization.orgId, query)
}

// async function getProjectFormByUser({ userProfile, request }: ControllersRequest) {
//   const query = request.query as { [key: string]: string | boolean }
//   query['isDelete'] = false
//   query['isActive'] = true
//   return ProjectFormService.Instance.getProjectFormByUser(userProfile.userId,
//     userProfile.organization.orgId, query)
// }

async function activateInActiveProjectForm({ request, userProfile }: ControllersRequest) {
  const projectFormId = Number(request.params.projectFormId)
  const isActive = request.params.status === 'active'
  await ProjectFormService.Instance.activateInActiveProjectForm(userProfile.organization.orgId, projectFormId, isActive, userProfile.userId)
}

module.exports = {
  getProjectFormByAdmin: send(getProjectFormByAdmin, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getProjectFormNames: send(getProjectFormNames, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  publishProjectForm: send(publishProjectForm, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  createProjectForm: send(createProjectForm, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  updateProjectForm: send(updateProjectForm, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getAllProjectForm: send(getAllProjectForm, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  // getProjectFormByUser: send(getProjectFormByUser, { auth: 'jwtAuth', code: 204 }),
  activateInActiveProjectForm: send(activateInActiveProjectForm, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] })
}
