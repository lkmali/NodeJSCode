
import { isNil } from 'lodash'
import { IncludeOptions } from 'sequelize/types'
import { UserSession, UserSessionFilter } from '../../typings'
import { isUserOnline, jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserSessionRepository {
  async saveUserLastTimeData(data: Omit<UserSession, 'id' | 'lastActiveTime'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserSession.create({ ...data, lastActiveTime: new Date() })
  }

  async upsertUserSession(data: Omit<UserSession, 'id' | 'lastActiveTime'>): Promise<void> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.UserSession.findOne({
      userId: data.userId
    })
    isNil(result) ? await this.saveUserLastTimeData(data) : await this.updateUserSessionData(result.id, data)
    return result
  }

  async updateUserSessionData(id: number, data: Omit<UserSession, 'id' | 'lastActiveTime'>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserSession.update({ ...data, lastActiveTime: new Date() }, { where: { id } })
  }

  async getAllUserSession(filter: UserSessionFilter, option: IncludeOptions = {}): Promise<UserSession[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter.userSession
    option['include'] = [
      {
        model: dbInstance.Users,
        required: false,
        where: filter.user,
        as: 'user',
        attributes: ['email', 'username', 'userId', 'profileImageKey', 'isProfileSet']
      }]
    const result = jsonParse(jsonStringify(await dbInstance.UserSession.findAll(option)))
    return result.map((value: any) => ({ ...value, status: isUserOnline(value.lastActiveTime) }))
  }
}
