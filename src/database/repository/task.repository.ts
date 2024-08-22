
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { TaskFilter, Tasks } from '../../typings'
import { inOperator, jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class TasksRepository {
  async saveTasks(data: Omit<Tasks, 'id'>): Promise<Tasks> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.create(data)
  }

  async insertManyTask(data: Omit<Tasks, 'id' | 'taskPoint' | 'taskAddress'>[]): Promise<Tasks[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.bulkCreate(data)
  }

  async getTask(where: WhereOptions<Tasks>): Promise<Tasks> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.findOne({ where: { ...where, isDelete: false } })
  }

  async getAllTask(where: WhereOptions<Tasks>): Promise<Tasks[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.findAll({ where: { ...where } })
  }

  async updateTasks(query: WhereOptions<Tasks>, data: Partial<Tasks>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.update(data, { where: { ...query, isDelete: false } })
  }

  async deleteTask(id: number): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.destroy({ where: { id } })
  }

  async deleteManyTask(ids: number[]): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.Tasks.destroy({ where: { id: { [inOperator]: ids } } })
  }

  async getAllTaskByAdmin(filter: TaskFilter, option: IncludeOptions = {}): Promise<Tasks[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter.task
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Users,
        required: true,
        as: 'createdByUser',
        where: filter.users,
        attributes: ['email', 'username', 'userId']
      },
      {
        model: dbInstance.Projects,
        required: true,
        where: filter.projects,
        attributes: ['name']
      }]
    return dbInstance.Tasks.findAll(option)
  }

  async getTaskUsers(taskId: number, option: IncludeOptions = {}): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = { id: taskId }
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Users,
        required: true,
        attributes: ['email', 'username', 'userId', 'phone']
      }]
    return jsonParse(jsonStringify(await dbInstance.Tasks.findOne(option)))
  }
}
