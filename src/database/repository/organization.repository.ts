
import { Organizations } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class OrganizationRepository {
  async saveOrganization (data: Omit<Organizations, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Organizations.create(data)
  }

  async getOrganization (orgName: string, clientId: number): Promise<Organizations> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Organizations.findOne({ where: { orgName, clientId } })
  }
}
