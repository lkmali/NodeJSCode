
import { WhereOptions } from 'sequelize/types'
import { Roles } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class RoleRepository {
  async saveRole(data: Omit<Roles, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Roles.create(data)
  }

  async getRole(query: WhereOptions<Roles>): Promise<Roles | null> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Roles.findOne({ where: query })
  }

  async getAllRole(query: WhereOptions<Roles>): Promise<Roles[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Roles.findAll({ where: query })
  }

  async getSuperAdminRoleId(): Promise<Roles> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Roles.findOne({ where: { isDefaultAdmin: true } })
  }

  async bulkInsert(name: string, description: string) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Roles.create({ name, description })
  }

  async updateRoles(query: WhereOptions<Roles>, data: Partial<Roles>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Roles.update(data, { where: query })
  }
}
