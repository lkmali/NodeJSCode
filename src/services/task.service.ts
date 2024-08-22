
import { isNil, keyBy } from 'lodash'
import { ProjectFormsRepository, TaskFormsRepository, TaskTemplateRepository, TasksRepository, UserTasksRepository } from '../database/repository'
import { CreateMultipleTaskRequest, CreateTaskFromTemplateRequest, CreateTaskRequest, PaginateDataType, TaskFilter, TaskForms, Tasks, UpdateTaskRequest, UserTasks } from '../typings'
import { badRequest, getPaginateData, getProjectQueryForAdmin, getRandomArbitrary, getStartAndEndDateBasesOnDays, getTaskQueryForAdmin, getUserQueryForAdmin, getUserTaskQueryForAdmin, inOperator, neOperator, paginate, unauthorized } from '../utils'
import { UserProjectFormService } from './userProjectForm.service'

export class TaskService {
  private static instance: TaskService
  private readonly projectFormsRepository: ProjectFormsRepository
  private readonly userTasksRepository: UserTasksRepository
  private readonly tasksRepository: TasksRepository
  private readonly taskFormsRepository: TaskFormsRepository
  private readonly taskTemplateRepository: TaskTemplateRepository
  constructor() {
    this.projectFormsRepository = new ProjectFormsRepository()
    this.taskTemplateRepository = new TaskTemplateRepository()
    this.userTasksRepository = new UserTasksRepository()
    this.tasksRepository = new TasksRepository()
    this.taskFormsRepository = new TaskFormsRepository()
  }

  public async createTask(task: CreateTaskRequest, adminId: string) {
    const result = await this.tasksRepository.getTask({
      name: task.name,
      orgId: task.orgId
    })
    if (!isNil(result))
      throw badRequest(`${result.name} already exists`)

    const data = await this.tasksRepository.saveTasks({
      name: task.name,
      description: task.description,
      projectId: task.projectId,
      workflowId: task.workflowId,
      taskTemplateId: task.taskTemplateId,
      taskCompleteDurationInDay: task.taskCompleteDurationInDay,
      taskAddress: task.taskAddress,
      taskPoint: { type: 'Point', coordinates: [task.latitude, task.longitude] },
      isActive: true,
      isDelete: false,
      orgId: task.orgId,
      status: 0,
      sequence: 1,
      startDate: new Date(),
      endDate: new Date(),
      createdBy: adminId,
      updatedBy: adminId,
      priority: task.priority ?? 1
    })
    if (!isNil(task.projectFormIds))

      await Promise.all(task?.projectFormIds.map(projectFormId => this.addProjectFormIdWithTask({
        projectFormId,
        taskId: data.id,
        createdBy: adminId,
        updatedBy: adminId
      }, task.orgId)))

    if (!isNil(task.userIds))
      await Promise.all(task?.userIds.map(userId => this.assignTaskToUser({
        userId,
        taskId: data.id,
        action: 'create',
        createdBy: adminId,
        updatedBy: adminId,
        status: 0
      })))

    return data
  }

  public async updateTaskByAdmin(taskId: number, task: UpdateTaskRequest, adminId: string) {
    const data = await this.tasksRepository.getTask({
      id: taskId,
      orgId: task.orgId,
      status: 0
    })
    if (isNil(data))
      throw badRequest('invalid task id')

    await this.tasksRepository.updateTasks({
      orgId: task.orgId,
      id: taskId
    }, {
      description: task.description ?? data.description,
      priority: task.priority ?? data.priority,
      taskAddress: task.taskAddress,
      taskPoint: { type: 'Point', coordinates: [task.latitude, task.longitude] },
      updatedBy: adminId
    })
  }

  public async copyTaskFromTaskTemplate(request: CreateTaskFromTemplateRequest) {
    const {
      workflowName, workflowId, projectId, taskTemplateId,
      userIds, orgId, taskCompleteDurationInDay, latitude, longitude, taskAddress
    } = request
    const result = await this.taskTemplateRepository.getTaskTemplate({
      id: taskTemplateId,
      orgId,
      isPublish: true
    })
    if (isNil(result))
      throw badRequest('task Template should be publish')

    const ids = [result.projectFormId]
    const data = await this.createTask({
      name: `${result.name}-${workflowName}:${getRandomArbitrary(0, 20)}`,
      description: result.description,
      projectId,
      workflowId,
      taskCompleteDurationInDay,
      taskAddress,
      latitude,
      status: 0,
      taskTemplateId,
      longitude,
      priority: 1,
      orgId: result.orgId,
      userIds: userIds,
      projectFormIds: ids
    }, result.createdBy)

    return data
  }

  public async deleteTask(taskId: number) {
    await this.tasksRepository.deleteTask(taskId)
  }

  public async deleteTaskByAdmin(taskId: number, orgId: number) {
    const result = await this.tasksRepository.getTask({
      id: taskId,
      orgId: orgId,
      status: 0
    })
    if (isNil(result))
      throw badRequest('invalid task id')

    const userTasks = await this.userTasksRepository.getAllUserTasks({ taskId })
    const ids = userTasks.map((value: UserTasks) => value.id)
    if (ids.length > 0)
      await this.userTasksRepository.removeUserTasks({ id: ids })

    await this.tasksRepository.deleteTask(taskId)
  }

  public async startTask(taskId: number, orgId: number, adminId: string) {
    try {
      const taskResult = await this.tasksRepository.getTask({
        id: taskId,
        orgId: orgId
      })
      if (isNil(taskResult))
        throw badRequest(`task no found with ${taskId}`)

      const { startDate, endDate } = getStartAndEndDateBasesOnDays(taskResult.taskCompleteDurationInDay)
      await Promise.all([this.tasksRepository.updateTasks({
        orgId: orgId,
        id: taskId,
        status: 0
      }, {
        status: 1,
        startDate,
        endDate,
        updatedBy: adminId
      }),
      this.userTasksRepository.updateUserTask({
        taskId,
        status: 0
      }, {
        status: 1,
        updatedBy: adminId
      })])

      // // eslint-disable-next-line @typescript-eslint/no-floating-promises
      // TaskNotificationService.Instance.sendNotificationToTaskUsers(taskId)
    } catch (error) {
      await Promise.all([this.tasksRepository.updateTasks({
        orgId: orgId,
        id: taskId,
        status: 1
      }, {
        status: 0
      }),
      this.userTasksRepository.updateUserTask({
        taskId,
        status: 1
      }, {
        status: 0,
        updatedBy: adminId
      })])

      throw error
    }
  }

  public async completedUserTask(taskId: number) {
    const data = await this.userTasksRepository.getAllUserTasks({ taskId, status: { [neOperator]: 3 } })
    if (data.length > 0)
      return

    await this.tasksRepository.updateTasks({
      id: taskId
    }, {
      status: 7
    })
  }

  public async assignTaskToUsers({
    taskId, userIds,
    adminId, orgId
  }: { taskId: number; userIds: string[]; adminId: string; orgId: number }): Promise<void> {
    const task = await this.tasksRepository.getTask({
      id: taskId,
      orgId,
      status: 0
    })

    if (isNil(task))
      throw badRequest('invalid taskId')
    await Promise.all(userIds.map(userId => this.assignTaskToUser({
      userId,
      taskId,
      action: 'create',
      createdBy: adminId,
      updatedBy: adminId,
      status: 0
    })))
  }

  public async getTaskUserByAdmin(taskId: number): Promise<UserTasks[]> {
    return this.userTasksRepository.getTaskUserByTaskId({
      taskId
    })
  }

  public async getFormsByTasksByAdmin(taskId: number): Promise<TaskForms[]> {
    return this.taskFormsRepository.getTaskFormsByTaskId({
      taskId
    }, {}, { taskId })
  }

  public async addProjectFormInTask({
    taskId, projectFormIds,
    adminId, orgId
  }: { taskId: number; projectFormIds: number[]; adminId: string; orgId: number }): Promise<void> {
    const task = await this.tasksRepository.getTask({
      id: taskId,
      orgId
    })

    if (isNil(task))
      throw badRequest('invalid taskId')

    await Promise.all(projectFormIds.map(projectFormId => this.addProjectFormIdWithTask({
      projectFormId,
      taskId,
      createdBy: adminId,
      updatedBy: adminId
    }, orgId)))
  }

  public async deleteUsersFromTask(taskId: number, orgId: number, ids: number[]): Promise<void> {
    const task = await this.tasksRepository.getTask({
      id: taskId,
      status: 0,
      orgId
    })
    if (isNil(task))
      throw badRequest('invalid taskId')
    await this.userTasksRepository.removeUserTasks({ id: { [inOperator]: ids } })
  }

  public async deleteFormFormTask(taskId: number, orgId: number, ids: number[]): Promise<void> {
    const task = await this.tasksRepository.getTask({
      id: taskId,
      orgId
    })
    if (isNil(task))
      throw badRequest('invalid taskId')
    await this.taskFormsRepository.removeTaskForms({ id: { [inOperator]: ids } })
  }

  public async activateInActiveTask(orgId: number, taskId: number, isActive: boolean, adminUserId: string): Promise<void> {
    const result = await this.tasksRepository.updateTasks({ id: taskId, orgId }, { isActive, updatedBy: adminUserId }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw unauthorized('something went wrong during set update information')
  }

  public async getAllTaskByAdmin(query: { [key: string]: string | boolean | number }): Promise<PaginateDataType<Tasks>> {
    const filter = { ...paginate(query) }
    const customsQuery = this.getAdminTaskAdminFilter({ ...query, isDelete: false })
    const result = await this.tasksRepository.getAllTaskByAdmin(customsQuery, filter)
    return getPaginateData<Tasks>(filter, result)
  }

  public async getAllUserTaskByAdmin(query: { [key: string]: string | boolean | number }): Promise<PaginateDataType<Tasks>> {
    const filter = { ...paginate(query) }
    const customsQuery = this.getAdminUserTaskAdminFilter({ ...query, isDelete: false })
    // customsQuery.userProjectForm = { ...dbQuery, ...customsQuery.userProjectForm }
    const result = await this.userTasksRepository.getAllUserTaskByAdmin(customsQuery, filter)
    return getPaginateData<Tasks>(filter, result)
  }

  async deleteTasks(orgId: number, taskId: number, adminUserId: string): Promise<void> {
    const result = await this.tasksRepository.updateTasks({
      orgId,
      id: taskId
    }, { isDelete: true, updatedBy: adminUserId }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw unauthorized('something went wrong during set update information')
  }

  public async approveUserTaskByAdmin(userId: string, taskId: number, adminId: string, token: string): Promise<void> {
    const result = await this.userTasksRepository.updateUserTask({
      userId,
      taskId,
      status: 2
    }, { status: 7, updatedBy: adminId })
    if (!(result.length > 0 && result[0] > 0))
      throw unauthorized('something went wrong during update status')

    await UserProjectFormService.Instance.completedUserTask(taskId, token)
  }

  public async createMultipleTaskUsingTaskTemplate(request: CreateMultipleTaskRequest): Promise<Tasks[]> {
    const data = await this.taskTemplateRepository.getAllTaskTemplateByQuery({
      id: { [inOperator]: request.taskTemplateIds },
      orgId: request.orgId,
      isPublish: true
    })
    if (data.length !== request.taskTemplateIds.length)
      throw unauthorized('some template id is wrong')

    const keyValue = keyBy(data, 'id')

    const tasks = data.map(value => ({
      name: `${value.name}-${request.workflowName}:${getRandomArbitrary(0, 20)}`,
      description: value.description,
      projectId: request.projectId,
      workflowId: request.workflowId,
      taskCompleteDurationInDay: 1,
      isActive: true,
      isDelete: false,
      orgId: request.orgId,
      status: 0,
      sequence: 1,
      taskTemplateId: value.id,
      startDate: new Date(),
      endDate: new Date(),
      createdBy: request.adminId,
      updatedBy: request.adminId,
      priority: 1
    }))
    const result = await this.tasksRepository.insertManyTask(tasks)
    try {
      const forms = result.map((value) => ({
        projectFormId: keyValue[value.taskTemplateId].projectFormId,
        taskId: value.id,
        createdBy: request.adminId,
        updatedBy: request.adminId
      }))
      await this.taskFormsRepository.saveMultipleTaskForms(forms)
      return result
    } catch (error) {
      const ids = result.map(value => value.id)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Promise.all<any>([this.tasksRepository.deleteManyTask(ids),
        this.taskFormsRepository.removeTaskForms({ taskId: { [inOperator]: ids } })
      ])

      throw error
    }
  }

  public async removeTaskByWorkflowId(workflowId: string, orgId: number): Promise<void> {
    const data = await this.tasksRepository.getAllTask({
      workflowId,
      orgId,
      status: 0
    })
    if (data.length <= 0)
      return

    const taskIds = data.map(value => value.id)

    const formData = await this.taskFormsRepository.getAllTaskForms({ taskId: { [inOperator]: taskIds } })
    const ids = formData.map(value => value.id)

    await Promise.all<any>([this.tasksRepository.deleteManyTask(taskIds),
      this.taskFormsRepository.removeTaskForms({ id: { [inOperator]: ids } })
    ])
  }

  private async addProjectFormIdWithTask(data: Omit<TaskForms, 'id'>, orgId: number): Promise<void> {
    const result = await this.projectFormsRepository.getSingleProjectForm({
      id: data.projectFormId,
      orgId,
      isPublish: true
    })
    if (isNil(result))
      throw badRequest('invalid projectFormId')

    const taskFormGroup = await this.taskFormsRepository.getTaskForms({ projectFormId: data.projectFormId, taskId: data.taskId })
    if (isNil(taskFormGroup))
      await this.taskFormsRepository.saveTaskForms(data)
  }

  private async assignTaskToUser(data: Omit<UserTasks, 'id'>): Promise<void> {
    const userTask = await this.userTasksRepository.getUserTasks({ userId: data.userId, taskId: data.taskId })
    if (isNil(userTask))
      await this.userTasksRepository.saveUserTasks({ ...data, status: 0 })
  }

  private getAdminTaskAdminFilter(query: { [key: string]: string | boolean | number }): TaskFilter {
    return {
      task: getTaskQueryForAdmin({
        ...query,
        search: query['searchBy'] === 'taskName' ? query['search'] : ''
      }),
      projects: getProjectQueryForAdmin({ search: query['searchBy'] === 'projectName' ? query['search'] : '' }, ['Task.Project.name']),
      users: getUserQueryForAdmin({ search: query['searchBy'] === 'assignUser' ? query['search'] : '' }),
      userTaskQuery: {}
    }
  }

  private getAdminUserTaskAdminFilter(query: { [key: string]: string | boolean | number }): TaskFilter {
    return {
      task: getTaskQueryForAdmin({
        status: query['taskStatus'],
        search: query['searchBy'] === 'taskName' ? query['search'] : ''
      }),
      projects: getProjectQueryForAdmin({ search: query['searchBy'] === 'projectName' ? query['search'] : '' }, ['Task.Project.name']),
      users: getUserQueryForAdmin({ search: query['searchBy'] === 'assignUser' ? query['search'] : '' }),
      userTaskQuery: getUserTaskQueryForAdmin(query)
    }
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
