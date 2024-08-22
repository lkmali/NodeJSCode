import { isNil } from 'lodash'
import { send } from '../provider'
import { UserEventService } from '../services'
import { ControllersRequest, UserEventRequest } from '../typings'

async function saveUserEvent({ request, userProfile }: ControllersRequest) {
  const data = request.body
  data['orgId'] = userProfile.organization.orgId
  return UserEventService.Instance.saveUserEvent(userProfile.userId, {
    ...request.headers,
    ...data,
    orgId: userProfile.organization.orgId
  } as unknown as UserEventRequest)
}

async function getAllUserEvent({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'createdAt'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserEventService.Instance.getAllUserEvent(userProfile.organization.orgId, query)
}

module.exports = {
  getAllUserEvent: send(getAllUserEvent, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  saveUserEvent: send(saveUserEvent, { auth: 'jwtAuth' })
}
