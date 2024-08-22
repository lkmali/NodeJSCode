import { isNil, pick } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { ProjectFormsRepository } from '../database/repository'
import { CreateProjectForms, FormsFilter, PaginateDataType, ProjectForms } from '../typings'
import { andOperator, badRequest, getPaginateData, getProjectFormQueryForAdmin, getSearchQuery, getUserQueryForAdmin, paginate, unauthorized } from '../utils'

export class ProjectFormService {
  private static instance: ProjectFormService
  private readonly projectFormsRepository: ProjectFormsRepository
  constructor() {
    this.projectFormsRepository = new ProjectFormsRepository()
  }

  public async createProjectForm(projectForm: CreateProjectForms, orgId: number, adminUserId: string) {
    const result = await this.projectFormsRepository.getSingleProjectForm({
      name: projectForm.name,
      orgId
    })
    if (!isNil(result))
      throw badRequest(`${projectForm.name} already exists`)

    const data = await this.projectFormsRepository.saveProjectForms({
      ...pick(projectForm, ['description', 'name']),
      orgId,
      isPublish: false,
      createdBy: adminUserId
    })
    return data
  }

  public async updateProjectForm(projectFormId: number, projectForm: CreateProjectForms, orgId: number, adminUserId: string) {
    const data = await this.projectFormsRepository.getSingleProjectForm({
      name: projectForm.name,
      orgId
    })
    if (!isNil(data) && data.id !== projectFormId)
      throw badRequest(`${projectForm.name} already exists`)

    const result = await this.projectFormsRepository.updateProjectForm({
      orgId,
      id: projectFormId,
      isPublish: false
    }, {
      ...pick(projectForm, ['description', 'name']),
      orgId,
      updatedBy: adminUserId
    }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw badRequest(`${projectForm.name} already publish or some others error occurring`)
  }

  public async getProjectFormById(projectFormId: number, orgId: number) {
    const data = await this.projectFormsRepository.getSingleProjectForm({
      id: projectFormId,
      orgId
    })
    return data
  }

  public async publishProjectForm(projectFormId: number, orgId: number, adminUserId: string) {
    const result = await this.projectFormsRepository.updateProjectForm({
      orgId,
      id: projectFormId,
      isPublish: false
    }, {
      isPublish: true,
      orgId,
      updatedBy: adminUserId
    }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw badRequest('already publish or some others error occurring')
  }

  public async getAllProjectForm(orgId: number, query: { [key: string]: string | boolean }): Promise<PaginateDataType<ProjectForms>> {
    const filter = { ...paginate(query) }
    const result = await this.projectFormsRepository.getAllProjectForm(this.getAdminFilterFilter({ ...query, orgId }), filter)
    return getPaginateData<ProjectForms>(filter, result)
  }

  public async getProjectFormNames(orgId: number, query: { [key: string]: string | boolean }): Promise<ProjectForms[]> {
    return this.projectFormsRepository.getProjectFormsNames({ orgId, ...this.getParseQuery(query), isPublish: true })
  }

  // async getUserProjectByAdmin (userId: string, orgId: number): Promise<UserProjectData> {
  //   return this.userRepository.getUserProjectsByAdmin({ orgId, userId })
  // }

  // async getUserProject (userId: string, orgId: number, query: Partial<Projects>): Promise<Projects[]> {
  //   return this.userRepository.getUserProjectsByUser({ userId, orgId, isActive: true, isBlocked: false },
  //     { isActive: true }, { ...this.getParseQuery(query), isActive: true, isDelete: false })
  // }

  // async getUserProjectFormByAdmin(userId: string, orgId: number): Promise<UserProjectFrom> {
  //   return this.userRepository.getUserProjectFormsByAdmin({ userId, orgId })
  // }

  // async getProjectFormByUser(userId: string, orgId: number, query: { [key: string]: string | boolean }): Promise<ProjectForms[]> {
  //   return this.userRepository.getUserProjectFormsByUser({
  //     userId,
  //     orgId,
  //     isActive: true,
  //     isBlocked: false
  //   }, { isActive: true }, {
  //     ...this.getParseQuery(query),
  //     isPublish: true,
  //     isActive: true,
  //     isDelete: false
  //   })
  // }

  async activateInActiveProjectForm(orgId: number, id: number, isActive: boolean, adminUserId: string): Promise<void> {
    const result = await this.projectFormsRepository.updateProjectForm({ id, orgId }, { isActive, updatedBy: adminUserId }) ?? []
    if (!(result.length > 0 && result[0] > 0))
      throw unauthorized('something went wrong during set update information')
  }

  getParseQuery(query: { [key: string]: string | boolean }): WhereOptions<ProjectForms> {
    let result: WhereOptions<ProjectForms> = {}

    if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
      result['id'] = Number(query.id)

    if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
      result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

    if (Object.prototype.hasOwnProperty.call(query, 'isPublish') && !isNil(query['isPublish']))
      result['isPublish'] = query.isPublish === true || query.isPublish.toString() === 'true'

    if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) &&
      (query['search'] as string).length > 0) {
      const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
      const data = getSearchQuery(search, ['ProjectForms.name'])

      result = { ...andOperator([data]), ...result }
    }

    return result
  }

  private getAdminFilterFilter(query: { [key: string]: string | boolean | number }): FormsFilter {
    return {
      projectForms: getProjectFormQueryForAdmin({
        ...query,
        search: query['searchBy'] === 'formName' ? query['search'] : ''
      }, ['ProjectForms.name']),
      users: getUserQueryForAdmin({ search: query['searchBy'] === 'createdBy' ? query['search'] : '' },
        ['createdByUser.username', 'createdByUser.email', 'createdByUser.phone'])
    }
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
