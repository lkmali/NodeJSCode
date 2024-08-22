import { WhereOptions } from 'sequelize/types'
import { FormFieldTypes } from '../../typings'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class FormFieldTypeRepository {
  async saveFormField(data: Omit<FormFieldTypes, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.FormFieldTypes.create(data)
  }

  async getFormField(fieldName: string): Promise<FormFieldTypes> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.FormFieldTypes.findOne({ where: { fieldName } })
  }

  async updateFormFieldTypes(query: WhereOptions<FormFieldTypes>, data: Partial<FormFieldTypes>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.FormFieldTypes.update(data, { where: query })
  }

  async getAllFormFieldType(): Promise<FormFieldTypes[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.FormFieldTypes.findAll({
      where: {
        isActive: true,
        isDelete: false
      }
    })
  }
}
