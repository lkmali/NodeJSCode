import { send } from '../provider'
import { PermissionService } from '../services/permission/permission'
import { ControllersRequest } from '../typings'

function getPermission({ userProfile }: ControllersRequest) {
  return PermissionService.Instance.getPermission(userProfile.roles[0])
}

module.exports = {
  getPermission: send(getPermission, { auth: 'guestJwtAuth', async: false })
}
