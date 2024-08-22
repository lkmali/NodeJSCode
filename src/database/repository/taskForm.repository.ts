
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { ProjectForms, TaskForms, UserProjectForm } from '../../typings'
import { jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class TaskFormsRepository {
  async saveTaskForms(data: Omit<TaskForms, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskForms.create(data)
  }

  async getTaskForms(query: WhereOptions<TaskForms>): Promise<TaskForms> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskForms.findOne({ where: query })
  }

  async getAllTaskForms(query: WhereOptions<TaskForms>): Promise<TaskForms[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskForms.findAll({ where: query })
  }

  async removeTaskForms(query: WhereOptions<TaskForms>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.TaskForms.destroy({
      where: query
    })
    return result
  }

  async saveMultipleTaskForms(data: Omit<TaskForms, 'id'>[]): Promise<TaskForms[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.TaskForms.bulkCreate(data)
  }

  async getTaskFormsByTaskId(taskFormQuery: WhereOptions<TaskForms>, form: WhereOptions<ProjectForms>,
    userProjectForm: WhereOptions<UserProjectForm>, option: IncludeOptions = {}) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = taskFormQuery
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.ProjectForms,
        required: true,
        where: form,
        attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributesForUser },
        include: [
          {
            model: dbInstance.UserProjectForm,
            required: false,
            where: userProjectForm,
            include: [{
              model: dbInstance.Users,
              required: true,
              as: 'user',
              attributes: ['email', 'username', 'userId']
            }]
          }]
      }
    ]

    const result = jsonParse(jsonStringify(await dbInstance.TaskForms.findAll(option)))
    return result.map((value: any) => ({ ...value['ProjectForm'], taskFormId: value.id }))
  }

  async getTaskFormsByQuery(taskFormQuery: WhereOptions<TaskForms>, form: WhereOptions<ProjectForms>,
    userProjectForm: WhereOptions<UserProjectForm>, option: IncludeOptions = {}) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = taskFormQuery
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.ProjectForms,
        required: true,
        where: form,
        attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributesForUser },
        include: [
          {
            model: dbInstance.UserProjectForm,
            required: false,
            where: userProjectForm
          }]
      }
    ]

    const result = jsonParse(jsonStringify(await dbInstance.TaskForms.findAll(option)))
    return result.map((value: any) => ({ ...value['ProjectForm'], taskFormId: value.id }))
  }
}
