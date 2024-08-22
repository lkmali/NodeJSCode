
import { isNil } from 'lodash'
import actionData from '../data/action.json'
import {
  clientInformation, organizationAddress, organizationInformation, userAddress, userInformation
} from '../data/defaultUserInformation.json'
import fieldTypes from '../data/field-type.json'
import roleData from '../data/role.json'
import { ActionRepository, AddressRepository, ClientRepository, FormFieldTypeRepository, OrganizationRepository, RoleRepository, UserRepository, UserRoleRepository } from '../database/repository'
import { Actions, Clients, FormFieldTypes, OrgAddress, Organizations, Roles, RoleType, UserAddress } from '../typings'
import { badRequest } from '../utils'

export class SeederService {
  private readonly userRepository: UserRepository
  private readonly roleRepository: RoleRepository
  private readonly userRoleRepository: UserRoleRepository
  private readonly actionRepository: ActionRepository
  private readonly clientRepository: ClientRepository
  private readonly addressRepository: AddressRepository
  private readonly organizationRepository: OrganizationRepository
  private readonly formFieldTypeRepository: FormFieldTypeRepository
  constructor() {
    this.userRepository = new UserRepository()
    this.userRoleRepository = new UserRoleRepository()
    this.roleRepository = new RoleRepository()
    this.actionRepository = new ActionRepository()
    this.clientRepository = new ClientRepository()
    this.addressRepository = new AddressRepository()
    this.organizationRepository = new OrganizationRepository()
    this.formFieldTypeRepository = new FormFieldTypeRepository()
  }

  public async saveSeedData() {
    await Promise.all([this.insertRoles(), this.insertAllAction(), this.insertAllFormFields()])
    await this.insertUserInformation()
  }

  async insertClient(data: Omit<Clients, 'id'>): Promise<Clients> {
    const result = await this.clientRepository.getClientInformation(data.name)
    if (isNil(result))
      return this.clientRepository.saveClientInformation({ ...data, isActive: true })

    return result
  }

  async insertOrigination(data: Omit<Organizations, 'id'>): Promise<Organizations> {
    const result = await this.organizationRepository.getOrganization(data.orgName, data.clientId)
    if (isNil(result))
      return this.organizationRepository.saveOrganization({ ...data, isActive: true })

    return result
  }

  async insertUserAddress(data: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    return this.addressRepository.saveUserAddress(data)
  }

  async saveOrgAddress(data: Omit<OrgAddress, 'id'>): Promise<void> {
    return this.addressRepository.saveOrgAddress(data)
  }

  async insertUserRole(userId: string, roleName: RoleType): Promise<void> {
    const data = await this.roleRepository.getRole({
      name: roleName,
      isDefaultAdmin: false
    })
    if (isNil(data))
      throw badRequest('invalid role name')

    await this.userRoleRepository.upsertUserRole(userId, data.id)
  }

  async insertSuperAminRole(userId: string): Promise<void> {
    const { id } = await this.roleRepository.getSuperAdminRoleId()

    await this.userRoleRepository.upsertUserRole(userId, id)
  }

  async getDefaultInformationForUser(): Promise<{ clientId: number; orgId: number }> {
    const result = await this.clientRepository.getClientInformation(clientInformation.name)
    const org = await this.organizationRepository.getOrganization(organizationInformation.orgName, result.id)
    return { clientId: result.id, orgId: org.id }
  }

  private async insertUserInformation() {
    const user = await this.userRepository.getUser(userInformation.phone)
    if (!isNil(user)) return

    const client = await this.insertClient(clientInformation)

    const result = await this.insertOrigination({ ...organizationInformation, clientId: client.id })

    const userResult = await this.userRepository.saveUser({
      ...userInformation,
      orgId: result.id,
      isActive: true,
      isVerified: false,
      lastLoginTime: new Date()
    })

    await Promise.all([
      this.insertSuperAminRole(userResult.userId),
      this.saveOrgAddress({ ...organizationAddress, orgId: result.id }),
      this.insertUserAddress({ ...userAddress, userId: userResult.userId })
    ])
  }

  private async insertRole(role: Omit<Roles, 'id'>): Promise<void> {
    const result = await this.roleRepository.getRole({ name: role.name })
    if (isNil(result))
      await this.roleRepository.saveRole(role)
    else
      await this.roleRepository.updateRoles({ name: role.name }, role)
  }

  private async insertAction(data: Omit<Actions, 'id'>): Promise<void> {
    const result = await this.actionRepository.getAction(data.actionName)
    if (isNil(result))
      await this.actionRepository.saveAction(data)
    else
      await this.actionRepository.updateActions({ actionName: data.actionName }, data)
  }

  private async insertRoles(): Promise<void> {
    await Promise.all(roleData.map((role: any) => this.insertRole(role)))
  }

  private async insertAllAction(): Promise<void> {
    await Promise.all(actionData.map(action => this.insertAction(action)))
  }

  private async insertionFields(fieldType: Omit<FormFieldTypes, 'id' | 'isActive' | 'isDelete'>): Promise<void> {
    const result = await this.formFieldTypeRepository.getFormField(fieldType.fieldName)
    if (isNil(result))
      await this.formFieldTypeRepository.saveFormField({ ...fieldType, isActive: true, isDelete: false })
    else
      await this.formFieldTypeRepository.updateFormFieldTypes({ fieldName: fieldType.fieldName }, fieldType)
  }

  private async insertAllFormFields(): Promise<void> {
    await Promise.all(fieldTypes.map(fieldType => this.insertionFields(fieldType)))
  }
}
