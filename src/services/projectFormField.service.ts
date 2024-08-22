import { isNil, keyBy } from 'lodash'
import fieldTypes from '../data/field-type.json'
import { FormFieldTypeRepository, ProjectFormFieldsRepository, ProjectFormsRepository, UserRepository } from '../database/repository'
import { CreateProjectFormFieldRequest, FormFieldTypes, ProjectFormFieldRequest, ProjectFormFields } from '../typings'
import { badRequest, prepareData } from '../utils'
export class ProjectFormFieldService {
  private static instance: ProjectFormFieldService
  private readonly projectFormFieldsRepository: ProjectFormFieldsRepository
  private readonly fieldTypesObject: { [key: string]: FormFieldTypes }
  private readonly projectFormsRepository: ProjectFormsRepository
  private readonly userRepository: UserRepository
  private readonly formFieldTypeRepository: FormFieldTypeRepository
  constructor() {
    this.userRepository = new UserRepository()
    this.formFieldTypeRepository = new FormFieldTypeRepository()
    this.projectFormFieldsRepository = new ProjectFormFieldsRepository()
    this.projectFormsRepository = new ProjectFormsRepository()
    this.fieldTypesObject = keyBy(fieldTypes, 'fieldName') as { [key: string]: FormFieldTypes }
  }

  async createProjectFormField(request: CreateProjectFormFieldRequest[], orgId: number, projectFormId: number) {
    const result = await this.projectFormsRepository.getSingleProjectForm({ id: projectFormId, orgId, isPublish: false })
    if (isNil(result))
      throw badRequest('project form is already publish or invalid projectFormId')

    const { isValid, message } = this.validateProjectField(request, { isChild: false, onlyHaveSelectOption: false, parentField: '' })
    if (!isValid)
      throw badRequest(message)

    await this.insertProjectFormField(request, { projectFormId })
  }

  // async getUserProjectFormField(projectFormId: number, userId: string, orgId: number): Promise<ProjectFormFields[]> {
  //   const projectForm = await this.userRepository.getUserProjectFormsByUser({
  //     userId,
  //     orgId,
  //     isActive: true,
  //     isBlocked: false
  //   }, { isActive: true }, {
  //     id: projectFormId,
  //     isActive: true,
  //     isPublish: true,
  //     isDelete: false
  //   })
  //   if (projectForm.length <= 0)
  //     throw badRequest('invalid projectFormId')

  //   const result = prepareData(await this.projectFormFieldsRepository.getProjectFormFieldInformation(projectFormId))
  //   return result
  // }

  async getProjectFormField(projectFormId: number): Promise<ProjectFormFields[]> {
    return prepareData(await this.projectFormFieldsRepository.getProjectFormFieldInformation(projectFormId))
  }

  async getAllFormFieldType(): Promise<FormFieldTypes[]> {
    return this.formFieldTypeRepository.getAllFormFieldType()
  }

  async conformAddedImageUrl(userId: string): Promise<void> {
    await this.userRepository.updateUserInformation({ userId }, { isProfileSet: true })
  }

  private validateProjectSingleField(request: CreateProjectFormFieldRequest,
    option = { isChild: false, onlyHaveSelectOption: false, parentField: '' }): { isValid: boolean; message: string } {
    if (Object.hasOwnProperty.call(this.fieldTypesObject, request.fieldType)) {
      if (!isNil(request.isDelete) && !isNil(request.id) && request.isDelete)
        return { isValid: true, message: '' }

      const data = this.fieldTypesObject[request.fieldType]

      if (!option.isChild && !data.isParent)
        return { isValid: false, message: `${request.fieldType} can be only children` }

      if (request.fieldType === 'selectOption' && !option.onlyHaveSelectOption)
        return { isValid: false, message: `${option.parentField} in can not be selectOption` }

      if (data.repeatCountRequire)
        if (!(!isNaN(request.repeatCount) && request.repeatCount > 0))
          return { isValid: false, message: `${request.fieldType} for repeatCount require ${request.title}` }

      if (data.childRequire) {
        if (!(Array.isArray(request.children) && request.children.length > 0))
          return { isValid: false, message: `${request.fieldType} for child require ${request.title}` }
        option.isChild = true
        option.onlyHaveSelectOption = ['select', 'multiSelect', 'rank'].indexOf(request.fieldType) >= 0
        option.parentField = request.fieldType
        return this.validateProjectField(request.children, option)
      }

      return { isValid: true, message: '' }
    } else
      return { isValid: false, message: `${request.fieldType} not found for ${request.title}` }
  }

  private validateProjectField(request: CreateProjectFormFieldRequest[],
    option = { isChild: false, onlyHaveSelectOption: false, parentField: '' }): { isValid: boolean; message: string } {
    let isValid = true
    let message = ''
    for (const data of request) {
      const result = this.validateProjectSingleField(data, option)
      if (!result.isValid) {
        isValid = result.isValid
        message = result.message
        break
      }
    }

    return { isValid, message }
  }

  private async insertProjectFormSingleField(request: CreateProjectFormFieldRequest,
    options: ProjectFormFieldRequest) {
    if (Object.hasOwnProperty.call(this.fieldTypesObject, request.fieldType))
      if (!isNil(request.isDelete) && !isNil(request.id) && request.isDelete)
        return this.deleteProjectFormFieldData(request)
      else
        return this.upsertFormFieldData(request, options)
  }

  private async upsertFormFieldData(request: CreateProjectFormFieldRequest,
    options: ProjectFormFieldRequest) {
    const data = this.fieldTypesObject[request.fieldType]
    const projectFormField = this.updateObject(data, request, options) as ProjectFormFields
    const result = await this.projectFormFieldsRepository.upsertData(projectFormField, request.id)
    if (data.childRequire) {
      options.parentId = result.id
      await Promise.all(request.children.map((value) => this.insertProjectFormSingleField(value, options)))
    } else
    if (!isNil(request.id))
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.deleteFormFieldChildren(request.id)
  }

  private async deleteProjectFormFieldData(request: CreateProjectFormFieldRequest) {
    if (!isNil(request.id))
      await this.deleteProjectFormField(request.id)

    const data = this.fieldTypesObject[request.fieldType]
    if (data.childRequire)
      await Promise.all(request.children.map((value) => this.deleteProjectFormFieldData(value)))
  }

  private async deleteProjectFormField(id: number) {
    const ids = await this.projectFormFieldsRepository.getProjectFormFieldIds({ parentId: id })
    await this.projectFormFieldsRepository.deleteProjectFormField({ id: [...ids, id] })
  }

  private async deleteFormFieldChildren(id: number) {
    const ids = await this.projectFormFieldsRepository.getProjectFormFieldIds({ parentId: id })
    await this.projectFormFieldsRepository.deleteProjectFormField({ id: [...ids] })
  }

  private async insertProjectFormField(request: CreateProjectFormFieldRequest[], options: ProjectFormFieldRequest) {
    await Promise.all(request.map((value) => this.insertProjectFormSingleField(value, options)))
  }

  private updateObject(data: FormFieldTypes, request: any, options: ProjectFormFieldRequest): { [key: string]: any } {
    const { projectFormId, parentId } = options
    const object = {
      fieldType: data.fieldName,
      childRequire: data.childRequire,
      title: request.title,
      projectFormId,
      sequence: request.sequence

    } as { [key: string]: any }
    const optionArray: string[] = ['defaultValue', 'validatePattern', 'counter',
      'staticValue', 'maxLength', 'minLength', 'maxValue', 'minValue', 'required', 'visible']

    for (const optional of optionArray)
      if (Object.hasOwnProperty.call(request, optional))
        object[optional] = request[optional]

    if (!isNil(parentId))
      object['parentId'] = parentId

    // if (object.fieldType !== 'subForm' && !isNil(object.repeatCount))
    //   delete object.repeatCount

    if (object.fieldType === 'subForm')
      object['repeatCount'] = 1

    return object
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
