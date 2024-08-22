import { isNil } from 'lodash'
import { send } from '../provider'
import { FirebaseService, JWTService, SharedResourceService, UserEventService, UserService } from '../services'
import { ControllersRequest, LoginHistoryRequest, UpdateUserInformation } from '../typings'

async function sendOtp({ request }: ControllersRequest) {
  const userServices = new UserService()
  const phone = request.body['phone']
  await userServices.sendOtp(phone)
}

async function updateUserInformation({ request, userProfile }: ControllersRequest) {
  const userServices = new UserService()
  const jWTService = new JWTService()
  const data: UpdateUserInformation = {
    phone: userProfile.phone,
    userId: userProfile.userId,
    username: request.body['username']
  }
  if (!isNil(request.body['email']))
    data.email = request.body['email']

  const result = await userServices.updateUserInformation(data)
  userProfile.username = result.username
  userProfile.email = !isNil(result.email) ? result.email : userProfile.email
  return { userId: userProfile.userId, token: jWTService.generateToken(userProfile) }
}

function loginPhone({ userProfile, request }: ControllersRequest) {
  const jWTService = new JWTService()
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  UserEventService.Instance.updateLastLoginTime(userProfile.userId, 'phone',
    {
      ...request.headers,
      email: userProfile.email,
      orgId: userProfile.organization.orgId
    } as unknown as LoginHistoryRequest)
  if (!isNil(request.body.token))
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    FirebaseService.Instance.saveFirebaseMessagingToken(request.body.token, userProfile.userId)

  return {
    userId: userProfile.userId,
    isNewUser: userProfile.username.toString() === userProfile.phone.toString(),
    token: jWTService.generateToken(userProfile)
  }
}

async function sharedLogin({ request }: ControllersRequest) {
  const jWTService = new JWTService()
  const email = await SharedResourceService.Instance.getSharedUserEmail(request.params.key)
  return {
    token: jWTService.generateToken({ userId: email, email, roles: ['sharedUser'] }, ['guest'])
  }
}

function loginWithEmailPassword({ userProfile, request }: ControllersRequest) {
  const jWTService = new JWTService()
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  UserEventService.Instance.updateLastLoginTime(userProfile.userId, 'email',
    { ...request.headers, email: userProfile.email, orgId: userProfile.organization.orgId } as unknown as LoginHistoryRequest)

  if (!isNil(request.body.token))
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    FirebaseService.Instance.saveFirebaseMessagingToken(request.body.token, userProfile.userId)
  return { userId: userProfile.userId, token: jWTService.generateToken(userProfile) }
}

async function resetPassword({ userProfile, request }: ControllersRequest) {
  const userServices = new UserService()
  return userServices.setUserPassword(userProfile.userId, request.body['password'])
}

async function sendResetPasswordLink({ request }: ControllersRequest) {
  const userServices = new UserService()
  return userServices.sendResetPasswordLink(request.body['email'])
}

module.exports = {
  sendOtp: send(sendOtp, { code: 204 }),
  sendResetPasswordLink: send(sendResetPasswordLink, { code: 204 }),
  sharedLogin: send(sharedLogin, {}),
  updateUserInformation: send(updateUserInformation, { auth: 'jwtAuth' }),
  loginPhone: send(loginPhone, { auth: 'otpAuth', async: false }),
  loginWithEmailPassword: send(loginWithEmailPassword, { auth: 'basicAuth', async: false }),
  resetPassword: send(resetPassword, { auth: 'emailAuth', code: 204 })
}
