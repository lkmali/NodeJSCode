
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { FormsFilter, ProjectForms } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class ProjectFormsRepository {
  async saveProjectForms(data: Omit<ProjectForms, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectForms.create(data)
  }

  async getProjectFormById(id: number, orgId: number): Promise<ProjectForms> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectForms.findOne({ where: { id, orgId } })
  }

  async getSingleProjectForm(query: WhereOptions<ProjectForms>): Promise<ProjectForms> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectForms.findOne({ where: query })
  }

  async updateProjectForm(query: WhereOptions<ProjectForms>, data: Partial<ProjectForms>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectForms.update(data, { where: query })
  }

  async getProjectFormsNames(query: WhereOptions<ProjectForms>): Promise<ProjectForms[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectForms.findAll({ where: query, attributes: ['name', 'id', 'isDelete'] })
  }

  async getAllProjectForm(filter: FormsFilter, option: IncludeOptions = {}): Promise<ProjectForms[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter.projectForms
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Users,
        required: true,
        where: filter.users,
        as: 'createdByUser',
        attributes: ['email', 'username', 'userId']
      }]

    return dbInstance.ProjectForms.findAll(option)
  }

  async getProjectFormIds(query: WhereOptions<ProjectForms>): Promise<number[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.ProjectForms.findAll({
      attributes: ['id'],
      where: query
    })
    return result.map((value: ProjectForms) => value.id)
  }
}
