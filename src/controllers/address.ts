import { send } from '../provider'
import { AddressService } from '../services'
import { ControllersRequest, UserEventRequest } from '../typings'
import { saveUserEvent } from '../utils'
async function addUserAddress ({ userProfile, request }: ControllersRequest) {
  const data = request.body
  const result = await AddressService.Instance.addUserAddress(userProfile.userId, {
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    userId: userProfile.userId,
    pinCode: data.pinCode
  }, userProfile.userId)

  saveUserEvent(userProfile.userId, {
    ...request.headers,
    ...data,
    orgId: userProfile.organization.orgId,
    eventName: 'UPDATE_ADDRESS',
    recourseId: result.id,
    recourseName: 'ADDRESS'
  } as UserEventRequest)
  return result
}

async function getUserAddress ({ userProfile }: ControllersRequest) {
  return AddressService.Instance.getUserAddress(userProfile.userId)
}

module.exports = {
  addUserAddress: send(addUserAddress, { auth: 'jwtAuth', code: 204 }),
  getUserAddress: send(getUserAddress, { auth: 'jwtAuth' })
}
