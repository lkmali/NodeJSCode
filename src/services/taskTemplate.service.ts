
import { isNil } from 'lodash'
import { WhereOptions } from 'sequelize'
import { ProjectFormsRepository, TaskTemplateRepository } from '../database/repository'
import { PaginateDataType, TaskTemplate } from '../typings'
import { andOperator, badRequest, getPaginateData, getSearchQuery, paginate } from '../utils'

export class TaskTemplateService {
  private static instance: TaskTemplateService

  private readonly taskTemplateRepository: TaskTemplateRepository
  private readonly projectFormsRepository: ProjectFormsRepository
  constructor() {
    this.taskTemplateRepository = new TaskTemplateRepository()
    this.projectFormsRepository = new ProjectFormsRepository()
  }

  public async createTaskTemplate(taskTemplate: Omit<TaskTemplate, 'id'>, adminId: string) {
    const result = await this.taskTemplateRepository.getTaskTemplate({
      name: taskTemplate.name,
      orgId: taskTemplate.orgId
    })
    if (!isNil(result))
      throw badRequest(`${result.name} already exists`)

    const projectForms = await this.projectFormsRepository.getSingleProjectForm({
      id: taskTemplate.projectFormId,
      isPublish: true
    })

    if (isNil(projectForms))
      throw badRequest('project form should be publish ')

    const data = await this.taskTemplateRepository.saveTaskTemplate({
      name: taskTemplate.name,
      description: taskTemplate.description,
      isActive: true,
      isDelete: false,
      projectFormId: taskTemplate.projectFormId,
      orgId: taskTemplate.orgId,
      isPublish: taskTemplate.isPublish === true,
      taskAcceptanceCriteria: taskTemplate.taskAcceptanceCriteria,
      createdBy: adminId,
      updatedBy: adminId
    })
    return data
  }

  public async getTaskTemplate(id: number, orgId: number) {
    const data = await this.taskTemplateRepository.getTaskTemplate({
      id,
      orgId,
      isPublish: true
    })

    if (isNil(data))
      throw badRequest('in valid task template Id ')

    return data
  }

  public async updateTaskTemplate(taskTemplateId: number, taskTemplate: Omit<TaskTemplate, 'id'>, adminId: string) {
    const data = await this.taskTemplateRepository.getTaskTemplate({
      name: taskTemplate.name,
      orgId: taskTemplate.orgId
    })
    if (!isNil(data) && data.id !== taskTemplateId)
      throw badRequest(`${taskTemplate.name} already exists`)

    const projectForms = await this.projectFormsRepository.getSingleProjectForm({
      id: taskTemplate.projectFormId,
      isPublish: true
    })

    if (isNil(projectForms))
      throw badRequest('project form should be publish ')

    await this.taskTemplateRepository.updateTaskTemplate({
      orgId: taskTemplate.orgId,
      id: taskTemplateId,
      isPublish: false
    }, {
      name: taskTemplate.name,
      projectFormId: taskTemplate.projectFormId,
      description: taskTemplate.description,
      isActive: true,
      isDelete: false,
      orgId: taskTemplate.orgId,
      taskAcceptanceCriteria: taskTemplate.taskAcceptanceCriteria,
      updatedBy: adminId
    })

    const result = await this.taskTemplateRepository.updateTaskTemplate({
      orgId: taskTemplate.orgId,
      id: taskTemplateId,
      isPublish: false
    }, {
      name: taskTemplate.name,
      description: taskTemplate.description,
      isActive: true,
      isDelete: false,
      orgId: taskTemplate.orgId,
      taskAcceptanceCriteria: taskTemplate.taskAcceptanceCriteria,
      updatedBy: adminId
    }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw badRequest(`${taskTemplate.name} already publish or some others error occurring`)
  }

  public async publishTaskTemplate(taskTemplateId: number, orgId: number, adminUserId: string) {
    const result = await this.taskTemplateRepository.updateTaskTemplate({
      orgId,
      id: taskTemplateId,
      isPublish: false
    }, {
      isPublish: true,
      orgId,
      updatedBy: adminUserId
    }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw badRequest('already publish or some others error occurring')
  }

  public async deleteTaskTemplate(taskTemplateId: number, orgId: number) {
    const result = await this.taskTemplateRepository.getTaskTemplate({
      id: taskTemplateId,
      orgId: orgId,
      isPublish: false
    })
    if (isNil(result))
      throw badRequest('invalid taskTemplate id')

    await this.taskTemplateRepository.deleteTask(taskTemplateId)
  }

  public async getAllTaskByAdmin(query: { [key: string]: string | boolean | number }): Promise<PaginateDataType<TaskTemplate>> {
    const filter = { ...paginate(query) }
    const customsQuery = this.getTaskTemplateAdminFilter({ ...query, isDelete: false })
    const result = await this.taskTemplateRepository.getAllTaskTemplate(customsQuery, filter)
    return getPaginateData<TaskTemplate>(filter, result)
  }

  private getTaskTemplateAdminFilter(query: { [key: string]: string | boolean | number }) {
    let result: WhereOptions<TaskTemplate> = {}

    if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
      result['id'] = Number(query.id)

    if (Object.prototype.hasOwnProperty.call(query, 'orgId') && !isNil(query['orgId']))
      result['orgId'] = query.orgId

    if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
      result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

    if (Object.prototype.hasOwnProperty.call(query, 'isPublish') && !isNil(query['isPublish']))
      result['isPublish'] = query.isPublish === true || query.isPublish.toString() === 'true'

    if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) &&
      (query['search'] as string).length > 0) {
      const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
      const data = getSearchQuery(search, ['TaskTemplate.name'])
      result = { ...andOperator([data]), ...result }
    }

    return result
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
