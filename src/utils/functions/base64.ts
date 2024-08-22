/**
 * convert from utf-8 to base64
 *
 * @export
 * @param {string} value
 * @returns {string}
 */
export function toBase64 (value: string): string {
  return Buffer.from(value, 'utf-8').toString('base64')
}

/**
 * convert from base64 to utf-8
 *
 * @export
 * @param {string} value
 * @returns {string}
 */
export function fromBase64 (value: string): string {
  return Buffer.from(value, 'base64').toString('utf-8')
}
