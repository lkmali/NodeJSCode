
import { isNil } from 'lodash'
import { WhereOptions } from 'sequelize/types'
import { ProjectFormFields, UserFormFieldData } from '../../typings'
import { jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class ProjectFormFieldsRepository {
  async saveProjectFormFields(data: Omit<ProjectFormFields, 'id'>): Promise<ProjectFormFields> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectFormFields.create(data)
  }

  async updateProjectFormField(id: number, data: Omit<ProjectFormFields, 'id'>): Promise<ProjectFormFields> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectFormFields.update(data, { where: { id } })
  }

  async upsertData(data: Omit<ProjectFormFields, 'id'>, id?: number): Promise<{ id: number }> {
    if (!isNil(id)) {
      const result = await this.updateDataById(data, id)
      if (!result)
        return this.saveProjectFormFields(data)

      return { id }
    }

    return this.saveProjectFormFields(data)
  }

  async updateDataById(data: Omit<ProjectFormFields, 'id'>, id?: number): Promise<boolean> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    if (!isNil(id)) {
      const query = { id, fieldType: data.fieldType } as any
      if (!isNil(data.parentId))
        query['parentId'] = data.parentId

      const result = await dbInstance.ProjectFormFields.update(data, { where: query })
      return result.length > 0 && result[0] > 0
    }

    return false
  }

  async deleteProjectFormField(query: WhereOptions<ProjectFormFields>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectFormFields.destroy({
      where: query
    })
  }

  async getProjectFormFieldIds(query: WhereOptions<ProjectFormFields>): Promise<number[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.ProjectFormFields.findAll({
      attributes: ['id'],
      where: query
    })
    return result.map((value: ProjectFormFields) => value.id)
  }

  async getProjectFormFieldInformation(projectFormId: number): Promise<ProjectFormFields[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.ProjectFormFields.findAll({
      raw: true,
      where: { projectFormId },
      order: [
        ['sequence', 'ASC'],
        ['id', 'ASC']
      ]
    })
  }

  async getProjectFormFieldInformationWithUserFormValue(query: WhereOptions<ProjectFormFields>,
    userQuery: WhereOptions<UserFormFieldData>): Promise<ProjectFormFields[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.ProjectFormFields.findAll({
      where: query,
      attributes: { exclude: ['createdBy', 'updatedBy'] },
      include: [
        {
          model: dbInstance.UserFormFieldData,
          required: false,
          where: userQuery,
          attributes: ['sequence', 'id', 'value', 'valueType', 'valueName', 'counter', 'point'],
          as: 'fieldValue'
        }],
      order: [
        ['sequence', 'ASC'],
        ['id', 'ASC']
      ]
    })
    return jsonParse(jsonStringify(result))
  }

  async getProjectFormFieldAndParentData(projectFormId: number, id: number): Promise<ProjectFormFields> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.ProjectFormFields.findOne({
      where: { projectFormId, id },
      include: [
        {
          model: dbInstance.ProjectFormFields,
          required: false,
          as: 'parent'
        },
        {
          model: dbInstance.ProjectFormFields,
          required: false,
          as: 'children'
        }]
    })

    return jsonParse(jsonStringify(result))
  }
}
