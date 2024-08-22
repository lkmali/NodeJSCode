import { send } from '../provider'
import { RoleService } from '../services'
async function getAllRoles () {
  return RoleService.Instance.getAllRoles()
}

module.exports = {
  getAllRoles: send(getAllRoles, { auth: 'jwtAuth', roles: ['admin', 'superAdmin'] })
}
