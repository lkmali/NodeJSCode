import { isNil } from 'lodash'
import { send } from '../provider'
import { SharedResourceService } from '../services'
import { ControllersRequest, ResourceSharing } from '../typings'

async function sharedResourceToUser({ request, userProfile }: ControllersRequest) {
  const data = request.body as Omit<ResourceSharing, 'id'>[]
  const resource = request.params.resource as any
  return SharedResourceService.Instance.saveSharedResource(data, resource, {
    email: userProfile.email,
    userId: userProfile.userId,
    orgId: userProfile.organization.orgId
  })
}

async function resendEmailToSharedUser({ request, userProfile }: ControllersRequest) {
  const email = request.params.email
  const resource = request.params.resource as any
  return SharedResourceService.Instance.resendEmailToSharedUser(email, resource, userProfile.email)
}

async function getAllSharedResource({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'email'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  query['searchBy'] = !isNil(query['searchBy']) ? query['searchBy'] : 'email'
  if (Object.prototype.hasOwnProperty.call(query, 'withoutFilter') && !isNil(query['withoutFilter']))
    return SharedResourceService.Instance.getAllSharedResourceWithoutFilter(userProfile.organization.orgId, query)

  return SharedResourceService.Instance.getAllSharedResourceByFilter(userProfile.organization.orgId, query)
}

async function deleteResourceData({ request, userProfile }: ControllersRequest) {
  await SharedResourceService.Instance.deleteResourceData(Number(request.params.id), userProfile.organization.orgId)
}

// async function getSharedResourceDataByUser ({ request, userProfile }: ControllersRequest) {
//   const resource = request.params.resource as any
//   const query = request.query as {[key: string]: string| boolean}
//   return SharedResourceService.Instance.getSharedResourceDataByResource(userProfile.email, resource, query)
// }

// async function getUserFormFieldDataBySharedUser({ request, userProfile }: ControllersRequest) {
//   const userFromId = Number(request.params.userFromId)
//   await SharedResourceService.Instance.validateResourceData({
//     userFromId,
//     resource: 'form-data',
//     email: userProfile.email
//   })
//   return UserFormFieldService.Instance.getUserFormFieldDataByAdmin(userFromId)
// }

// async function downloadXlsx({ request, response, userProfile }: ControllersRequest) {
//   const body = await SharedResourceService.Instance.downloadXlsxValidation(userProfile.email, request.body)
//   return UserProjectFormService.Instance.downloadXlsx({ ...body, status: request.body.status ?? [] }, response)
// }

module.exports = {
  sharedResourceToUser: send(sharedResourceToUser, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getAllSharedResource: send(getAllSharedResource, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  resendEmailToSharedUser: send(resendEmailToSharedUser, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  deleteResourceData: send(deleteResourceData, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] })
  // getSharedResourceDataByUser: send(getSharedResourceDataByUser, { auth: 'guestJwtAuth' }),
  // getUserFormFieldDataBySharedUser: send(getUserFormFieldDataBySharedUser, { auth: 'guestJwtAuth' }),
  // downloadXlsx: send(downloadXlsx, { auth: 'guestJwtAuth' })
}
