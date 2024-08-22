import Sequelize from 'sequelize'
import { Where } from 'sequelize/types/utils'
const Op = Sequelize.Op
export const inOperator = Sequelize.Op.in
export const notInOperator = Sequelize.Op.notIn
export const neOperator = Sequelize.Op.ne
export const orOperator = Sequelize.or
export const andOperator = Sequelize.and
export const ltOperator = Op.lt
export const lteOperator = Op.lte
export const gtOperator = Op.gt
export const gteOperator = Op.gte
/**
 * getUniqArray
 *
 * @export
 * @param {any[]} array
 * @returns
 */
export function getSearchQuery(search: string, fields: string[]): any {
  const query: Where[] = []

  for (const field of fields)
    query.push(Sequelize.where(
      Sequelize.fn('lower', Sequelize.col(field)),
      {
        [Op.iLike]: search
      }
    ))
  return {
    [Op.or]: query
  }
}
