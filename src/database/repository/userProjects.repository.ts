
import { WhereOptions } from 'sequelize/types'
import { UserProjects } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserProjectsRepository {
  async saveUserProjects (data: Omit<UserProjects, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserProjects.create(data)
  }

  async getUserProjects (query: WhereOptions<UserProjects>): Promise<UserProjects> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserProjects.findOne({ where: query })
  }

  async removeUserProjects (query: WhereOptions<UserProjects>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    await dbInstance.UserProjects.destroy({
      where: query
    })
  }
}
