import { isNil } from 'lodash'
import { Order } from 'sequelize/types'

/**
 * pagination
 *
 * @export
 * @param {Filter<any>} filter
 * @returns {Filter<any>}
 */
export function paginate (filter: any = {}): { limit: number; offset: number; order?: Order } {
  const limit = !isNil(filter.limit) ? Number(filter.limit) : 10
  const offset = !isNil(filter.skip) ? Number(filter.skip) : 0
  if (!isNil(filter.sortBy) && !isNil(filter.orderBy))
    return { limit, offset, order: [[filter.sortBy, filter.orderBy]] }

  return { limit, offset }
}

/**
 * pagination
 *
 * @export
 * @param {Filter<any>} filter
 * @returns {Filter<any>}
 */
export function getPaginateData<T> (filter: { limit: number; offset: number }, data: T[]): {count: number; data: T[]} {
  const count = data.length < filter.limit ? filter.offset + data.length : filter.offset + filter.limit + 1
  return { count, data }
}
