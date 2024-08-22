
import { IncludeOptions, WhereOptions } from 'sequelize/types'
import { env } from '../../config'
import { Filter, UserProjectForm, UserProjectFormFieldData } from '../../typings'
import { jsonParse, jsonStringify } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserProjectFormRepository {
  async saveUserProjectForm(data: Omit<UserProjectForm, 'id' | 'createdAt'>): Promise<UserProjectForm> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserProjectForm.create(data)
  }

  async getUserProjectForm(query: WhereOptions<UserProjectForm>): Promise<UserProjectForm> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserProjectForm.findOne({ where: query })
  }

  async updateUserProjectForm(query: WhereOptions<UserProjectForm>, data: Partial<UserProjectForm>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserProjectForm.update(data, { where: query })
  }

  async getUserAllProjectForm(filter: WhereOptions<UserProjectForm>, option: IncludeOptions = {}): Promise<UserProjectForm[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter
    option['include'] = [
      {
        model: dbInstance.ProjectForms,
        required: true,
        attributes: ['id', 'name']
      }]
    return dbInstance.UserProjectForm.findAll(option)
  }

  async getUserProjectsByAdmin(filter: Filter, option: IncludeOptions = {}): Promise<UserProjectForm[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = filter.userProjectForm
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Users,
        required: true,
        as: 'user',
        where: filter.users,
        attributes: ['email', 'username', 'userId']
      },
      {
        model: dbInstance.ProjectForms,
        required: true,
        where: filter.projectForms,
        attributes: ['id', 'name']
      }]
    return dbInstance.UserProjectForm.findAll(option)
  }

  async getSingleProjectFormDataByAdmin(query: WhereOptions<UserProjectForm>, option: IncludeOptions = {}): Promise<UserProjectForm> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['attributes'] = { exclude: env.sequelizeConfig.excludedDefaultAttributes }
    option['include'] = [
      {
        model: dbInstance.Users,
        required: false,
        as: 'user',
        attributes: ['email', 'username', 'userId']
      },
      {
        model: dbInstance.ProjectForms,
        required: true,
        attributes: ['id', 'name']
      }]
    const result = await dbInstance.UserProjectForm.findOne(option)
    return jsonParse(jsonStringify(result))
  }

  async getUserProjectFormFieldData(query: WhereOptions<UserProjectForm>,
    option: IncludeOptions = {}): Promise<UserProjectFormFieldData[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    option['where'] = query
    option['include'] = [
      {
        model: dbInstance.ProjectForms,
        required: false,
        include: [
          {
            model: dbInstance.ProjectFormFields,
            required: false,
            as: 'fields'
          }]
      },
      {
        model: dbInstance.UserFormFieldData,
        required: false,
        as: 'fieldsValue'
      }]
    const result = await dbInstance.UserProjectForm.findAll(option)

    return jsonParse(jsonStringify(result))
  }

  async getUserProjectFormIdByUserTaskId(userTaskIds: number[]): Promise<number[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    // eslint-disable-next-line max-len
    const sqlQuery = 'SELECT DISTINCT "UserProjectForm"."id" FROM "UserProjectForm" INNER JOIN "UserTasks" ON "UserProjectForm"."userId" = "UserTasks"."userId" AND "UserProjectForm"."taskId" = "UserTasks"."taskId" WHERE "UserTasks"."id" IN (:userTaskIds) '
    const result = await dbInstance.sequelize.query(sqlQuery, {
      replacements: { userTaskIds },
      type: 'SELECT'
    })
    return result.map((value: UserProjectForm) => value.id)
  }
}
