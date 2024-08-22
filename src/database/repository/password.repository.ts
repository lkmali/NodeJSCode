
import { PasswordService } from '../../services/password.service'
import { generatePassword } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class PasswordRepository {
     private readonly passwordService: PasswordService
     constructor () {
       this.passwordService = new PasswordService()
     }

     async saveUserPassword (userId: string, password: string): Promise<void> {
       const dbInstance = await DatabaseInitializer.getInstance().getConnection()
       const hashedPassword = await this.passwordService.hashPassword(password)
       return dbInstance.Password.create({ userId, password: hashedPassword })
     }

     async saveUserDefaultPassword (userId: string): Promise<void> {
       const dbInstance = await DatabaseInitializer.getInstance().getConnection()
       const password = generatePassword()
       const hashedPassword = await this.passwordService.hashPassword(password)
       return dbInstance.Password.create({ userId, password: hashedPassword })
     }

     async updateUserPassword (userId: string, password: string): Promise<any> {
       const dbInstance = await DatabaseInitializer.getInstance().getConnection()
       const hashedPassword = await this.passwordService.hashPassword(password)
       return dbInstance.Password.update({ password: hashedPassword }, { where: { userId } })
     }
}
