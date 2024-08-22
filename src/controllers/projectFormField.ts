import { send } from '../provider'
import { ProjectFormFieldService } from '../services'
import { ControllersRequest } from '../typings'

async function createProjectFormField ({ request, userProfile }: ControllersRequest) {
  const projectFormId = Number(request.params.projectFormId)
  const orgId = userProfile.organization.orgId
  await ProjectFormFieldService.Instance.createProjectFormField(request.body, orgId, projectFormId)
}

async function getProjectFormField ({ request }: ControllersRequest) {
  const projectFormId = Number(request.params.projectFormId)
  return ProjectFormFieldService.Instance.getProjectFormField(projectFormId)
}

async function getAllFormFieldType () {
  return ProjectFormFieldService.Instance.getAllFormFieldType()
}

module.exports = {
  createProjectFormField: send(createProjectFormField, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getProjectFormField: send(getProjectFormField, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getAllFormFieldType: send(getAllFormFieldType, { auth: 'jwtAuth' })
}
