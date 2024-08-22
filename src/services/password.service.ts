import { compare, genSalt, hash } from 'bcryptjs'
import { isEmpty, isNil } from 'lodash'
import { env } from '../config'

export class PasswordService {
  async hashPassword (password: string, fixedSalt?: string): Promise<string> {
    const randomSalt = isNil(fixedSalt) || isEmpty(fixedSalt)
    if (!randomSalt && String(fixedSalt).length < 6) throw new Error('Illegal salt length: 6 != 16')
    const salt = randomSalt ? await genSalt(env.PASSWORD_ROUNDS) : this.genSaltFixed(String(fixedSalt), env.PASSWORD_ROUNDS)
    return hash(password, salt)
  }

  async comparePassword (providedPass: string, storedPass: string): Promise<boolean> {
    if (isNil(providedPass) || isNil(storedPass)) return Promise.resolve(false)
    const passwordIsMatched = await compare(providedPass, storedPass)
    return passwordIsMatched
  }

  genSaltFixed (value: string, rounds = 10): string {
    if (rounds < 4) rounds = 4
    else if (rounds > 31) rounds = 31
    const salt = []
    salt.push('$2a$')
    if (rounds < 10) salt.push('0')
    salt.push(rounds.toString())
    salt.push('$')
    salt.push(Buffer.from(value).toString('base64'))
    return salt.join('')
  }
}
