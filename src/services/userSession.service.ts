import { isNil } from 'lodash'
import { UserSessionRepository } from '../database/repository'
import { PaginateDataType, UserEventRequest, UserSession, UserSessionFilter } from '../typings'
import { badRequest, getPaginateData, getUserQueryForAdmin, getUserSessionQueryForAdmin, paginate } from '../utils'
import { FirebaseService } from './firebase.service'
export class UserSessionService {
  private static instance: UserSessionService

  private readonly userSessionRepository: UserSessionRepository

  constructor() {
    this.userSessionRepository = new UserSessionRepository()
  }

  async setActiveTime(userId: string, request: UserEventRequest): Promise<void> {
    try {
      request['deviceName'] = request['deviceName'] ?? request['devicename']
      request['deviceId'] = request['deviceId'] ?? request['deviceid']
      const isValidRequest = this.isValidUserEvent(request)
      if (!isValidRequest)
        throw badRequest('missing require field')

      await this.userSessionRepository.upsertUserSession({
        address: request.address,
        deviceName: request.deviceName,
        platform: request.platform,
        deviceId: request.deviceId ?? '',
        location: { type: 'Point', coordinates: [request.latitude, request.longitude] },
        isActive: true,
        isDelete: false,
        userId,
        orgId: request.orgId
      })
    } catch (_error) {

    }
  }

  isValidLoginHistory(loginHistory: any): boolean {
    const requireFields = ['address', 'deviceName', 'platform', 'latitude', 'longitude']
    let isValid = true
    for (const field of requireFields) {
      const isValidField = Object.prototype.hasOwnProperty.call(loginHistory, field) &&
        !isNil(loginHistory[field]) && loginHistory[field].length > 0
      if (!isValidField) {
        isValid = false
        break
      }
    }
    return isValid
  }

  isValidUserEvent(loginHistory: any): boolean {
    const requireFields = ['address', 'deviceName', 'platform', 'latitude', 'longitude']
    let isValid = true
    for (const field of requireFields) {
      const isValidField = Object.prototype.hasOwnProperty.call(loginHistory, field) &&
        !isNil(loginHistory[field]) && loginHistory[field].length > 0
      if (!isValidField) {
        isValid = false
        break
      }
    }
    return isValid
  }

  public async getAllUserSession(orgId: number, query: { [key: string]: string | boolean }): Promise<PaginateDataType<UserSession>> {
    const filter = { ...paginate(query) }
    const result = await this.userSessionRepository.getAllUserSession(this.getParseQuery({ ...query, orgId }), filter)
    return getPaginateData<UserSession>(filter, result)
  }

  getParseQuery(query: { [key: string]: string | boolean | number }): UserSessionFilter {
    return {
      userSession: getUserSessionQueryForAdmin({ ...query, search: query['searchBy'] === 'session' ? query['search'] : '' }),
      user: getUserQueryForAdmin({ search: query['searchBy'] === 'user' ? query['search'] : '' })
    }
  }

  public async sendUserSessionNotification(): Promise<void> {
    const data = {
      propertyType: 'APP_RUNNING',
      event: 'APP_RUNNING',
      title: 'APP_RUNNING',
      body: 'APP_RUNNING'
    }
    await FirebaseService.Instance.sendTopicNotifications(JSON.stringify(data), 'user')
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
