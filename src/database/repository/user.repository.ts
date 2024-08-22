
import Sequelize, { IncludeOptions, WhereOptions } from 'sequelize'
import { env } from '../../config'
import { Groups, LoginData, Projects, UserProjectData, Users } from '../../typings'
import { getProjectData, jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'
import { PasswordRepository } from './password.repository'

export class UserRepository {
  private readonly passwordRepository: PasswordRepository
  constructor() {
    this.passwordRepository = new PasswordRepository()
  }

  async saveUser(data: Omit<Users, 'userId' | 'isBlocked'>): Promise<Users> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.Users.create(data)
    await this.passwordRepository.saveUserDefaultPassword(result.userId)
    return result
  }

  // async upsertToken (phone: string, data: Users) {
  //   const dbInstance = await DatabaseInitializer.getInstance().getConnection()
  //   return dbInstance.Users.upsert({ where: { phone } }, data)
  // }

  async getUser(phone: string): Promise<Users> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.findOne({ where: { phone } })
  }

  async getUserByEmail(email: string): Promise<Users> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()

    return dbInstance.Users.findOne({ where: { email }, raw: true })
  }

  async getUserInformation(query: WhereOptions<Users>): Promise<Users> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return jsonParse(jsonStringify(await dbInstance.Users.findOne({ where: query })))
  }

  async getUserInformationByAdmin(query: WhereOptions<Users>): Promise<LoginData> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return jsonParse(jsonStringify(await dbInstance.Users.findOne({
      where: query,
      include: [
        {
          model: dbInstance.Roles,
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: dbInstance.Addresses,
          required: false
        }]
    })))
  }

  async getUserByEmailOrPhone(email: string, phone: string): Promise<Users[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.findAll({
      where: Sequelize.or(
        { email },
        { phone }
      )
    })
  }

  async getUserInformationByPhone(phone: string): Promise<LoginData> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.findOne({
      where: { phone },
      attributes: ['userId', 'username', 'phone', 'email', 'isProfileSet', 'isVerified', 'profileImageKey'],
      include: [
        {
          model: dbInstance.Roles,
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: dbInstance.Organizations,
          raw: true,
          required: true,
          where: { isActive: true, isDelete: false },
          attributes: ['id', 'orgName', 'clientId']
        }]
    })
  }

  async getAllUsers(query: WhereOptions<Users>, option: IncludeOptions = {}): Promise<LoginData[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['attributes'] = ['userId', 'isActive', 'username', 'lastLoginTime',
      'isProfileSet', 'phone', 'isBlocked', 'email', 'isVerified', 'profileImageKey']
    option['include'] = [
      {
        model: dbInstance.Roles,
        required: false,
        attributes: ['id', 'name']
      }]
    return dbInstance.Users.findAll(option)
  }

  async getUserEmails(query: WhereOptions<Users>, option: IncludeOptions = {}): Promise<LoginData[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['attributes'] = ['userId', 'isActive', 'username', 'phone', 'isBlocked', 'email', 'isVerified']
    return dbInstance.Users.findAll(option)
  }

  async getUserInformationByEmail(email: string): Promise<LoginData> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.findOne({
      where: { email },
      attributes: ['userId', 'username', 'phone', 'email', 'isVerified', 'profileImageKey'],
      include: [
        {
          model: dbInstance.Roles,
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: dbInstance.Organizations,
          raw: true,
          required: true,
          where: { isActive: true, isDelete: false },
          attributes: ['id', 'orgName', 'clientId']
        }]
    })
  }

  async updateUserInformation(query: WhereOptions<Users>, user: Partial<Users>): Promise<number[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.update(user, { where: query })
  }

  async getUserPassword(email: string): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.findOne({
      where: { email },
      raw: true,
      attributes: ['userId', 'username', 'phone', 'email', 'isVerified'],
      include: [
        {
          model: dbInstance.Password,
          required: true,
          raw: true,
          attributes: ['id', 'password']
        }]
    })
  }

  async getUserAndGroups(query: WhereOptions<Users>, option: IncludeOptions = {}): Promise<Users> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Users.findOne({
      where: query,
      attributes: ['userId', 'username', 'email'],
      include: [
        {
          model: dbInstance.Groups,
          required: true,
          ...option,
          attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributes },
          include: [
            {
              model: dbInstance.Users,
              required: false,
              as: 'updatedByUser',
              attributes: ['email', 'username', 'userId']
            },
            {
              model: dbInstance.Users,
              required: false,
              as: 'createdByUser',
              attributes: ['email', 'username', 'userId']
            }]
        }]
    })
  }

  async getUserProjectsByAdmin(query: WhereOptions<Users>, option: IncludeOptions = {}): Promise<UserProjectData> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.Users.findOne({
      where: query,
      attributes: ['userId', 'username', 'email'],
      include: [
        {
          model: dbInstance.Projects,
          required: true,
          ...option,
          attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributesForUser },
          include: [
            {
              model: dbInstance.Users,
              required: false,
              as: 'projectOwner',
              attributes: ['email', 'username', 'userId']
            },
            {
              model: dbInstance.Users,
              required: false,
              as: 'updatedByUser',
              attributes: ['email', 'username', 'userId']
            },
            {
              model: dbInstance.Users,
              required: false,
              as: 'createdByUser',
              attributes: ['email', 'username', 'userId']
            }]
        }
      ]
    })
    const data = jsonParse(jsonStringify(result))

    return getProjectData(data)
  }

  async getUserProjectsByUser(query: WhereOptions<Users>,
    groupQuery: WhereOptions<Groups>, projectQuery: WhereOptions<Projects>): Promise<Projects[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.Users.findOne({
      where: query,
      attributes: ['userId', 'username', 'email'],
      include: [
        {
          model: dbInstance.Groups,
          required: true,
          where: groupQuery,
          attributes: ['id', 'name'],
          include: [
            {
              model: dbInstance.Projects,
              required: false,
              where: projectQuery,
              attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributesForUser }
            }
          ]
        },
        {
          model: dbInstance.Projects,
          required: false,
          where: projectQuery,
          attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributesForUser }
        }
      ]
    })
    const data = getProjectData(jsonParse(jsonStringify(result)))

    return data.projects
  }
}
