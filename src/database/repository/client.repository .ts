
import { Clients } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class ClientRepository {
  async saveClientInformation (data: Omit<Clients, 'id'>): Promise<Clients> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Clients.create(data)
  }

  async getClientInformation (name: string): Promise<Clients> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Clients.findOne({ where: { name } })
  }
}
