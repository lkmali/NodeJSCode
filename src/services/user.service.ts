import { get, isNil } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { env } from '../config'
import { PasswordRepository, UserRepository } from '../database/repository'
import { ImageUploadRequest, LoginData, PaginateDataType, PasswordMailRequest, RegisterUserRequest, SignUpNewUser, UpdateUserInformation, UserCredentials, UserProfile, Users } from '../typings'
import { andOperator, badRequest, getPaginateData, getSearchQuery, neOperator, orOperator, paginate, unauthorized } from '../utils'
import { S3Service } from './aws'
import { NotificationService } from './notification.service'
import { PasswordService } from './password.service'
import { SeederService } from './seeder.service'
export class UserService {
   private static instance: UserService
   private readonly notificationService: NotificationService
   private readonly s3Service: S3Service
   private readonly userRepository: UserRepository
   private readonly passwordRepository: PasswordRepository
   private readonly seederService: SeederService
     private readonly passwordService: PasswordService
     constructor () {
       this.notificationService = new NotificationService()
       this.s3Service = new S3Service()
       this.userRepository = new UserRepository()
       this.passwordRepository = new PasswordRepository()
       this.seederService = new SeederService()
       this.passwordService = new PasswordService()
     }

     async sendOtp (phone: string): Promise<void> {
       const user = await this.userRepository.getUser(phone)
       if (isNil(user))
         throw unauthorized('your account is not created please ask to your admin to register')

       if (user.isBlocked || !user.isActive)
         throw unauthorized('your account is block please ask admin')

       await this.notificationService.sendOTP({ phone, username: user.username })
     }

     async signUpNewUser (signUpNewUser: SignUpNewUser): Promise<void> {
       const user = await this.userRepository.getUser(signUpNewUser.phone)
       if (!isNil(user))
         throw unauthorized('your account is already create with origination please try to login')

       await this.notificationService.sendOTP({ phone: signUpNewUser.phone, username: signUpNewUser.username })
       const { orgId } = await this.seederService.getDefaultInformationForUser()

       const result = await this.userRepository.saveUser({
         lastLoginTime: new Date(),
         ...signUpNewUser,
         orgId,
         isActive: true,
         isVerified: false
       })

       await this.seederService.insertUserRole(result.userId, 'surveyor')
     }

     async updateUserInformation ({ userId, username, email }: UpdateUserInformation): Promise<{username: string; email?: string}> {
       const userUpdate: Partial<Users> = {
         username
       }

       if (!isNil(email)) {
         const user = await this.userRepository.getUserByEmail(email)
         if (!isNil(user) && user.userId !== userId)
           throw unauthorized('same email already exist')

         userUpdate.email = email
       }

       const result = await this.userRepository.updateUserInformation({ userId }, userUpdate) ?? []
       if (!(result.length > 0 && result[0] > 0))
         throw unauthorized('something went wrong during set update information')

       return { username, email }
     }

     async prepareUserProfileData (typeValue: string, type: 'phone' | 'email' = 'phone') {
       const data = type === 'email'
         ? await this.userRepository.getUserInformationByEmail(typeValue)
         : await this.userRepository.getUserInformationByPhone(typeValue)

       if (isNil(data))
         throw unauthorized('please ask admin to check your account')

       return {
         userId: data.userId,
         clientId: data.Organization.clientId,
         username: data.username,
         phone: data.phone,
         isProfileSet: data.isProfileSet,
         profileImageKey: data.profileImageKey,
         isVerified: data.isVerified,
         email: data.email,
         scopes: 'auth',
         roles: data.Roles.map((value) => (value.name)),
         organization: { orgId: data.Organization.id, orgName: data.Organization.orgName }
       }
     }

     async verifyCredentials (credentials: UserCredentials): Promise<UserProfile> {
       let passwordMatched = false
       const invalidCredentialsError = 'authentication unsuccessful.'
       const email = credentials.email
       const user = await this.userRepository.getUserPassword(email)
       if (isNil(user)) throw unauthorized(invalidCredentialsError)
       passwordMatched = await this.passwordService.comparePassword(credentials.password, get(user, 'Password.password'))
       if (!passwordMatched) throw unauthorized(invalidCredentialsError)
       return this.prepareUserProfileData(user.phone)
     }

     async setUserPassword (userId: string, password: string): Promise<void> {
       const result = await this.passwordRepository.updateUserPassword(userId, password) ?? []

       if (!(result.length > 0 && result[0] > 0))
         throw unauthorized('something went wrong during set password')

       await this.userRepository.updateUserInformation({ userId }, {
         isVerified: true
       })
     }

     async sendResetPasswordLink (email: string): Promise<void> {
       const user = await this.userRepository.getUserByEmail(email)
       if (isNil(user))
         throw unauthorized('your account is not created please aks your admin to register')

       if (user.isBlocked || !user.isActive)
         throw unauthorized('your account is block please ask admin')

       await this.notificationService.sendPasswordMail({ email, username: user.username, type: 'RESET_PASSWORD' })
     }

     async registerNewUserByAdmin (data: RegisterUserRequest,
       { adminUserId, adminEmail }: {adminUserId: string; adminEmail: string}): Promise<Users> {
       const user = await this.userRepository.getUserInformation(orOperator(
         { email: data.email },
         { phone: data.phone }
       ))
       if (!isNil(user))
         throw unauthorized('User already register with same mobile no or email')

       const result = await this.userRepository.saveUser({
         ...data,
         isActive: true,
         createdBy: adminUserId,
         isVerified: false,
         lastLoginTime: new Date()
       })

       await this.seederService.insertUserRole(result.userId, data.role)
       // eslint-disable-next-line @typescript-eslint/no-floating-promises
       this.sendPasswordMail({
         email: data.email,
         username: data.username,
         adminEmail,
         type: 'SET_PASSWORD'
       })
       return result
     }

     async sendPasswordMail (data: PasswordMailRequest): Promise<void> {
       try {
         await this.notificationService.sendPasswordMail(data)
       } catch (_error) {

       }
     }

     async getUserProfile (userProfile: UserProfile): Promise<UserProfile> {
       const user = await this.userRepository.getUserInformation({ userId: userProfile.userId })
       if (isNil(user))
         throw unauthorized('user not found')

       userProfile.email = user.email ?? userProfile.email
       userProfile.username = user.username ?? userProfile.username
       userProfile.phone = user.phone ?? userProfile.phone
       userProfile.profileImageKey = user.profileImageKey ?? userProfile.profileImageKey
       userProfile.isProfileSet = user.isProfileSet ?? userProfile.isProfileSet

       return userProfile
     }

     async updateUserByAdmin (userId: string, data: RegisterUserRequest, adminUserId: string): Promise<void> {
       const user = await this.userRepository.getUserInformation(andOperator(orOperator(
         { email: data.email },
         { phone: data.phone }
       ), { userId: { [neOperator]: userId } }))
       if (!isNil(user))
         throw unauthorized('User already register with same mobile no or email')

       await this.userRepository.updateUserInformation({ userId }, {
         ...data,
         isActive: true,
         updatedBy: adminUserId
       })

       await this.seederService.insertUserRole(userId, data.role)
     }

     async getUserInformation (userId: string, orgId: number): Promise<Users> {
       const user = await this.userRepository.getUserInformation({ userId, orgId })
       if (isNil(user))
         throw badRequest('user is not in your organization')

       return user
     }

     async activateInActiveUser (orgId: number, userId: string, isActive: boolean, adminUserId: string): Promise<void> {
       const result = await this.userRepository.updateUserInformation({ userId, orgId }, { isActive, updatedAt: adminUserId }) ?? []
       if (!(result.length > 0 && result[0] > 0))
         throw unauthorized('something went wrong during set update information')
     }

     async blockUnBlockUser (orgId: number, userId: string, isBlocked: boolean): Promise<void> {
       const result = await this.userRepository.updateUserInformation({ userId, orgId }, { isBlocked }) ?? []
       if (!(result.length > 0 && result[0] > 0))
         throw unauthorized('something went wrong during set update information')
     }

     public async getAllUser (orgId: number, query: {[key: string]: string| boolean}): Promise<PaginateDataType<LoginData>> {
       if (this.isWithoutPagination(query))
         return this.getWithOutPagination(orgId, query)

       const filter = { ...paginate(query) }
       const result = await this.userRepository.getAllUsers({ orgId, ...this.getParseQuery(query) }, filter)
       return getPaginateData<LoginData>(filter, result)
     }

     public async getWithOutPagination (orgId: number, query: {[key: string]: string| boolean}): Promise<PaginateDataType<LoginData>> {
       const data = await this.userRepository.getUserEmails({ orgId, ...this.getParseQuery(query) }, {})
       return { count: data.length, data }
     }

     public async getUserInformationByAdmin (orgId: number, userId: string): Promise<LoginData> {
       return this.userRepository.getUserInformationByAdmin({ orgId, userId })
     }

     getParseQuery (query: {[key: string]: string| boolean}): WhereOptions<Users> {
       let result: WhereOptions<Users> = { }

       if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
         result['userId'] = query.userId

       if (Object.prototype.hasOwnProperty.call(query, 'email') && !isNil(query['email']))
         result['email'] = query.email

       if (Object.prototype.hasOwnProperty.call(query, 'phone') && !isNil(query['phone']))
         result['phone'] = query.phone

       if (Object.prototype.hasOwnProperty.call(query, 'isBlocked') && !isNil(query['isBlocked']))
         result['isBlocked'] = query.isBlocked === true || query.isBlocked.toString() === 'true'

       if (Object.prototype.hasOwnProperty.call(query, 'isActive') && !isNil(query['isActive']))
         result['isActive'] = query.isActive === true || query.isActive.toString() === 'true'

       if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
         const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
         const data = getSearchQuery(search, ['username', 'email', 'phone'])
         result = { ...andOperator([data]), ...result }
       }

       return result
     }

     async getUserAndGroups (userId: string, orgId: number): Promise<Users> {
       return this.userRepository.getUserAndGroups({ orgId, userId })
     }

     isWithoutPagination (query: {[key: string]: string| boolean}): boolean {
       return Object.prototype.hasOwnProperty.call(query, 'withoutPagination') && !isNil(query['withoutPagination']) &&
       (query.withoutPagination === true || query.withoutPagination.toString() === 'true')
     }

     async getUserProfileSignUrl (userId: string, data: ImageUploadRequest): Promise<string> {
       const key = data.profileImageKey ?? `${userId}${data.fileExtension}`
       const url = await this.s3Service.getImageUploadSignInUrl(`${env.saveProfileImageFolder}/${key}`, data.imageType)

       if (!data.isProfileSet)
       // eslint-disable-next-line @typescript-eslint/no-floating-promises
         this.userRepository.updateUserInformation({ userId }, { profileImageKey: key })

       return url
     }

     async getImageDownloadSignInUrlFromAdmin (key: string): Promise<string> {
       return this.s3Service.getImageDownloadSignInUrl(`${env.saveProfileImageFolder}/${key}`)
     }

     async getImageDownloadSignInUrlForUser (userId: string): Promise<string | null> {
       const user = await this.userRepository.getUserInformation({ userId })
       if (!isNil(user) && !isNil(user.isProfileSet) && user.isProfileSet && !isNil(user.profileImageKey))
         return this.s3Service.getImageDownloadSignInUrl(`${env.saveProfileImageFolder}/${user.profileImageKey}`)

       return null
     }

     async conformAddedImageUrl (userId: string): Promise<void> {
       await this.userRepository.updateUserInformation({ userId }, { isProfileSet: true })
     }

     public static get Instance () {
       if (isNil(this.instance))
         this.instance = new this()

       return this.instance
     }
}
