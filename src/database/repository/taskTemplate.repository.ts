
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { TaskTemplate } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'
export class TaskTemplateRepository {
  async saveTaskTemplate(data: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskTemplate.create(data)
  }

  async getTaskTemplate(where: WhereOptions<TaskTemplate>): Promise<TaskTemplate> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskTemplate.findOne({ where: { ...where, isDelete: false } })
  }

  async getAllTaskTemplateByQuery(query: WhereOptions<TaskTemplate>): Promise<TaskTemplate[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskTemplate.findAll({ where: { ...query, isDelete: false } })
  }

  async getAllTaskTemplate(where: WhereOptions<TaskTemplate>, option: IncludeOptions = {}): Promise<TaskTemplate[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = where
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.ProjectForms,
        required: true,
        attributes: ['id', 'name']
      },
      {
        model: dbInstance.Users,
        required: true,
        as: 'createdByUser',
        attributes: ['email', 'username', 'userId']
      }]
    return dbInstance.TaskTemplate.findAll(option)
  }

  async updateTaskTemplate(query: WhereOptions<TaskTemplate>, data: Partial<TaskTemplate>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskTemplate.update(data, { where: { ...query, isDelete: false } })
  }

  async deleteTask(id: number): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskTemplate.destroy({ where: { id } })
  }
}
