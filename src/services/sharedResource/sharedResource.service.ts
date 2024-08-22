import { isNil, omit } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { NotificationService, UserProjectFormService } from '..'
import { ResourceSharingRepository } from '../../database/repository'
import { AdminInfo, DownloadXlsxRequest, PaginateDataType, ResourceSharing, ResourceType, SharingFilter } from '../../typings'
import { badRequest, getPaginateData, getResourceSharingFoAdmin, getUniqArray, getUserProjectFormQueryForAdmin, getUserQueryForAdmin, inOperator, jsonParse, paginate, unauthorized } from '../../utils'
import { EncryptionService } from '../encryption.service'

export class SharedResourceService {
  private static instance: SharedResourceService

  private readonly resourceSharingRepository: ResourceSharingRepository

  constructor() {
    this.resourceSharingRepository = new ResourceSharingRepository()
  }

  async saveSharedResource(data: Omit<ResourceSharing, 'id'>[], resource: ResourceType, admin: AdminInfo) {
    const values = await Promise.all(data.map((value: Omit<ResourceSharing, 'id'>) => this.saveSingleResourceData({
      ...value,
      resource
    }, admin)))

    const emails = getUniqArray(values)

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(emails.map((email: string) => this.sendSharedEmail(email,
      admin.email, resource)))
  }

  async resendEmailToSharedUser(email: string, resource: ResourceType, admin: string) {
    await this.sendSharedEmail(email, admin, resource)
  }

  async saveSingleResourceData(data: Omit<ResourceSharing, 'id'>, admin: AdminInfo): Promise<string | null> {
    const type = this.getResourceTypeIdValue(data.resource, data)
    const result = await this.resourceSharingRepository.getResourceData({
      permission: data.permission,
      email: data.email,
      resource: data.resource,
      ...type
    })
    if (!isNil(result))
      return null

    await this.resourceSharingRepository.saveResourceSharing({
      permission: data.permission,
      email: data.email,
      orgId: admin.orgId,
      resource: data.resource,
      createdBy: admin.userId,
      ...type

    })

    return data.email
  }

  async deleteResourceData(id: number, orgId: number) {
    const data = await this.resourceSharingRepository.getResourceData({ id, orgId })
    if (isNil(data))
      throw badRequest('invalid request')

    await this.resourceSharingRepository.removeResourceData(data.id)
  }

  getResourceTypeIdValue(resource: ResourceType, data: Omit<ResourceSharing, 'id'>) {
    switch (resource) {
      case 'form-data': {
        this.checkValue(data.userFromId, 'userFromId')
        return { userFromId: data.userFromId }
      }
      case 'user': {
        this.checkValue(data.userId, 'userId')
        return { userId: data.userId }
      }
      case 'project-form': {
        this.checkValue(data.projectFormId, 'projectFormId')
        return { projectFormId: data.projectFormId }
      }
      case 'project': {
        this.checkValue(data.projectId, 'projectId')
        return { projectId: data.projectId }
      }
      case 'group': {
        this.checkValue(data.groupId, 'groupId')
        return { groupId: data.groupId }
      }
      default: {
        throw badRequest('invalid resource')
      }
    }
  }

  checkValue(value: string | number | undefined, type: string) {
    if (isNil(value))
      throw badRequest(`missing ${type}`)
  }

  async sendSharedEmail(userEmail: string | null, adminEmail: string, resource: ResourceType) {
    if (isNil(userEmail))
      return

    const otp = EncryptionService.Instance.encrypt(JSON.stringify({ email: userEmail }))

    const data = {
      'form-data': 'project form field data by user',
      user: 'user list data',
      'project-form': 'project form data',
      project: 'project data',
      group: 'group data'
    }

    await NotificationService.Instance.sharedResourceMail({ email: userEmail, otp, adminEmail, resource: data[resource] })
  }

  async getSharedUserEmail(otp: string): Promise<string> {
    const data = jsonParse(EncryptionService.Instance.decrypt(otp)) as { email: string }
    if (!(!isNil(data) && !isNil(data.email)))
      throw unauthorized('invalidLink')

    const result = await this.resourceSharingRepository.getResourceData({
      email: data.email
    })
    if (isNil(result))
      throw unauthorized('invalidLink')

    return data.email
  }

  public async getAllSharedResourceByFilter(orgId: number,
    query: { [key: string]: string | boolean }): Promise<PaginateDataType<ResourceSharing>> {
    const filter = { ...paginate(query) }
    const result = await this.resourceSharingRepository.getAllResourceSharing(this.getAdminFilterFilter({ ...query, orgId }), filter)
    return getPaginateData<ResourceSharing>(filter, result)
  }

  public async getAllSharedResourceWithoutFilter(orgId: number, query: { [key: string]: string | boolean }): Promise<ResourceSharing[]> {
    const result = await this.resourceSharingRepository.getAllResourceData({ ...this.getParseQuery(query), orgId })
    return result
  }

  getParseQuery(query: { [key: string]: string | boolean }): WhereOptions<ResourceSharing> {
    const result: WhereOptions<ResourceSharing> = {}

    if (Object.prototype.hasOwnProperty.call(query, 'id') && !isNil(query['id']))
      result['id'] = query.id

    if (Object.prototype.hasOwnProperty.call(query, 'projectId') && !isNil(query['projectId']))
      result['projectId'] = query.projectId

    if (Object.prototype.hasOwnProperty.call(query, 'projectFormId') && !isNil(query['projectFormId']))
      result['projectFormId'] = Number(query.projectFormId)

    if (Object.prototype.hasOwnProperty.call(query, 'userFromId') && !isNil(query['userFromId']))
      result['userFromId'] = Number(query.userFromId)

    if (Object.prototype.hasOwnProperty.call(query, 'groupId') && !isNil(query['groupId']))
      result['groupId'] = Number(query.groupId)

    if (Object.prototype.hasOwnProperty.call(query, 'userId') && !isNil(query['userId']))
      result['userId'] = query.userId

    if (Object.prototype.hasOwnProperty.call(query, 'resource') && !isNil(query['resource']))
      result['resource'] = query.resource

    if (Object.prototype.hasOwnProperty.call(query, 'email') && !isNil(query['email']))
      result['email'] = query.email

    if (Object.prototype.hasOwnProperty.call(query, 'permission') && !isNil(query['permission']))
      result['permission'] = query.permission

    return result
  }

  async getSharedResourceDataByResource(email: string, resource: ResourceType,
    query: { [key: string]: string | boolean }): Promise<{ count: number; data: any[] }> {
    const data = await this.resourceSharingRepository.getAllResourceData({
      email,
      resource
    })
    if (data.length <= 0)
      return { count: 0, data: [] }

    switch (resource) {
      case 'form-data': {
        query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'title'
        query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
        const ids = data.map((value: ResourceSharing) => value.userFromId)

        return UserProjectFormService.Instance.getUserAllProjectFormByQuery({ id: { [inOperator]: ids } }, { ...omit(query, ['id']) })
      }
      default: {
        throw unauthorized('Access Denied')
      }
    }
  }

  async validateResourceData(query: WhereOptions<ResourceSharing>): Promise<void> {
    const data = await this.resourceSharingRepository.getResourceData(query)
    if (isNil(data))
      throw unauthorized('Access Denied')
  }

  async downloadXlsxValidation(email: string, body: DownloadXlsxRequest): Promise<DownloadXlsxRequest> {
    if (!isNil(body.projectId)) {
      const data = await this.resourceSharingRepository.getAllResourceData({
        email,
        projectId: body.projectId
      })
      if (data.length >= 0)
        return { projectId: body.projectId }
    }
    if (!isNil(body.formFieldId) && body.formFieldId.length > 0) {
      const data = await this.resourceSharingRepository.getAllResourceData({
        email,
        projectFormId: { [inOperator]: body.formFieldId }
      })
      if (data.length >= 0)
        return { formFieldId: data.map((value: ResourceSharing) => value.projectFormId) as number[] }
    }

    if (!isNil(body.userFromId) && body.userFromId.length > 0) {
      const data = await this.resourceSharingRepository.getAllResourceData({
        email,
        userFromId: { [inOperator]: body.userFromId }
      })
      if (data.length >= 0)
        return { userFromId: data.map((value: ResourceSharing) => value.userFromId) as number[] }
    }

    throw unauthorized('Access Denied')
  }

  private getAdminFilterFilter(query: { [key: string]: string | boolean | number }): SharingFilter {
    return {
      share: getResourceSharingFoAdmin({
        ...query,
        search: query['searchBy'] === 'email' ? query['search'] : ''
      }),
      userProjectForm: getUserProjectFormQueryForAdmin({ search: query['searchBy'] === 'formTitle' ? query['search'] : '' },
        ['fromData.title']),
      users: getUserQueryForAdmin({ search: query['searchBy'] === 'formFieldBy' ? query['search'] : '' },
        ['fromData.user.username', 'fromData.user.email', 'fromData.user.phone'])
    }
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
