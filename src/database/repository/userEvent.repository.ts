
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { UserEvents } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserEventRepository {
  async saveEventData(data: Omit<UserEvents, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserEvents.create(data)
  }

  async getAllUserEvent(query: WhereOptions<UserEvents>, option: IncludeOptions = {}): Promise<UserEvents[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['include'] = [
      {
        model: dbInstance.Users,
        required: false,
        attributes: ['email', 'username', 'userId', 'profileImageKey', 'isProfileSet']
      }]
    return dbInstance.UserEvents.findAll(option)
  }
}
