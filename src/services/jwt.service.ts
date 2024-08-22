
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken'
import { isNil, pick, set } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../config'
import { GuestAuth, JWTScopes, UserProfile } from '../typings'
import { unauthorized } from '../utils'

export class JWTService {
     private static instance: JWTService
     verifyToken (token: string, scopes: JWTScopes = ['auth']): Partial<UserProfile> {
       try {
         const audience = env?.JWT_AUDIENCE.split(/\s|,/)
         const options: VerifyOptions = { issuer: env.JWT_ISSUER, algorithms: [env.JWT_ALGO], audience }
         const { payload } = verify(token, env.NETWORK_WEBHOOK_SECRET, options) as {payload: UserProfile}
         const validScope = scopes.some(scope => payload?.scopes.includes(scope))
         if (!validScope) throw new Error('invalid jwt scope')
         const fields = ['userId', 'clientId', 'username', 'phone',
           'isVerified', 'email', 'roles', 'groups', 'organization']
         const response = pick(payload, fields)
         if (!isNil(payload.scopes) && payload.scopes.includes('intercom') === true) set(response, 'scope', 'intercom')
         return response
       } catch (error) {
         throw unauthorized('invalid login credentials')
       }
     }

     generateToken (userProfile: UserProfile | GuestAuth, scopes: JWTScopes = ['auth'], expiresIn?: number | string): string {
       const additionalUserData = set(userProfile, 'scopes', scopes)
       const payload = { id: userProfile.userId, ...additionalUserData }
       const audience = env?.JWT_AUDIENCE.split(/\s|,/)
       const signingOptions: SignOptions = {
         audience,
         expiresIn: expiresIn ?? env.JWT_EXPIRES_IN,
         issuer: env.JWT_ISSUER,
         algorithm: env.JWT_ALGO,
         subject: userProfile.userId ?? userProfile.email,
         jwtid: uuidv4()
       }
       const token = sign({ payload }, env.NETWORK_WEBHOOK_SECRET, signingOptions)
       return token
     }

     public static get Instance () {
       if (isNil(this.instance))
         this.instance = new this()

       return this.instance
     }
}
