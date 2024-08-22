
import { OrgAddress, UserAddress } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class AddressRepository {
  async saveUserAddress (data: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Addresses.create(data)
  }

  async getUserAddress (userId: string): Promise<UserAddress | null> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Addresses.findOne({ where: { userId } })
  }

  async updateUserAddress (userId: string, address: Omit<UserAddress, 'id'>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Addresses.update(address, { where: { userId } })
  }

  async saveOrgAddress (data: Omit<OrgAddress, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Addresses.create(data)
  }

  async getOrgAddress (userId: string): Promise<OrgAddress | null> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Addresses.findOne({ where: { userId } })
  }

  async updateOrgAddress (userId: string, address: Omit<OrgAddress, 'id'>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Addresses.update(address, { where: { userId } })
  }
}
