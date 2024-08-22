import { Response } from 'express'
import { isNil, omit } from 'lodash'
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { TaskFormsRepository, TasksRepository, UserFormFieldDataRepository, UserProjectFormRepository, UserTasksRepository } from '../database/repository'
import { DownloadXlsxRequest, Filter, NearByProject, PaginateDataType, UserProjectForm, UserTaskForms } from '../typings'
import { badRequest, getPaginateData, getProjectFormQueryForAdmin, getProjectQueryForAdmin, getUserProjectFormQueryForAdmin, getUserQueryForAdmin, inOperator, neOperator, notInOperator, paginate, unauthorized } from '../utils'
import { UserProjectFormHelperService } from './user-project-form/userProjectFormHelper.service'
import { WorkflowService } from './workflow.service'
import { XlsxService } from './xlsx-services/xlsx.services'
export class UserProjectFormService {
  private static instance: UserProjectFormService
  private readonly userProjectFormRepository: UserProjectFormRepository
  private readonly userFormFieldDataRepository: UserFormFieldDataRepository
  private readonly userTasksRepository: UserTasksRepository
  private readonly taskFormsRepository: TaskFormsRepository
  private readonly tasksRepository: TasksRepository
  constructor() {
    this.userTasksRepository = new UserTasksRepository()
    this.userProjectFormRepository = new UserProjectFormRepository()
    this.userFormFieldDataRepository = new UserFormFieldDataRepository()
    this.taskFormsRepository = new TaskFormsRepository()
    this.tasksRepository = new TasksRepository()
  }

  async getNearByCoordinate(request: NearByProject) {
    return this.userFormFieldDataRepository.getNearByCoordinateByQuery(request)
  }

  async getUserProjectFormHistory(query: { [key: string]: string | boolean | number }, userId: string) {
    return this.userProjectFormRepository.getUserAllProjectForm(getUserProjectFormQueryForAdmin({
      ...omit(query, ['orgId', 'userId']),
      userId
    }))
  }

  public async getUserAllProjectForm(query: { [key: string]: string | boolean },
    userId: string): Promise<UserProjectForm[]> {
    const filter = { ...paginate(query) }
    return this.userProjectFormRepository.getUserAllProjectForm(getUserProjectFormQueryForAdmin({
      ...omit(query, ['orgId', 'userId']),
      userId
    }), filter)
  }

  async saveProjectForms({ orgId, userId, projectFormId, taskId }:
    { orgId: number; userId: string; projectFormId: number; title: string; taskId: number }) {
    const userProjectForm = await this.userProjectFormRepository.getUserProjectForm({ userId, projectFormId, taskId })
    if (!isNil(userProjectForm))
      throw badRequest('You have already field your form')

    const taskData = await this.userTasksRepository.getUserCreateTaskForForm(userId, taskId, projectFormId)
    if (isNil(taskData))
      throw badRequest('invalid projectFormId')

    return this.userProjectFormRepository.saveUserProjectForm({
      userId: userId,
      projectId: taskData.projectId,
      status: 1,
      taskId,
      orgId,
      isActive: true,
      projectFormId,
      title: taskData.name,
      createdBy: userId
    })
  }

  async submitUserProjectFormData(userId: string, userFromId: number) {
    const result = await this.userProjectFormRepository.updateUserProjectForm({
      userId: userId,
      id: userFromId,
      status: 1
    }, { status: 2, updatedBy: userId })
    if (!(result.length > 0 && result[0] > 0))
      throw unauthorized('something went wrong during  update status')

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.submitUserTask(userId, userFromId)
  }

  async updateUserProjectFormStatusByAdmin(adminUserId: string, userFromId: number,
    body: { status: number; commentByAdmin: string }, token: string) {
    const result = await this.userProjectFormRepository.updateUserProjectForm({
      id: userFromId,
      status: { [notInOperator]: [1, 3] }
    }, { ...body, updatedBy: adminUserId })

    if (!(result.length > 0 && result[0] > 0))
      throw unauthorized('something went wrong during  update status')

    if (body.status === 4)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.rejectedUserTaskStatus(userFromId)

    if (body.status === 3)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.approveUsersTask(userFromId, token)
  }

  async rejectedUserTaskStatus(userFromId: number) {
    const result = await this.userProjectFormRepository.getUserProjectForm({ id: userFromId })
    await this.userTasksRepository.updateUserTask({ taskId: result.taskId, userId: result.userId }, { status: 6 })
  }

  async approveUsersTask(userFromId: number, token: string) {
    const result = await this.userProjectFormRepository.getUserProjectForm({ id: userFromId })
    await this.userTasksRepository.updateUserTask({ taskId: result.taskId, userId: result.userId }, { status: 7 })

    await this.completedUserTask(result.taskId, token)
  }

  public async completedUserTask(taskId: number, token: string) {
    const data = await this.userTasksRepository.getAllUserTasks({ taskId, status: { [neOperator]: 7 } })
    if (data.length > 0)
      return

    await this.tasksRepository.updateTasks({
      id: taskId
    }, {
      status: 7
    })
    await WorkflowService.Instance.completedWorkflowStage(taskId, token)
  }

  public async getUserAllProjectFormByAdmin(orgId: number,
    query: { [key: string]: string | boolean }): Promise<PaginateDataType<UserProjectForm>> {
    const filter = { ...paginate(query) }
    const result = await this.userProjectFormRepository.getUserProjectsByAdmin(this.getAdminFilterFilter({ orgId, ...query }), filter)
    return getPaginateData<UserProjectForm>(filter, result)
  }

  public async getUserAllProjectFormByQuery(dbQuery: WhereOptions<UserProjectForm>,
    query: { [key: string]: string | boolean }): Promise<PaginateDataType<UserProjectForm>> {
    const filter = { ...paginate(query) }
    const customsQuery = this.getAdminFilterFilter({ ...query })
    customsQuery.userProjectForm = { ...dbQuery, ...customsQuery.userProjectForm }
    const result = await this.userProjectFormRepository.getUserProjectsByAdmin(customsQuery, filter)
    return getPaginateData<UserProjectForm>(filter, result)
  }

  getAdminFilterFilter(query: { [key: string]: string | boolean | number }): Filter {
    return {
      projectForms: getProjectFormQueryForAdmin({
        projectId: query['projectId'],
        search: query['searchBy'] === 'formName' ? query['search'] : ''
      }),
      projects: getProjectQueryForAdmin({ search: query['searchBy'] === 'projectName' ? query['search'] : '' }),
      userProjectForm: getUserProjectFormQueryForAdmin({
        ...omit(query, ['search']),
        search: query['searchBy'] === 'title' ? query['search'] : ''
      }),
      users: getUserQueryForAdmin({ search: query['searchBy'] === 'fieldBy' ? query['search'] : '' })
    }
  }

  async downloadXlsx(body: DownloadXlsxRequest, response: Response) {
    const query = await this.getQuery(body)
    const option = {
      order: [['updatedAt', 'DESC']]
    } as IncludeOptions

    if (!isNil(body.sortBy) && !isNil(body.orderBy))
      option['order'] = [[body.sortBy, body.orderBy]]

    const userProjectForm = await this.userProjectFormRepository.getUserProjectFormFieldData(query, option)
    if (userProjectForm.length <= 0)
      throw badRequest('no from field file')

    const result = UserProjectFormHelperService.Instance.formatUserProjectDataForXlxFile(userProjectForm)
    XlsxService.Instance.createFile(result, response)
  }

  async getQuery(body: DownloadXlsxRequest): Promise<WhereOptions<UserProjectForm>> {
    const { formFieldId = [], userFromId = [], projectId, status = [], taskId, userTaskIds = [] } = body
    if (isNil(projectId) && isNil(taskId) && formFieldId.length <= 0 && userFromId.length <= 0 && userTaskIds.length <= 0)
      throw badRequest('min one parameter is require for download')

    const query = {} as any
    if (status.length > 0)
      query['status'] = { [inOperator]: status }

    if (!isNil(projectId)) {
      query['projectId'] = projectId
      return query
    }
    if (!isNil(taskId)) {
      query['taskId'] = taskId
      return query
    }

    if (userTaskIds.length > 0) {
      const ids = await this.userProjectFormRepository.getUserProjectFormIdByUserTaskId(userTaskIds)
      query['id'] = { [inOperator]: ids }
      return query
    }

    if (formFieldId.length > 0) {
      query['projectFormId'] = { [inOperator]: formFieldId }
      return query
    }

    if (userFromId.length > 0) {
      query['id'] = { [inOperator]: userFromId }
      return query
    }

    return query
  }

  public async submitUserTask(userId: string, userFromId: number): Promise<void> {
    const result = await this.userProjectFormRepository.getUserProjectForm({
      userId: userId,
      id: userFromId
    })
    const formResult = await this.taskFormsRepository.getTaskFormsByQuery({
      taskId:
        result.taskId
    }, {}, { taskId: result.taskId, userId }, {})

    if (!this.isAllFormINSubmittedStatus(formResult))
      throw unauthorized('all form is not submitted')

    await this.userTasksRepository.updateUserTask({
      userId: userId,
      taskId: result.taskId,
      status: { [inOperator]: [1, 6] }
    }, { status: 2, updatedBy: userId })
  }

  private isAllFormINSubmittedStatus(data: UserTaskForms[]): boolean {
    let allInSubmitted = true
    for (const value of data) {
      const isSubmitted = value.UserProjectForms.length > 0 &&
        (value.UserProjectForms[0].status === 2 || value.UserProjectForms[0].status === 3)
      if (!isSubmitted) {
        allInSubmitted = false
        break
      }
    }
    return allInSubmitted
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
