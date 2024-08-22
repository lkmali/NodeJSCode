
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { ResourceSharing, SharingFilter } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class ResourceSharingRepository {
  async saveResourceSharing(data: Omit<ResourceSharing, 'id'>): Promise<ResourceSharing> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ResourceSharing.create(data)
  }

  async getResourceData(query: WhereOptions<ResourceSharing>): Promise<ResourceSharing> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ResourceSharing.findOne({ where: query })
  }

  async getAllResourceData(query: WhereOptions<ResourceSharing>): Promise<ResourceSharing[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ResourceSharing.findAll({ where: query })
  }

  async removeResourceData(id: number) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    await dbInstance.ResourceSharing.destroy({
      where: { id }
    })
  }

  async getAllResourceSharing(filter: SharingFilter, option: IncludeOptions = {}): Promise<ResourceSharing[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter.share
    option['include'] = [
      {
        model: dbInstance.UserProjectForm,
        required: true,
        where: filter.userProjectForm,
        as: 'fromData',
        attributes: ['title', 'status', 'userId'],
        include: [{
          model: dbInstance.Users,
          required: true,
          where: filter.users,
          as: 'user',
          attributes: ['email', 'username', 'userId']
        }]
      }]

    return dbInstance.ResourceSharing.findAll(option)
  }
}
