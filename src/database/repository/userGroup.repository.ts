
import Sequelize from 'sequelize'
import { UserGroupRoleAndPermission, UserGroups } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserGroupRepository {
  async saveUserGroup (data: Omit<UserGroups, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserGroups.create(data)
  }

  async getUserGroup (data: Partial<UserGroups>): Promise<UserGroups> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserGroups.findOne({ where: data })
  }

  async removeUserGroup (data: Partial<UserGroups>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    await dbInstance.UserGroups.destroy({
      where: data
    })
  }

  async getUserGroupRoleAndPermission (groupId: number[]): Promise<UserGroupRoleAndPermission[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserGroups.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: groupId
        }
      },
      attributes: ['groupId'],
      include: [
        {
          model: dbInstance.Roles,
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: dbInstance.Actions,
          required: true,
          attributes: ['id', 'actionName']
        }]
    })
  }
}
