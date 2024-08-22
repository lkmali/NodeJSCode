
import { Tokens } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class TokenRepository {
  async saveToken (data: Tokens) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tokens.create(data)
  }

  async upsertToken (data: Omit<Tokens, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tokens.upsert(data)
  }

  async getToken (verificationKey: string): Promise<Tokens> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tokens.findOne({ where: { verificationKey } })
  }

  async getTokenWithOtp (verificationKey: string, verifyCode: string): Promise<Tokens> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tokens.findOne({ where: { verificationKey, verifyCode } })
  }

  async removeToken (id: number) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    await dbInstance.Tokens.destroy({
      where: { id }
    })
  }
}
