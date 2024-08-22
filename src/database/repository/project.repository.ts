
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { Projects } from '../../typings'
import { inOperator, jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class ProjectsRepository {
  async saveProjects (data: Omit<Projects, 'id'>): Promise<Projects> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Projects.create(data)
  }

  async getProjectById (id: number, orgId: number): Promise<Projects> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Projects.findOne({ where: { id, orgId } })
  }

  async getProjectNames (query: WhereOptions<Projects>): Promise<Projects[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Projects.findAll({ where: query, attributes: ['name', 'id', 'isDelete'] })
  }

  async getProject (query: WhereOptions<Projects>): Promise<Projects> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Projects.findOne({ where: query })
  }

  async updateProject (query: WhereOptions<Projects>, data: Partial<Projects>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Projects.update(data, { where: query })
  }

  async getAllProject (query: WhereOptions<Projects>, option: IncludeOptions = {}): Promise<Projects[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
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
    return dbInstance.Projects.findAll(option)
  }

  async getOrganizationProjectAndGroup (data: WhereOptions<Projects>): Promise<Projects[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Projects.findAll({
      where: data,
      attributes: ['name', 'description'],
      include: [
        {
          model: dbInstance.Groups,
          required: true,
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

  async getGroupProjectByAdmin (projectQuery: WhereOptions<Projects>, groupIds: number[]): Promise<Projects[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.Projects.findAll({
      where: projectQuery,
      attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributes },
      include: [
        {
          model: dbInstance.Groups,
          required: true,
          where: { id: { [inOperator]: groupIds } },
          attributes: ['id', 'name']
        },
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
    })

    return jsonParse(jsonStringify(result))
  }

  async getGroupProjectByUser (projectQuery: WhereOptions<Projects>, groupIds: number[]): Promise<Projects[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.Projects.findAll({
      where: projectQuery,
      attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributesForUser },
      include: [
        {
          model: dbInstance.Groups,
          required: true,
          where: { id: { [inOperator]: groupIds } },
          attributes: ['id', 'name']
        }]
    })

    return jsonParse(jsonStringify(result))
  }
}
