
import { isNil } from 'lodash'
import { UserRoles } from '../../typings'
import { jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserRoleRepository {
  async saveUserRole (data: Omit<UserRoles, 'id' | 'Role'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserRoles.create(data)
  }

  async getUserRole (userId: string): Promise<UserRoles> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.UserRoles.findOne({
      where: { userId }
    })

    return jsonParse(jsonStringify(result))
  }

  async updateUserRole (userId: string, roleId: number): Promise<number[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserRoles.update({ roleId }, { where: { userId } })
  }

  async upsertUserRole (userId: string, roleId: number): Promise<void> {
    const result = await this.getUserRole(userId)
    if (!isNil(result)) {
      if (result.roleId !== roleId) await this.updateUserRole(userId, roleId)
    } else
      await this.saveUserRole({ userId, roleId })
  }
}
