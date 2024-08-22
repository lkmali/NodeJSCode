import { UserProfile } from '../typings'
import { unauthorized } from '../utils'

export class AuthorizationProvider {
 authorization = (roles: string[], userProfile: UserProfile) => {
   const userRoles = userProfile.roles
   let flag = false

   for (const role of userRoles)
     flag = flag || roles.indexOf(role) >= 0

   if (!flag)
     throw unauthorized('Access Denied')
 }
}
