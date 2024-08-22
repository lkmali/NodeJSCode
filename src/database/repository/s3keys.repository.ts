
import { WhereOptions } from 'sequelize/types'
import { S3Keys } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class S3KeysRepository {
  async saveKey(data: Omit<S3Keys, 'id'>): Promise<S3Keys> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.S3Keys.create(data)
  }

  async getKey(query: WhereOptions<S3Keys>): Promise<S3Keys> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.S3Keys.findOne({ where: query })
  }

  async removeKeys(id: string) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    await dbInstance.S3Keys.destroy({
      where: { id }
    })
  }
}
