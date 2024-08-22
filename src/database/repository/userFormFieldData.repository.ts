
import { isNil } from 'lodash'
import { WhereOptions } from 'sequelize/types'

import { Sequelize } from 'sequelize'
import { NearByProject, UserFormFieldData } from '../../typings'
import { andOperator, jsonParse, jsonStringify, lteOperator } from '../../utils'
import { DatabaseInitializer } from '../DatabaseInitializer'

export class UserFormFieldDataRepository {
  async saveUserFormFieldData(data: Omit<UserFormFieldData, 'id'>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserFormFieldData.create(data)
  }

  async upsertFormFieldDataData(where: WhereOptions<UserFormFieldData>,
    data: Omit<UserFormFieldData, 'id'>): Promise<UserFormFieldData> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.UserFormFieldData.findOne({
      where
    })
    isNil(result) ? await this.saveUserFormFieldData(data) : await this.updateFormFieldData(result.id, data)
    return result
  }

  async updateFormFieldData(id: number, data: Omit<UserFormFieldData, 'id'>): Promise<any> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserFormFieldData.update(data, { where: { id } })
  }

  async getUserFormFieldData(query: WhereOptions<UserFormFieldData>): Promise<UserFormFieldData[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.UserFormFieldData.findAll({
      where: query
    })
    return jsonParse(jsonStringify(result))
  }

  async getSingleUserFormFieldData(query: WhereOptions<UserFormFieldData>): Promise<UserFormFieldData> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserFormFieldData.findOne({
      where: query
    })
  }

  async getUserFormFieldIds(query: WhereOptions<UserFormFieldData>): Promise<number[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const result = await dbInstance.UserFormFieldData.findAll({
      attributes: ['id'],
      where: query
    })
    return result.map((value: UserFormFieldData) => value.id)
  }

  async deleteUserFormField(query: WhereOptions<UserFormFieldData>) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    return dbInstance.UserFormFieldData.destroy({
      where: query
    })
  }

  async getNearByCoordinateByQuery({ userId, latitude, longitude, maxDistance }: NearByProject): Promise<UserFormFieldData[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()

    //     const query = `
    // SELECT
    //     "id",  ST_DistanceSphere(ST_MakePoint(23.1012736666859, 72.58705275549113), "point") AS distance
    // FROM
    //     "UserFormFieldData"
    // WHERE
    //     ST_DistanceSphere(ST_MakePoint(23.1012736666859, 72.58705275549113), "point") < 5000;
    // `
    const location = Sequelize.fn('ST_MakePoint', parseFloat(latitude), parseFloat(longitude))
    const distance = Sequelize.fn(
      'ST_DistanceSphere',
      location,
      Sequelize.literal('"UserFormFieldData"."point"::geometry')
    ) as any
    const query = Sequelize.where(distance, { [lteOperator]: maxDistance * 1000 })
    const result = await dbInstance.UserFormFieldData.findAll({
      attributes: ['id', 'userFromId', 'point', 'userId', 'projectFormId', [distance, 'distance']],
      where: { ...andOperator([query]), userId },
      include: [
        {
          model: dbInstance.UserProjectForm,
          required: true,
          attributes: ['id', 'title', 'status']
        },
        {
          model: dbInstance.ProjectForms,
          required: true,
          where: {},
          attributes: ['id', 'name', 'description']
        }
      ]
    })
    return result
    // return data
  }

  async getNearByCoordinate({ userId, latitude, longitude, maxDistance }: NearByProject): Promise<UserFormFieldData[]> {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const location = Sequelize.literal(`ST_GeomFromText('POINT(${parseFloat(latitude)} ${parseFloat(longitude)})')`)
    const distance = Sequelize.fn(
      'ST_DistanceSphere',
      Sequelize.literal('"UserFormFieldData"."point"::geometry'),
      location
    ) as any

    const query = Sequelize.where(distance, { [lteOperator]: maxDistance * 1000 })

    const result = await dbInstance.UserFormFieldData.findAll({
      attributes: ['id', 'userFromId', 'point', 'userId', 'projectFormId', [distance, 'distance']],
      where: { ...andOperator([query]), userId },
      include: [
        {
          model: dbInstance.UserProjectForm,
          required: true,
          attributes: ['id', 'title', 'status']
        },
        {
          model: dbInstance.ProjectForms,
          required: true,
          where: {},
          attributes: ['id', 'name', 'description']
        }
      ]
    })
    return result
  }
}

// 'SELECT * FROM projects WHERE status =:status'
