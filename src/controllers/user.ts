import { isNil } from 'lodash'
import { send } from '../provider'
import { AddressService, GroupService, JWTService, ProjectService, UserService } from '../services'
import { UserSessionService } from '../services/userSession.service'
import { ControllersRequest, UserEventRequest } from '../typings'
import { getUniqArray } from '../utils'
function getUserProfile({ userProfile }: ControllersRequest) {
  return UserService.Instance.getUserProfile(userProfile)
}

async function registerNewUserByAdmin({ userProfile, request }: ControllersRequest) {
  const data = request.body
  const result = await UserService.Instance.registerNewUserByAdmin({
    username: data.username,
    phone: data.phone,
    email: data.email,
    orgId: userProfile.organization.orgId,
    role: data.role
  }, {
    adminEmail: userProfile.email,
    adminUserId: userProfile.userId
  })
  await AddressService.Instance.addUserAddress(result.userId, {
    address: data.address.address,
    city: data.address.city,
    state: data.address.state,
    country: data.address.country,
    userId: result.userId,
    pinCode: data.address.pinCode
  }, userProfile.userId)
  return result
}

async function getAllUser({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'username'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserService.Instance.getAllUser(userProfile.organization.orgId, query)
}
async function getUserInformationByAdmin({ userProfile, request }: ControllersRequest) {
  const userId = request.params.userId
  return UserService.Instance.getUserInformationByAdmin(userProfile.organization.orgId, userId)
}

async function getUserProfileSignUrl({ userProfile, request }: ControllersRequest) {
  const body = request.body
  body['isProfileSet'] = userProfile.isProfileSet ?? false
  body['profileImageKey'] = userProfile.profileImageKey
  return UserService.Instance.getUserProfileSignUrl(userProfile.userId, body)
}
async function getImageDownloadSignInUrlFromAdmin({ request }: ControllersRequest) {
  const key = request.query.key
  return UserService.Instance.getImageDownloadSignInUrlFromAdmin(key as string)
}

async function getImageDownloadSignInUrlForUser({ userProfile }: ControllersRequest) {
  return UserService.Instance.getImageDownloadSignInUrlForUser(userProfile.userId)
}

async function conformAddedImageUrl({ userProfile }: ControllersRequest) {
  await UserService.Instance.conformAddedImageUrl(userProfile.userId)
  const result = await UserService.Instance.prepareUserProfileData(userProfile.email, 'email')
  return {
    userId: userProfile.userId,
    isNewUser: userProfile.username.toString() === userProfile.phone.toString(),
    token: JWTService.Instance.generateToken(result)
  }
}

async function getUserAndGroups({ request, userProfile }: ControllersRequest) {
  const userId = request.params.userId
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'name'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserService.Instance.getUserAndGroups(userId, userProfile.organization.orgId)
}

async function updateUserInformationByAdmin({ request, userProfile }: ControllersRequest) {
  const data = request.body
  const userId = request.params.userId
  await UserService.Instance.updateUserByAdmin(userId, {
    username: data.username,
    phone: data.phone,
    email: data.email,
    orgId: userProfile.organization.orgId,
    role: data.role
  }, userProfile.userId)
  await AddressService.Instance.addUserAddress(userId, {
    address: data.address.address,
    city: data.address.city,
    state: data.address.state,
    country: data.address.country,
    userId,
    pinCode: data.address.pinCode
  }, userProfile.userId)
}
async function activateInActiveUser({ request, userProfile }: ControllersRequest) {
  const userId = request.params.userId
  const isActive = request.params.status === 'active'
  await UserService.Instance.activateInActiveUser(userProfile.organization.orgId, userId, isActive, userProfile.userId)
}

async function blockUnBlockUser({ request, userProfile }: ControllersRequest) {
  const userId = request.params.userId
  const isBlocked = request.params.status === 'block'
  await UserService.Instance.blockUnBlockUser(userProfile.organization.orgId, userId, isBlocked)
}
async function updateUserAddress({ request, userProfile }: ControllersRequest) {
  const data = request.body
  const userId = request.params.userId
  await UserService.Instance.getUserInformation(userId, userProfile.organization.orgId)
  await AddressService.Instance.addUserAddress(userId, {
    address: data.address.address,
    city: data.address.city,
    state: data.address.state,
    country: data.address.country,
    userId,
    pinCode: data.address.pinCode
  }, userProfile.userId)
}

async function removeUserGroups({ request, userProfile }: ControllersRequest) {
  const data = request.body
  const userId = request.params.userId
  await GroupService.Instance.removeUserGroups(userId, userProfile.organization.orgId, getUniqArray(data))
}

async function getUserAddress({ request, userProfile }: ControllersRequest) {
  const userId = request.params.userId
  await UserService.Instance.getUserInformation(userId, userProfile.organization.orgId)
  return AddressService.Instance.getUserAddress(userId)
}

async function getUserProjectByAdmin({ request, userProfile }: ControllersRequest) {
  return ProjectService.Instance.getUserProjectByAdmin(request.params.userId,
    userProfile.organization.orgId)
}

async function setActiveTime({ userProfile, request }: ControllersRequest) {
  const data = request.body
  data['orgId'] = userProfile.organization.orgId
  return UserSessionService.Instance.setActiveTime(userProfile.userId, {
    ...request.headers,
    ...data,
    orgId: userProfile.organization.orgId
  } as unknown as UserEventRequest)
}

async function sendUserSessionNotification() {
  return UserSessionService.Instance.sendUserSessionNotification()
}

function getAllActiveUser({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'lastActiveTime'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return UserSessionService.Instance.getAllUserSession(userProfile.organization.orgId, query)
}

module.exports = {

  getUserInformationByAdmin: send(getUserInformationByAdmin, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  activateInActiveUser: send(activateInActiveUser, { auth: 'jwtAuth', code: 204, roles: ['admin', 'superAdmin'] }),
  blockUnBlockUser: send(blockUnBlockUser, { auth: 'jwtAuth', code: 204, roles: ['admin', 'superAdmin'] }),
  registerNewUserByAdmin: send(registerNewUserByAdmin, { auth: 'jwtAuth', code: 204, roles: ['admin', 'superAdmin'] }),
  updateUserInformationByAdmin: send(updateUserInformationByAdmin, { auth: 'jwtAuth', code: 204, roles: ['admin', 'superAdmin'] }),
  updateUserAddress: send(updateUserAddress, { auth: 'jwtAuth', code: 204, roles: ['admin', 'superAdmin'] }),
  getAllUser: send(getAllUser, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getAllActiveUser: send(getAllActiveUser, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getUserAddress: send(getUserAddress, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getUserProfile: send(getUserProfile, { auth: 'jwtAuth' }),
  getUserProfileSignUrl: send(getUserProfileSignUrl, { auth: 'jwtAuth' }),
  getImageDownloadSignInUrlFromAdmin: send(getImageDownloadSignInUrlFromAdmin, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] }),
  getImageDownloadSignInUrlForUser: send(getImageDownloadSignInUrlForUser, { auth: 'jwtAuth' }),
  conformAddedImageUrl: send(conformAddedImageUrl, { auth: 'jwtAuth' }),
  setActiveTime: send(setActiveTime, { auth: 'jwtAuth' }),
  sendUserSessionNotification: send(sendUserSessionNotification, { auth: 'secretToken' }),
  getUserAndGroups: send(getUserAndGroups, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  removeUserGroups: send(removeUserGroups, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getUserProjectByAdmin: send(getUserProjectByAdmin, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] })
}
