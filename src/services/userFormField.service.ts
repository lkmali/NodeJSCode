import { Request, Response } from 'express'
import { isNil, omit } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../config'
import { ProjectFormFieldsRepository, S3KeysRepository, UserFormFieldDataRepository, UserProjectFormRepository } from '../database/repository'
import { FormFieldUploadFileRequest, UserFormFieldData, UserFormFieldRequest, UserFormValidatorRequest, UserProjectFormDataValue, ValidateUserFormFieldData } from '../typings'
import { badRequest, formatData, getTimestampInSeconds, jsonParse, prepareData, unauthorized } from '../utils'
import { S3Service } from './aws'
import { EncryptionService } from './encryption.service'
import { UserFormValidatorService } from './validator/userFormValidator'
export class UserFormFieldService {
  private static instance: UserFormFieldService

  private readonly projectFormFieldsRepository: ProjectFormFieldsRepository
  private readonly userFormValidatorService: UserFormValidatorService
  private readonly userProjectFormRepository: UserProjectFormRepository
  private readonly userFormFieldDataRepository: UserFormFieldDataRepository
  private readonly s3KeysRepository: S3KeysRepository
  constructor() {
    this.s3KeysRepository = new S3KeysRepository()

    this.projectFormFieldsRepository = new ProjectFormFieldsRepository()
    this.userFormValidatorService = new UserFormValidatorService()
    this.userProjectFormRepository = new UserProjectFormRepository()
    this.userFormFieldDataRepository = new UserFormFieldDataRepository()
  }

  async getUserFormFieldData(userId: string, userFromId: number) {
    return this.prepareUserFormData(await this.userFormFieldDataRepository.getUserFormFieldData({ userFromId, userId }))
  }

  async getUserFormFieldDataID(userId: string, userFromId: number) {
    const userProjectForm = await this.userProjectFormRepository.getUserProjectForm({
      userId,
      id: userFromId
    })

    if (isNil(userProjectForm))
      throw badRequest('invalid userFromId')

    const result = prepareData(await this.projectFormFieldsRepository.getProjectFormFieldInformationWithUserFormValue(
      { projectFormId: userProjectForm.projectFormId }, { userId, userFromId }
    ))
    return result
  }

  async getUserFormFieldDataByAdmin(userFromId: number) {
    const userProjectForm = await this.userProjectFormRepository.getSingleProjectFormDataByAdmin({
      id: userFromId
    })

    if (isNil(userProjectForm))
      throw badRequest('invalid userFromId')

    const result = prepareData(await this.projectFormFieldsRepository.getProjectFormFieldInformationWithUserFormValue(
      { projectFormId: userProjectForm.projectFormId }, { userFromId }
    ))
    return { ...userProjectForm, fields: result }
  }

  async getFileSignUrl(data: FormFieldUploadFileRequest): Promise<{ url: string; id: string }> {
    const key = `${data.userId}${uuidv4()}${data.fileExtension}`
    const url = await S3Service.Instance.getImageUploadSignInUrl(`${env.projectFileFolder}/${key}`, data.mimeType)
    const s3Result = await this.s3KeysRepository.saveKey({
      userId: data.userId,
      projectFormFieldId: Number(data.projectFormFieldId),
      s3Keys: key,
      counter: data.counter ?? 1
    })
    return { id: s3Result.id, url }
  }

  async getViewFileUrl(key: string): Promise<string> {
    return S3Service.Instance.getImageDownloadSignInUrl(`${env.projectFileFolder}/${key}`)
  }

  async downloadFileByPublic(key: string, _request: Request, response: Response) {
    const data = jsonParse(EncryptionService.Instance.decrypt(key)) ?? {}
    if (!(!isNil(data.key) && !isNil(data.expire) && getTimestampInSeconds() < data.expire))
      throw unauthorized('invalidLink')

    await S3Service.Instance.getFIleData(`${env.projectFileFolder}/${data.key as string}`, response)
  }

  async updateUserFormData(request: UserFormFieldRequest[], userFromId: number, userId: string) {
    const userProjectForm = await this.userProjectFormRepository.getUserProjectForm({
      userId,
      id: userFromId,
      status: 1
    })

    if (isNil(userProjectForm))
      throw badRequest('invalid userFromId')

    // for (const userRequest of request) {
    //   const data = await this.validateUserFormFiled({ ...userRequest, userId }, userProjectForm.projectFormId)
    //   for (const form of data)
    //     userProjectFormFields.push(form)
    // }
    const result = await Promise.all(request.map(userRequest => this.validateUserFormFiled({ ...userRequest, userId }
      , userProjectForm.projectFormId)))

    const userProjectFormFields = [].concat.apply([] as any, result as never)

    await Promise.all(userProjectFormFields.map(data => this.saveUserFormFieldData(data, {
      userId,
      projectFormId: userProjectForm.projectFormId,
      userFromId: userProjectForm.id
    })))

    return userProjectForm
  }

  async validateUserFormFiled(request: UserFormFieldRequest,
    projectFormId: number): Promise<ValidateUserFormFieldData[]> {
    const projectFormField = await this.projectFormFieldsRepository.getProjectFormFieldAndParentData(projectFormId, request.formFieldId)

    if (isNil(projectFormField))
      throw badRequest(`not found data for  ${projectFormId}`)

    const object: UserFormValidatorRequest = { childValue: projectFormField, value: request, userId: request.userId }
    if (!isNil(projectFormField.parent))
      object['parentData'] = projectFormField.parent
    return this.validateUserFormFieldData(object)
  }

  async saveUserFormFieldData(data: ValidateUserFormFieldData, request:
    { userId: string; projectFormId: number; userFromId: number }): Promise<void> {
    this.userFormValidatorService.deleteUnUsedData(data, request.userId)
    await this.userFormFieldDataRepository.upsertFormFieldDataData(this.getQuery(data, request), {
      ...omit(data, ['values', 's3Id', 'fieldType']),
      ...request,
      counter: isNil(data.counter) ? 1 : Number(data.counter)
    })
  }

  private async validateUserFormFieldData(object: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> {
    let fieldType: string = object.childValue.fieldType

    if (!isNil(object.parentData) && ['subForm', 'group'].indexOf(object.parentData.fieldType) >= 0)
      fieldType = object.parentData.fieldType

    if (!isNil(object.parentData) && ['subForm'].indexOf(object.parentData.fieldType) >= 0)
      object.value['counter'] = 1
    else
      delete object.value.counter

    if (!Object.prototype.hasOwnProperty.call(this.userFormValidatorService.validateUserFormFieldData(), fieldType))
      throw badRequest(`not supporting ${fieldType}`)

    const validateUserFormFieldData = this.userFormValidatorService.validateUserFormFieldData()[fieldType]

    const result = await validateUserFormFieldData(object)
    return result
  }

  private getQuery(data: ValidateUserFormFieldData,
    request: { userId: string; projectFormId: number; userFromId: number }) {
    const query: WhereOptions<UserFormFieldData> = {
      userId: request.userId,
      counter: isNil(data.counter) ? 1 : Number(data.counter),
      projectFormFieldId: data.projectFormFieldId,
      userFromId: request.userFromId
    }
    if (env.supportFileType.indexOf(data.fieldType) >= 0)
      query['valueName'] = data.valueName
    else
      query['sequence'] = data.sequence

    return query
  }

  private prepareUserFormData(request: UserFormFieldData[]): any {
    const object: {
      [key: number]: { value: UserProjectFormDataValue[] }
    } = {}

    for (const fields of request) {
      const data = formatData(fields as unknown as { [key: string]: string }) as unknown as UserFormFieldData

      const fieldId = data.projectFormFieldId
      object[fieldId] = Object.hasOwnProperty.call(object, fieldId) ? object[fieldId] : { value: [] }
      object[fieldId].value.push({
        value: data.value,
        valueType: data.valueType,
        valueName: data.valueType,
        sequence: data.sequence,
        point: data.point
      })
    }

    return object
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
