import { isEmpty, isNil } from 'lodash'
import { env } from '../../config'
import { Point, ProjectFormFields, UserFormFieldData, UserProjectFormFieldData, UserProjectFormFormat } from '../../typings'
import { getProjectFormStatus, getTimestampInSeconds } from '../../utils'
import { EncryptionService } from '../encryption.service'

export class UserProjectFormHelperService {
  private static instance: UserProjectFormHelperService

  formatUserProjectDataForXlxFile(fieldData: UserProjectFormFieldData[]): { [key: string]: UserProjectFormFormat } {
    const formData = {} as { [key: string]: UserProjectFormFormat }
    for (const data of fieldData) {
      const { ProjectForm, fieldsValue, status, title } = data
      const { fields } = ProjectForm
      if (!Object.hasOwnProperty.call(formData, ProjectForm.id.toString()))
        formData[ProjectForm.id.toString()] = {
          formName: `${ProjectForm.name}-${ProjectForm.id.toString()}`,
          formFields: this.getFieldObject(fields),
          data: [],
          maxCharByCell: {}
        }

      const { result, maxCharByCell } = this.getFieldsValueData(fieldsValue, formData[ProjectForm.id.toString()].formFields,
        formData[ProjectForm.id.toString()].maxCharByCell)
      if (!isEmpty(result))
        formData[ProjectForm.id.toString()].data.push({ taskName: title, status: getProjectFormStatus(status), ...result })

      formData[ProjectForm.id.toString()]['maxCharByCell'] = maxCharByCell
    }
    return formData
  }

  getFieldObject(fieldsValue: ProjectFormFields[]) {
    const data = {} as {
      [key: string]: { title: string; fieldType: string }
    }
    for (const value of fieldsValue)
      data[value.id.toString()] = {
        title: value.title,
        fieldType: value.fieldType
      }

    return data
  }

  getFieldsValueData(fieldsValue: UserFormFieldData[],
    fields: {
      [key: string]: { title: string; fieldType: string }
    }, maxCharByCell: { [key: string]: number }) {
    const result = {} as { [key: string]: any }

    for (const data of fieldsValue) {
      const field = fields[data.projectFormFieldId.toString()]
      const value = this.getFieldValueData(data, field)
      result[`${field.title}(${field.fieldType})`] = value

      const macChar = maxCharByCell[`${field.title}(${field.fieldType})`] ?? 0
      if (macChar < value.length)
        maxCharByCell[`${field.title}(${field.fieldType})`] = value.length
    }
    return { result, maxCharByCell }
  }

  getFieldValueData(fieldsValue: UserFormFieldData,
    field: { title: string; fieldType: string }) {
    if (!isNil(fieldsValue.value) && env.supportFileType.indexOf(field.fieldType) >= 0)
      return this.getSignInURlOfFileType(fieldsValue.value)

    else if (!isNil(fieldsValue.point))
      return this.getGeoPointValue(fieldsValue.point)

    else if (!isNil(fieldsValue.value)) return fieldsValue.value
    else return ''
  }

  getSignInURlOfFileType(key: string) {
    const time = new Date()
    time.setDate(time.getDate() + 90)

    const data = { key, expire: getTimestampInSeconds(time) }
    return `${env.SERVER_URL}/public/file/${EncryptionService.Instance.encrypt(JSON.stringify(data))}`
  }

  getGeoPointValue(point: Point) {
    return point.coordinates.toString()
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
