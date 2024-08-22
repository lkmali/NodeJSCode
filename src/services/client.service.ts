import { gt, isNil } from 'lodash'
import { ClientRepository, UserRepository } from '../database/repository'
import { ClientRegistrationRequest } from '../typings'
import { unauthorized } from '../utils'
import { SeederService } from './seeder.service'
export class ClientService {
   private readonly seederService: SeederService
   private readonly userRepository: UserRepository
     private readonly clientRepository: ClientRepository

     constructor () {
       this.seederService = new SeederService()
       this.userRepository = new UserRepository()
       this.clientRepository = new ClientRepository()
     }

     async registerNewClient (request: ClientRegistrationRequest): Promise<void> {
       const {
         clientName, organizationAdminEmail: email,
         organizationAdminName: username,
         organizationAdminPhone: phone, organizationsName, registrationNumber
       } = request
       const users = await this.userRepository.getUserByEmailOrPhone(email, phone)
       if (gt(users.length, 0))
         throw unauthorized('User already register with same mobile no or email')

       const result = await this.clientRepository.getClientInformation(clientName)
       if (!isNil(result))
         throw unauthorized('Client already register with same name')

       const { id: clientId } = await this.clientRepository.saveClientInformation({ name: clientName })

       const { id: orgId } = await this.seederService.insertOrigination(
         { clientId, orgName: organizationsName, registrationNumber }
       )

       const { userId } = await this.userRepository.saveUser({
         email, phone, username, orgId, isActive: true, isVerified: false, lastLoginTime: new Date()
       })

       await this.seederService.insertUserRole(userId, 'admin')
     }
}
