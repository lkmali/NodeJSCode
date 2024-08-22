import createError from 'http-errors'

/**
 * BadRequest
 *
 * @export
 * @param {string} message
 * @returns {Error}
 */
export function badRequest (message: string): {statusCode: number; error: Error } {
  return { error: createError(400, message), statusCode: 400 }
}

/**
 * Unauthorized
 *
 * @export
 * @param {string} message
 * @returns {Error}
 */
export function unauthorized (message: string): {statusCode: number; error: Error } {
  return { error: createError(401, message), statusCode: 401 }
}

/**
 * internalError
 *
 * @export
 * @param {string} message
 * @returns {Error}
 */
export function internalError (message: string): {statusCode: number; error: Error } {
  return { error: createError(500, message), statusCode: 500 }
}

/**
 * custom error
 *
 * @export
 * @param {string} message
 * @returns {Error}
 */
export function customError (statusCode: number, message: string): {statusCode: number; error: Error } {
  return { error: createError(statusCode, message), statusCode: 500 }
}
