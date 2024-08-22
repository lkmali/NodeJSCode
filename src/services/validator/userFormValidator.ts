/* eslint-disable no-console */
import { gte, isNil, keyBy, lte } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { S3KeysRepository, UserFormFieldDataRepository } from '../../database/repository'
import { FieldDataType, GeoLocation, Point, ProjectFormFields, UploadFile, UserFormFieldData, UserFormValidatorRequest, ValidateFileDataRequest, ValidateUserFormFieldData } from '../../typings'
import { badRequest, isValidType, notInOperator } from '../../utils'

export class UserFormValidatorService {
  private readonly s3KeysRepository: S3KeysRepository
  private readonly userFormFieldDataRepository: UserFormFieldDataRepository
  constructor() {
    this.s3KeysRepository = new S3KeysRepository()
    this.userFormFieldDataRepository = new UserFormFieldDataRepository()
  }

  validateUserFormFieldData(): { [key: string]: Function } {
    return {
      subForm: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { parentData = { repeatCount: 1 }, value, childValue, userId } = request
        const { repeatCount = 1 } = parentData

        if (['subForm', 'group'].indexOf(childValue.fieldType) >= 0)
          throw badRequest('invalid field value')

        if (!(isValidType(value.counter, 'number') && (value.counter ?? 0) <= repeatCount))
          throw badRequest(`counter should be eq or less then ${repeatCount} but your counter is ${value.counter ?? ''}`)

        const result = await this.validateUserFormFieldData()[childValue.fieldType]({ value, childValue, userId })
        return result.map((v: ValidateUserFormFieldData) => ({ ...v, counter: Number(value.counter) }))
      },
      group: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue, userId } = request
        if (['subForm', 'group'].indexOf(childValue.fieldType) >= 0)
          throw badRequest('invalid field value')
        const result = await this.validateUserFormFieldData()[childValue.fieldType]({ value, childValue, userId })
        return result
      },
      select: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }
        const childrenData = keyBy(childValue.children, 'title')

        if (!Object.hasOwnProperty.call(childrenData, data))
          throw badRequest('value should from option')

        return Promise.resolve([{
          fieldType: 'select',
          sequence: '1',
          valueType: 'string',
          value: data,
          valueName: childrenData[data].id.toString(),
          projectFormFieldId: childValue.id
        }])
      },
      range: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request

        const { values } = value as { values: string[] }
        if (!isValidType(values, 'array'))
          throw badRequest(`${childValue.title} should be array`)

        const minValue = values[0]
        const maxValue = values[1]

        if ((!isValidType(maxValue, 'number') || !isValidType(minValue, 'number')) && maxValue < minValue)
          throw badRequest('maxValue or minValue is require or maxValue should be greater or equal then max value')

        if (!this.isValidMaxAndMinValue(childValue.maxValue, Number(maxValue), lte) ||
          !this.isValidMaxAndMinValue(childValue.minLength, Number(minValue), gte))
          throw badRequest(`maxValue should be less than ${childValue.maxValue ?? 0}
          or minValue should be greater than ${childValue.minValue ?? 0} `)

        return Promise.resolve([{
          sequence: '1',
          fieldType: 'range',
          valueType: 'number',
          value: maxValue.toString(),
          valueName: 'maxValue',
          projectFormFieldId: childValue.id
        },
        {
          valueType: 'number',
          fieldType: 'range',
          value: minValue.toString(),
          sequence: '2',
          valueName: 'minValue',
          projectFormFieldId: childValue.id
        }])
      },
      multiSelect: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { values } = value as { values: string[] }
        if (!isValidType(values, 'array'))
          throw badRequest(`${childValue.title} should be array`)

        const result = this.getMultiSelectData(values, childValue.id, childValue.children)
        return Promise.resolve(result)
      },
      selectOption: async (): Promise<ValidateUserFormFieldData[]> => Promise.resolve([]),
      geoPoint: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { points } = value
        if (!(isValidType(points, 'array') && points.length > 0))
          throw badRequest('points should be array')

        const { latitude, longitude } = points[0]

        if ((!isValidType(latitude, 'string') || !isValidType(longitude, 'string')))
          throw badRequest(`${childValue.title} should be valid point`)

        return Promise.resolve([{
          sequence: '1',
          fieldType: 'geoPoint',
          valueType: 'point',
          value: 'coordinates',
          point: { type: 'Point', coordinates: [latitude, longitude] },
          valueName: 'point',
          projectFormFieldId: childValue.id
        }])
      },

      geoTrace: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { points } = value
        if (!(isValidType(points, 'array') && points.length > 0))
          throw badRequest(`${childValue.title} should be valid point`)
        const coordinates = this.getGeoTraceData(points)
        const point: Point = { type: 'MultiPoint', coordinates }

        return Promise.resolve([{
          fieldType: 'geoTrace',
          sequence: '1',
          valueType: 'point',
          value: 'points',
          point,
          valueName: 'points',
          projectFormFieldId: childValue.id
        }])
      },
      geoShape: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { points } = value
        if (!(isValidType(points, 'array') && points.length > 0))
          throw badRequest(`${childValue.title} should be valid point`)

        const coordinates = this.getGeoTraceData(points)
        const point: Point = { type: 'MultiPoint', coordinates }

        return Promise.resolve([{
          fieldType: 'geoShape',
          sequence: '1',
          valueType: 'point',
          value: 'points',
          point,
          valueName: 'points',
          projectFormFieldId: childValue.id
        }])
      },
      date: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }

        return Promise.resolve([{
          valueType: 'date',
          fieldType: 'date',
          sequence: '1',
          value: data.toString(),
          valueName: 'date',
          projectFormFieldId: childValue.id
        }])
      },
      dateTime: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }

        return Promise.resolve([{
          fieldType: 'dateTime',
          valueType: 'dateTime',
          sequence: '1',
          value: data.toString(),
          valueName: 'dateTime',
          projectFormFieldId: childValue.id
        }])
      },
      time: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }

        return Promise.resolve([{
          fieldType: 'time',
          sequence: '1',
          valueType: 'time',
          value: data.toString(),
          valueName: 'dateTime',
          projectFormFieldId: childValue.id
        }])
      },
      decimal: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }
        if (!isValidType(data, 'number'))
          throw badRequest(`${childValue.title} should be decimal type`)

        return Promise.resolve([{
          fieldType: 'decimal',
          sequence: '1',
          valueType: 'number',
          value: data,
          valueName: 'decimal',
          projectFormFieldId: childValue.id
        }])
      },
      integer: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }
        if (!isValidType(data, 'number'))
          throw badRequest(`${childValue.title} should be integer type`)

        return Promise.resolve([{
          fieldType: 'integer',
          sequence: '1',
          valueType: 'number',
          value: data,
          valueName: 'integer',
          projectFormFieldId: childValue.id
        }])
      },
      acknowledge: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }

        if (['Yes', 'No'].indexOf(data) < 0)
          throw badRequest(`${childValue.title} should be Yes or No`)

        return Promise.resolve([{
          fieldType: 'acknowledge',
          sequence: '1',
          value: data,
          valueType: 'string',
          valueName: 'acknowledge',
          projectFormFieldId: childValue.id
        }])
      },
      rank: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { values } = value as { values: string[] }
        if (!isValidType(values, 'array'))
          throw badRequest(`${childValue.title} should be array`)

        const result = this.getRankSelectData(values, childValue.id, childValue.children)
        return Promise.resolve(result)
      },
      // chart: (request: UserFormValidatorRequest): UserFormFieldData => {
      //   const { parentData = { repeatCount: 1 }, value, childValue } = request
      //   const { repeatCount = 1 } = parentData
      //   if ((!isNaN(value.counter) && repeatCount < value.counter))
      //     throw badRequest('invalid counter')

      //   return this.validateUserFormFieldData()[childValue.fieldType]({ value, childValue })
      // },
      text: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }
        if (!isValidType(data, 'string'))
          throw badRequest(`${childValue.title}should not be null`)

        return Promise.resolve([{
          fieldType: 'text',
          sequence: '1',
          valueType: 'string',
          value: data,
          valueName: 'text',
          projectFormFieldId: childValue.id
        }])
      },
      note: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }

        if (!isValidType(data, 'string'))
          throw badRequest(`${childValue.title}should not be null`)

        return Promise.resolve([{
          fieldType: 'note',
          valueType: 'string',
          sequence: '1',
          value: data,
          valueName: 'note',
          projectFormFieldId: childValue.id
        }])
      },
      image: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value
        const input = !isNil(files) ? files : [{ value: data, title: 'image' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid image`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'image')
      },
      audio: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'audio' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid audio`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'audio')
      },
      video: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'video' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid video`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'video')
      },
      pdf: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'pdf' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid pdf`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'pdf')
      },
      csv: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'csv' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid csv`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'csv')
      },
      xlsx: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'xlsx' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid xlsx`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'xlsx')
      },
      word: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'word' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid word`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'word')
      },
      ppt: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'ppt' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid ppt`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'ppt')
      },
      kml: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { files, value: data } = value

        const input = !isNil(files) ? files : [{ value: data, title: 'kml' }] as Array<UploadFile>
        if (!(isValidType(input, 'array') && input.length > 0))
          throw badRequest(`${childValue.title} should be valid kml`)

        return this.validateMultiFileType({ ...request, value: { ...value, files: input } }, 'kml')
      },
      barcode: async (request: UserFormValidatorRequest): Promise<ValidateUserFormFieldData[]> => {
        const { value, childValue } = request
        const { value: data } = value as { value: string }

        if (!isValidType(data, 'string'))
          throw badRequest(`${childValue.title}should not be null`)

        return Promise.resolve([{
          fieldType: 'barcode',
          valueType: 'string',
          sequence: '1',
          value: data,
          valueName: 'barcode',
          projectFormFieldId: childValue.id
        }])
      }
    }
  }

  deleteUnUsedData(data: ValidateUserFormFieldData, userId: string) {
    if (['multiSelect'].indexOf(data.fieldType) >= 0)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.deleteMultiSelectExtraData(data.values ?? [], userId, data.projectFormFieldId)
    else if (env.supportFileType.indexOf(data.fieldType) >= 0)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.s3KeysRepository.removeKeys(data.s3Id ?? '')
  }

  async validateMultiFileType(request: UserFormValidatorRequest, valueType: FieldDataType): Promise<ValidateUserFormFieldData[]> {
    const outPut = []
    const { value, childValue, userId } = request
    const { counter, files } = value

    for (let index = 0; index < files.length; index++) {
      const data = files[index]
      const result = await this.validateFileData({
        counter,
        userId,
        projectFormFieldId: childValue.id,
        type: childValue.title,
        value: data.value
      }, {
        userId,
        sequence: (index + 1).toString(),
        valueType: valueType,
        valueName: data.title ?? valueType,
        projectFormFieldId: childValue.id
      })
      if (!isNil(result))
        outPut.push({
          fieldType: valueType,
          sequence: (index + 1).toString(),
          value: result.value,
          s3Id: result.s3Id,
          valueType: valueType,
          valueName: data.title ?? valueType,
          projectFormFieldId: childValue.id
        })
    }

    console.log('backend Prepare save files', JSON.stringify(outPut))

    return outPut as ValidateUserFormFieldData[]
  }

  async validateFileData(data: ValidateFileDataRequest,
    query: WhereOptions<UserFormFieldData>): Promise<{ value: string; s3Id: string } | null> {
    const { value, userId, projectFormFieldId, counter, type } = data

    const keyQuery = {
      userId,
      id: value,
      projectFormFieldId
    } as any
    if (!isNil(counter))
      keyQuery['counter'] = counter

    const s3KeysData = await this.s3KeysRepository.getKey(keyQuery)
    if (isNil(s3KeysData)) {
      const result = await this.userFormFieldDataRepository.getSingleUserFormFieldData(query)
      if (isNil(result))
        throw badRequest('invalid value for ' + type)

      return null
    }

    return { value: s3KeysData.s3Keys, s3Id: s3KeysData.id }
  }

  isValidValue(ans: string, children: ProjectFormFields[]): boolean {
    let flag = false
    for (const value of children)
      if (value.title === ans) {
        flag = true
        break
      }

    return flag
  }

  getMultiSelectData(ans: string[],
    projectFormFieldId: number, children: ProjectFormFields[]): ValidateUserFormFieldData[] {
    let error = ''
    const values = []
    const childrenData = keyBy(children, 'title')
    for (let index = 0; index < ans.length; index++) {
      const value = ans[index]
      if (!Object.hasOwnProperty.call(childrenData, value.toString())) {
        error = `${value} not in option `
        break
      }
      values.push({
        fieldType: 'multiSelect',
        sequence: (index + 1).toString(),
        value: value.toString(),
        values: ans,
        valueType: 'string',
        valueName: childrenData[value].id.toString(),
        projectFormFieldId
      })
    }
    if (error.length > 0)
      throw badRequest(error)

    return values as ValidateUserFormFieldData[]
  }

  getRankSelectData(ans: string[],
    projectFormFieldId: number, children: ProjectFormFields[]): ValidateUserFormFieldData[] {
    let error = ''
    const values = []
    const childrenData = keyBy(children, 'title')
    for (let index = 0; index < children.length; index++) {
      const value = ans[index]
      if (!Object.hasOwnProperty.call(childrenData, value.toString())) {
        error = `${value} not in rank `
        break
      }
      values.push({
        fieldType: 'rank',
        sequence: (index + 1).toString(),
        value: value.toString(),
        values: ans,
        valueType: 'string',
        valueName: childrenData[value].id.toString(),
        projectFormFieldId
      })
    }

    if (error.length > 0)
      throw badRequest(error)

    return values as ValidateUserFormFieldData[]
  }

  async deleteMultiSelectExtraData(values: string[], userId: string,
    projectFormFieldId: number): Promise<void> {
    const ids = await this.userFormFieldDataRepository.getUserFormFieldIds({
      value: { [notInOperator]: values },
      userId,
      projectFormFieldId
    })
    await this.userFormFieldDataRepository.deleteUserFormField({ id: ids })
  }

  getGeoTraceData(value: GeoLocation[]): Array<Array<string>> {
    let error = ''
    const coordinates = []

    for (const coordinate of value) {
      const { latitude, longitude } = coordinate
      if ((!isValidType(latitude, 'string') || !isValidType(longitude, 'string'))) {
        error = 'longitude or longitude is require for all value'
        break
      }
      coordinates.push([latitude, longitude])
    }

    if (error.length > 0)
      throw badRequest(error)

    return coordinates
  }

  isValidMaxAndMinValue(dbValue: number | undefined, value: number, lodashMethod: any): boolean {
    if (isNil(dbValue))
      return true

    return lodashMethod(value, dbValue)
  }
}
