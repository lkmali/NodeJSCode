import { createCipheriv, createDecipheriv } from 'crypto'
import { isNil } from 'lodash'
import { env } from '../config'
import { internalError } from '../utils'

export class EncryptionService {
  private static instance: EncryptionService
  encrypt(plainText: string) {
    const cipher = createCipheriv(env.ENCRYPTION_ALGORITHM, env.ENCRYPTION_KEY, this.toString(env.ENCRYPTION_IV).slice(0, 16))
    let encrypted = cipher.update(plainText)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return encrypted.toString('hex')
  }

  decrypt(cipherText: string, error?: any) {
    try {
      const encryptedText = Buffer.from(cipherText, 'hex')
      const decipher = createDecipheriv(env.ENCRYPTION_ALGORITHM, env.ENCRYPTION_KEY, this.toString(env.ENCRYPTION_IV).slice(0, 16))
      let decrypted = decipher.update(encryptedText)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return decrypted.toString()
    } catch (_error) {
      throw !isNil(error) ? error : internalError('something went wrong please ask admin to check it')
    }
  }

  toString(data: any) {
    return (data).toString('hex')
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
