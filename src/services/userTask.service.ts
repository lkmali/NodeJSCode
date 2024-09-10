
import { isNil } from 'lodash'
import { TaskFormsRepository, UserTasksRepository } from '../database/repository'
import { PaginateDataType, Tasks } from '../typings'
import { getPaginateData, getProjectFormQueryForAdmin, getTaskQueryForAdmin, getUserTaskQueryForAdmin, paginate } from '../utils'

export class UserTaskService {
  private static instance: UserTaskService
  private readonly userTasksRepository: UserTasksRepository
  private readonly taskFormsRepository: TaskFormsRepository
  constructor() {
    this.userTasksRepository = new UserTasksRepository()
    this.taskFormsRepository = new TaskFormsRepository()
  }

  public async getUserTaskByUserId(userId: string, query: { [key: string]: string | boolean | number }): Promise<PaginateDataType<Tasks>> {
    const filter = { ...paginate(query) }
    const customsQuery = getTaskQueryForAdmin({
      search: query['searchBy'] === 'taskName' ? query['search'] : ''
    }, ['Task.name'])
    // customsQuery.userProjectForm = { ...dbQuery, ...customsQuery.userProjectForm }
    const result = await this.userTasksRepository.getUserTasksByQuery({
      taskQuery: customsQuery,
      userTaskQuery: { ...getUserTaskQueryForAdmin(query), userId },
      userProjectForm: { userId }
    }, filter)
    return getPaginateData<Tasks>(filter, result)
  }

  public async updateStatusByUser(userId: string, taskId: number, status: number): Promise<void> {
    await this.userTasksRepository.updateUserTask({
      userId: userId,
      taskId,
      status: 5
    }, { status, updatedBy: userId })
  }

  public async getTaskFormsByTaskId(taskId: number, query: { [key: string]: string | boolean | number },
    userId: string): Promise<PaginateDataType<Tasks>> {
    const filter = { ...paginate(query) }
    const customsQuery = getProjectFormQueryForAdmin({
      ...query
    })
    // customsQuery.userProjectForm = { ...dbQuery, ...customsQuery.userProjectForm }
    const result = await this.taskFormsRepository.getTaskFormsByQuery({ taskId }, customsQuery, { taskId, userId }, filter)
    return getPaginateData<Tasks>(filter, result)
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
