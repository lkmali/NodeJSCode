
import { isNil, omit } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { GroupRepository, UserGroupRepository, UserRepository } from '../database/repository'
import { CreateUsersGroup, Groups, PaginateDataType } from '../typings'
import { andOperator, badRequest, getPaginateData, getSearchQuery, paginate, unauthorized } from '../utils'
export class GroupService {
    private static instance: GroupService
   private readonly userRepository: UserRepository
   private readonly groupRepository: GroupRepository

   private readonly userGroupRepository: UserGroupRepository
   constructor () {
     this.userRepository = new UserRepository()
     this.groupRepository = new GroupRepository()
     this.userGroupRepository = new UserGroupRepository()
   }

   async createGroup (data: Omit<Groups, 'id'>): Promise<Groups> {
     const group = await this.groupRepository.getGroup({ name: data.name, orgId: data.orgId })
     if (!isNil(group))
       throw unauthorized('group already created for this org')

     return this.groupRepository.saveGroup(data)
   }

   async activateInActiveGroup (orgId: number, groupId: number, isActive: boolean, adminUserId: string): Promise<void> {
     const result = await this.groupRepository.updateGroup({ id: groupId, orgId }, { isActive, updatedBy: adminUserId }) ?? []
     if (!(result.length > 0 && result[0] > 0))
       throw unauthorized('something went wrong during set update information')
   }

   async updateGroup (data: Groups): Promise<void> {
     const group = await this.groupRepository.getGroup({ name: data.name, orgId: data.orgId })
     if (!isNil(group) && group.id !== data.id)
       throw unauthorized('group already created for this org')

     const result = await this.groupRepository.updateGroup({ id: data.id, orgId: data.orgId },
       { ...omit(data, ['id']) }) ?? []
     if (!(result.length > 0 && result[0] > 0))
       throw unauthorized('something went wrong during  update group information')
   }

   public async getOrgGroups (orgId: number, query: {[key: string]: string| boolean}): Promise<PaginateDataType<Groups>> {
     const filter = { ...paginate(query) }
     const result = await this.groupRepository.getAllGroups({ orgId, ...this.getParseQuery(query) }, filter)
     return getPaginateData<Groups>(filter, result)
   }

   async addUsersGroup (data: CreateUsersGroup): Promise<void> {
     const { groupId, emails, adminUserId, orgId } = data
     const group = await this.groupRepository.getGroup({ id: groupId, orgId })
     if (isNil(group))
       throw unauthorized('invalid group id')

     await Promise.all(emails.map((email) => this.saveUserGroup(groupId, orgId, email, adminUserId)))
   }

   async removeGroupUsers (groupId: number, orgId: number, userIds: string[]): Promise<void> {
     const group = await this.groupRepository.getGroup({ id: groupId, orgId })
     if (isNil(group))
       throw badRequest('group is not in your organization')

     await Promise.all(userIds.map((userId) => this.userGroupRepository.removeUserGroup({ userId, groupId })))
   }

   async removeUserGroups (userId: string, orgId: number, groupIds: number[]): Promise<void> {
     const group = await this.userRepository.getUserInformation({ userId, orgId })
     if (isNil(group))
       throw badRequest('user is not in your organization')

     await Promise.all(groupIds.map((groupId) => this.userGroupRepository.removeUserGroup({ userId, groupId })))
   }

   async saveUserGroup (groupId: number, orgId: number, email: string, createdBy: string): Promise<void> {
     const user = await this.userRepository.getUserInformation({ email, orgId })
     if (isNil(user))
       throw badRequest(`${email} not in your organization`)

     const group = await this.userGroupRepository.getUserGroup({ groupId, userId: user.userId })
     if (isNil(group))
       await this.userGroupRepository.saveUserGroup({ groupId, userId: user.userId, createdBy })
   }

   async getOrganizationGroupAndUser (orgId: number, groupId: number): Promise<Groups[]> {
     return this.groupRepository.getOrganizationGroupAndUser({ id: groupId, orgId })
   }

   public async getGroupNames (orgId: number): Promise<Groups[]> {
     return this.groupRepository.getGroupNames({ orgId })
   }

   public async getGroup (orgId: number, groupId: number): Promise<Groups | null> {
     return this.groupRepository.getGroup({ orgId, id: groupId })
   }

   async getOrganizationGroupAndProjectFrom (orgId: number, groupId: number): Promise<Groups[]> {
     return this.groupRepository.getOrganizationGroupAndProjectFrom({ id: groupId, orgId })
   }

   async getOrganizationGroupAndProject (orgId: number, groupId: number): Promise<Groups[]> {
     return this.groupRepository.getOrganizationGroupAndProject({ id: groupId, orgId })
   }

   getParseQuery (query: {[key: string]: string| boolean}): WhereOptions<Groups> {
     let result: WhereOptions<Groups> = { }

     if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
       result['id'] = Number(query.id)

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

   public static get Instance () {
     if (isNil(this.instance))
       this.instance = new this()

     return this.instance
   }
}
