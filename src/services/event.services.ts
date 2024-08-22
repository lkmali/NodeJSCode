import { isNil } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { UserEventRepository, UserRepository } from '../database/repository'
import { LoginHistoryRequest, PaginateDataType, UserEventRequest, UserEvents } from '../typings'
import { andOperator, getPaginateData, getSearchQuery, paginate } from '../utils'
export class UserEventService {
  private static instance: UserEventService
  private readonly userRepository: UserRepository
  private readonly userEventRepository: UserEventRepository
  constructor() {
    this.userRepository = new UserRepository()
    this.userEventRepository = new UserEventRepository()
  }

  async updateLastLoginTime(userId: string, type: 'email' | 'phone', loginHistory: LoginHistoryRequest): Promise<void> {
    try {
      loginHistory['deviceName'] = loginHistory['deviceName'] ?? loginHistory['devicename']
      loginHistory['deviceId'] = loginHistory['deviceId'] ?? loginHistory['deviceid']
      if (this.isValidLoginHistory(loginHistory))
        await this.userEventRepository.saveEventData({
          address: loginHistory.address,
          deviceName: loginHistory.deviceName,
          platform: loginHistory.platform,
          deviceId: loginHistory.deviceId ?? '',
          location: { type: 'Point', coordinates: [loginHistory.latitude, loginHistory.longitude] },
          isActive: true,
          isDelete: false,
          userId,
          orgId: loginHistory.orgId,
          eventName: 'LOGIN_EVENT',
          recourseName: 'USER',
          recourseId: userId,
          comment: `login by ${type}`
        })

      await this.userRepository.updateUserInformation({ userId }, {
        lastLoginTime: new Date(),
        lastActiveTime: new Date(),
        isVerified: true
      })
    } catch (_error) {

    }
  }

  async updateLastActiveTime(userId: string): Promise<void> {
    try {
      await this.userRepository.updateUserInformation({ userId }, {
        lastActiveTime: new Date()
      })
    } catch (_error) {

    }
  }

  async saveUserEvent(userId: string, request: UserEventRequest): Promise<void> {
    try {
      request['deviceName'] = request['deviceName'] ?? request['devicename']
      request['deviceId'] = request['deviceId'] ?? request['deviceid']
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.updateLastActiveTime(userId)
      if (this.isValidUserEvent(request))
        await this.userEventRepository.saveEventData({
          address: request.address,
          deviceName: request.deviceName,
          platform: request.platform,
          deviceId: request.deviceId ?? '',
          location: { type: 'Point', coordinates: [request.latitude, request.longitude] },
          isActive: true,
          isDelete: false,
          userId,
          orgId: request.orgId,
          eventName: request.eventName,
          recourseName: request.recourseName,
          recourseId: userId,
          comment: request.comment
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
    const requireFields = ['address', 'deviceName', 'platform', 'latitude', 'longitude', 'recourseName', 'recourseId', 'eventName']
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

  public async getAllUserEvent(orgId: number, query: { [key: string]: string | boolean }): Promise<PaginateDataType<UserEvents>> {
    const filter = { ...paginate(query) }
    const result = await this.userEventRepository.getAllUserEvent({ orgId, ...this.getParseQuery(query) }, filter)
    return getPaginateData<UserEvents>(filter, result)
  }

  getParseQuery(query: { [key: string]: string | boolean }): WhereOptions<UserEvents> {
    let result: WhereOptions<UserEvents> = {}

    if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
      result['id'] = query.id

    if (Object.prototype.hasOwnProperty.call(query, 'eventName') && !isNil(query['eventName']))
      result['eventName'] = query.eventName

    if (Object.prototype.hasOwnProperty.call(query, 'recourseName') && !isNil(query['recourseName']))
      result['recourseName'] = query.recourseName

    if (Object.prototype.hasOwnProperty.call(query, 'recourseId') && !isNil(query['recourseId']))
      result['recourseId'] = query.recourseId

    if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
      result['userId'] = query.userId

    if (Object.prototype.hasOwnProperty.call(query, 'deviceName') && !isNil(query['deviceName']))
      result['deviceName'] = query.deviceName

    if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
      const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
      const data = getSearchQuery(search, ['comment'])

      result = { ...andOperator([data]), ...result }
    }
    return result
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
