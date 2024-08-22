
import { isNil } from 'lodash'
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { TaskFilter, Tasks, UserTaskFormFilter, UserTasks } from '../../typings'
import { isOverDue, jsonParse, jsonStringify, neOperator } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserTasksRepository {
  async getUserCreateTaskForForm(userId: string, taskId: number, projectFormId: number): Promise<Tasks | null> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const data = await dbInstance.UserTasks.findOne({
      where: { taskId, status: 1, userId },
      attributes: { exclude: env.sequelizeConfig.excludedDefaultAttributes },
      include: [
        {
          model: dbInstance.Tasks,
          required: true,
          where: { id: taskId, status: 1 },
          include: [
            {
              model: dbInstance.ProjectForms,
              required: true,
              where: { id: projectFormId },
              attributes: ['id', 'name']
            }
          ]
        }]
    })
    if (isNil(data))
      return null

    const result = jsonParse(jsonStringify(data))
    return { ...result['Task'] }
  }

  async getUserTasks(userTaskQuery: WhereOptions<UserTasks>, option: IncludeOptions = {}) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = userTaskQuery
    return dbInstance.UserTasks.findOne(option)
  }

  async getAllUserTasks(userTaskQuery: WhereOptions<UserTasks>, option: IncludeOptions = {}) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = userTaskQuery
    return dbInstance.UserTasks.findAll(option)
  }

  async saveUserTasks(data: Omit<UserTasks, 'id'>): Promise<UserTasks> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserTasks.create(data)
  }

  async removeUserTasks(query: WhereOptions<UserTasks>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    await dbInstance.UserTasks.destroy({
      where: query
    })
  }

  async updateUserTask(query: WhereOptions<UserTasks>, data: Partial<UserTasks>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserTasks.update(data, { where: query })
  }

  async getTaskUserByTaskId(userTaskQuery: WhereOptions<UserTasks>, option: IncludeOptions = {}) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = userTaskQuery
    option['include'] = [
      {
        model: dbInstance.Users,
        required: true,
        as: 'user'
      }]
    const result = jsonParse(jsonStringify(await dbInstance.UserTasks.findAll(option)))
    return result.map((value: any) => ({ ...value['user'], userTaskId: value.id }))
  }

  async getUserTasksByQuery(filter: UserTaskFormFilter, option: IncludeOptions = {}) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter.userTaskQuery
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Tasks,
        where: { ...filter.taskQuery, isDelete: false, status: { [neOperator]: 0 } },
        required: true,
        include: [
          {
            model: dbInstance.ProjectForms,
            required: true,
            attributes: ['name', 'id']
          },
          {
            model: dbInstance.UserProjectForm,
            where: filter.userProjectForm,
            required: false
          },
          {
            model: dbInstance.Projects,
            required: false,
            attributes: ['name']
          }]
      }]
    const result = jsonParse(jsonStringify(await dbInstance.UserTasks.findAll(option)))
    return result.map((value: any) => ({ ...value['Task'], userTaskId: value.id, status: value.status }))
  }

  async getAllUserTaskByAdmin(filter: TaskFilter, option: IncludeOptions = {}): Promise<Tasks[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()

    option['where'] = filter.userTaskQuery
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Tasks,
        where: { ...filter.task, isDelete: false },
        required: true,
        include: [
          {
            model: dbInstance.Users,
            required: true,
            as: 'createdByUser',
            attributes: ['email', 'username', 'userId']
          },
          {
            model: dbInstance.Projects,
            required: true,
            where: filter.projects,
            attributes: ['name']
          }]
      },
      {
        model: dbInstance.Users,
        where: filter.users,
        as: 'user',
        attributes: ['email', 'username', 'userId']
      }]

    const result = jsonParse(jsonStringify(await dbInstance.UserTasks.findAll(option)))
    return result.map((value: any) => ({
      ...value['Task'],
      user: value.user,
      userTaskId: value.id,
      status: value.status,
      taskStatus: value['Task'].status,
      isOverDue: isOverDue(value['Task'].endDate, value.status)
    }))
  }
}
