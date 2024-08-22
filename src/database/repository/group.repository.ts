
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { Groups } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class GroupRepository {
  async saveGroup (data: Omit<Groups, 'id'>): Promise<Groups> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.create(data)
  }

  async getGroup (query: WhereOptions<Groups>): Promise<Groups | null> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.findOne({ where: query })
  }

  async getGroupNames (query: WhereOptions<Groups>): Promise<Groups[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.findAll({ where: query, attributes: ['name', 'id', 'isDelete'] })
  }

  async getOrgGroupAndUsers (data: Partial<Groups>): Promise<Groups | null> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.findAll({ where: data })
  }

  async getAllGroups (query: WhereOptions<Groups>, option: IncludeOptions = {}): Promise<Groups[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
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
    return dbInstance.Groups.findAll(option)
  }

  async updateGroup (query: WhereOptions<Groups>, data: Partial<Groups>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.update(data, { where: query })
  }

  async getOrganizationGroupAndUser (data: Partial<Groups>): Promise<Groups[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.findOne({
      where: data,
      include: [
        {
          model: dbInstance.Users,
          required: false,
          attributes: ['userId', 'username', 'email', 'phone', 'isActive']
        }]
    })
  }

  async getOrganizationGroupAndProject (data: Partial<Groups>): Promise<Groups[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.findOne({
      where: data,
      attributes: ['id', 'name'],
      include: [
        {
          model: dbInstance.Projects,
          required: false,
          attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributes },
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
        }]
    })
  }

  async getOrganizationGroupAndProjectFrom (data: Partial<Groups>): Promise<Groups[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Groups.findOne({
      where: data,
      attributes: ['id', 'name'],
      include: [
        {
          model: dbInstance.ProjectForms,
          required: false,
          attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributes },
          include: [
            {
              model: dbInstance.Projects,
              required: true,
              attributes: ['name']
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
        }]
    })
  }
}
