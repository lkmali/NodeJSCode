
import { WhereOptions } from 'sequelize/types'
import { Actions } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class ActionRepository {
  async saveAction(data: Omit<Actions, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Actions.create(data)
  }

  async getAction(actionName: string): Promise<Actions> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Actions.findOne({ where: { actionName } })
  }

  async updateActions(query: WhereOptions<Actions>, data: Partial<Actions>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Actions.update(data, { where: query })
  }
}
