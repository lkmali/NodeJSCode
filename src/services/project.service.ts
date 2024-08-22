
import { isNil, omit } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { ProjectsRepository, UserRepository } from '../database/repository'
import { CreateProject, PaginateDataType, Projects, UserProjectData } from '../typings'
import { andOperator, badRequest, getPaginateData, getSearchQuery, paginate, unauthorized } from '../utils'
export class ProjectService {
   private static instance: ProjectService
   private readonly projectsRepository: ProjectsRepository
   private readonly userRepository: UserRepository
   constructor () {
     this.projectsRepository = new ProjectsRepository()
     this.userRepository = new UserRepository()
   }

   public async createProject (projectRequest: CreateProject, adminUserId: string) {
     const result = await this.projectsRepository.getProject({ name: projectRequest.name, orgId: projectRequest.orgId })
     if (!isNil(result))
       throw badRequest(`${projectRequest.name} already exists`)

     const user = await this.userRepository.getUserInformation({ email: projectRequest.projectOwner })
     if (isNil(user))
       throw badRequest('user is not in your organization')

     const data = await this.projectsRepository.saveProjects({
       projectOwnerId: user.userId,
       ...omit(projectRequest, ['projectOwner']),
       createdBy: adminUserId,
       status: 1
     })
     return data
   }

   public async updateProject (projectRequest: CreateProject, projectId: string, adminUserId: string) {
     const result = await this.projectsRepository.getProject({ name: projectRequest.name, orgId: projectRequest.orgId })
     if (!isNil(result) && result.id !== projectId)
       throw badRequest(`${projectRequest.name} already exists`)

     const user = await this.userRepository.getUserInformation({ email: projectRequest.projectOwner })
     if (isNil(user))
       throw badRequest('user is not in your organization')

     await this.projectsRepository.updateProject({
       id: projectId,
       orgId: projectRequest.orgId
     }, {
       projectOwnerId: user.userId,
       ...omit(projectRequest, ['projectOwner']),
       updatedBy: adminUserId
     })
   }

   async activateInActiveProject (orgId: number, projectId: string, isActive: boolean, adminUserId: string): Promise<void> {
     const result = await this.projectsRepository.updateProject({ id: projectId, orgId }, { isActive, updatedBy: adminUserId }) ?? []
     if (!(result.length > 0 && result[0] > 0))
       throw unauthorized('something went wrong during set update information')
   }

   async deleteAndRestoreProject (orgId: number, projectId: string, isDelete: boolean, adminUserId: string): Promise<void> {
     const result = await this.projectsRepository.updateProject({ id: projectId, orgId }, { isDelete, updatedBy: adminUserId }) ?? []
     if (!(result.length > 0 && result[0] > 0))
       throw unauthorized('something went wrong during set update information')
   }

   async getUserProjectByAdmin (userId: string, orgId: number): Promise<UserProjectData> {
     return this.userRepository.getUserProjectsByAdmin({ orgId, userId })
   }

   async getUserProject (userId: string, orgId: number, query: {[key: string]: string| boolean}): Promise<Projects[]> {
     return this.userRepository.getUserProjectsByUser({ userId, orgId, isActive: true, isBlocked: false },
       { isActive: true }, { ...this.getParseQuery(query), isActive: true, isDelete: false, status: 1 })
   }

   async getProjectGroupByAdmin (projectId: string, orgId: number): Promise<Projects[]> {
     return this.projectsRepository.getOrganizationProjectAndGroup({ id: projectId, orgId })
   }

   public async getAllProject (orgId: number, query: {[key: string]: string| boolean}): Promise<PaginateDataType<Projects>> {
     const filter = { ...paginate(query) }
     const result = await this.projectsRepository.getAllProject({ orgId, ...this.getParseQuery(query) }, filter)
     return getPaginateData<Projects>(filter, result)
   }

   public async getProject (orgId: number, projectId: string): Promise<Projects> {
     return this.projectsRepository.getProject({ orgId, id: projectId })
   }

   public async getProjectNames (orgId: number): Promise<Projects[]> {
     return this.projectsRepository.getProjectNames({ orgId })
   }

   getParseQuery (query: {[key: string]: string| boolean}): WhereOptions<Projects> {
     let result: WhereOptions<Projects> = { }

     if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
       result['id'] = query.id

     if (Object.prototype.hasOwnProperty.call(query, 'isDelete') && !isNil(query['isDelete']))
       result['isDelete'] = query.isDelete === true || query.isDelete.toString() === 'true'

     if (Object.prototype.hasOwnProperty.call(query, 'isActive') && !isNil(query['isActive']))
       result['isActive'] = query.isActive === true || query.isActive.toString() === 'true'

     if (Object.prototype.hasOwnProperty.call(query, 'search') && !isNil(query['search']) && (query['search'] as string).length > 0) {
       const search = '%' + (query.search as string).toLocaleLowerCase() + '%'
       const data = getSearchQuery(search, ['name'])

       result = { ...andOperator([data]), ...result }
     }
     return result
   }

   // async saveProjectsUser (projectId: string, orgId: number, email: string, createdBy: string): Promise<void> {
   //   const user = await this.userRepository.getUserInformation({ email, orgId })
   //   if (isNil(user))
   //     throw badRequest(`${email} not in your organization`)

   //   const group = await this.userProjectsRepository.getUserProjects({ projectId, userId: user.userId })
   //   if (isNil(group))
   //     await this.userProjectsRepository.saveUserProjects({ projectId, userId: user.userId, createdBy })
   // }

   // async updateProjectGroup (data: Omit<ProjectGroups, 'id'>): Promise<void> {
   //   const projectGroup = await this.projectGroupsRepository.getProjectGroups({ projectId: data.projectId, groupId: data.groupId })
   //   if (isNil(projectGroup))
   //     await this.projectGroupsRepository.saveProjectGroups(data)
   // }

   //  public async addProjectGroup (projectId: string, groups: number[]) {
   //    await Promise.all(groups.map((groupId) => this.updatePermission(projectId, groupId)))
   //  }

   //  async updatePermission (projectId: string, groupId: number) {
   //    const data = await this.projectGroupsRepository.getProjectGroups(projectId, groupId)
   //    if (isNil(data))
   //      await this.projectGroupsRepository.saveProjectGroups({ projectId, groupId })
   //  }

   public static get Instance () {
     if (isNil(this.instance))
       this.instance = new this()

     return this.instance
   }
}
