import { isNil } from 'lodash'
import { send } from '../provider'
import { GroupService } from '../services'
import { ControllersRequest } from '../typings'
import { getUniqArray } from '../utils'

async function createGroup({ request, userProfile }: ControllersRequest) {
  const data = request.body
  return GroupService.Instance.createGroup({
    name: data.groupName,
    description: data.description,
    orgId: userProfile.organization.orgId,
    createdBy: userProfile.userId
  })
}

async function updateGroup({ request, userProfile }: ControllersRequest) {
  const data = request.body
  const groupId = Number(request.params.groupId)
  await GroupService.Instance.updateGroup({
    name: data.groupName,
    id: groupId,
    description: data.description,
    orgId: userProfile.organization.orgId,
    updatedBy: userProfile.userId
  })
}
async function activateInActiveGroup({ request, userProfile }: ControllersRequest) {
  const groupId = Number(request.params.groupId)
  const isActive = request.params.status === 'active'
  await GroupService.Instance.activateInActiveGroup(userProfile.organization.orgId, groupId, isActive, userProfile.userId)
}
async function getOrgGroups({ userProfile, request }: ControllersRequest) {
  const query = request.query as { [key: string]: string | boolean }
  query['sortBy'] = !isNil(query['sortBy']) ? query['sortBy'] : 'name'
  query['orderBy'] = !isNil(query['orderBy']) ? query['orderBy'] : 'DESC'
  return GroupService.Instance.getOrgGroups(userProfile.organization.orgId, query)
}

async function addUsersGroup({ request, userProfile }: ControllersRequest) {
  const data = request.body
  const groupId = Number(request.params.groupId)
  await GroupService.Instance.addUsersGroup({
    adminUserId: userProfile.userId,
    emails: getUniqArray(data),
    groupId,
    orgId: userProfile.organization.orgId
  })
}

async function getGroup({ userProfile, request }: ControllersRequest) {
  const groupId = Number(request.params.groupId)
  return GroupService.Instance.getGroup(userProfile.organization.orgId, groupId)
}

async function getGroupNames({ userProfile }: ControllersRequest) {
  return GroupService.Instance.getGroupNames(userProfile.organization.orgId)
}

async function removeGroupUsers({ request, userProfile }: ControllersRequest) {
  const data = request.body
  const groupId = Number(request.params.groupId)
  await GroupService.Instance.removeGroupUsers(groupId, userProfile.organization.orgId, getUniqArray(data))
}

async function getOrganizationGroupAndUser({ userProfile, request }: ControllersRequest) {
  const groupId = Number(request.params.groupId)
  return GroupService.Instance.getOrganizationGroupAndUser(userProfile.organization.orgId, groupId)
}
async function getOrganizationGroupAndProject({ userProfile, request }: ControllersRequest) {
  const groupId = Number(request.params.groupId)
  return GroupService.Instance.getOrganizationGroupAndProject(userProfile.organization.orgId, groupId)
}
async function getOrganizationGroupAndProjectFrom({ userProfile, request }: ControllersRequest) {
  const groupId = Number(request.params.groupId)
  return GroupService.Instance.getOrganizationGroupAndProjectFrom(userProfile.organization.orgId, groupId)
}

module.exports = {
  getGroup: send(getGroup, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getGroupNames: send(getGroupNames, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  createGroup: send(createGroup, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  activateInActiveGroup: send(activateInActiveGroup, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  updateGroup: send(updateGroup, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  removeGroupUsers: send(removeGroupUsers, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getOrgGroups: send(getOrgGroups, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  addUsersGroup: send(addUsersGroup, { auth: 'jwtAuth', code: 204, roles: ['superAdmin', 'admin'] }),
  getOrganizationGroupAndUser: send(getOrganizationGroupAndUser, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getOrganizationGroupAndProject: send(getOrganizationGroupAndProject, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] }),
  getOrganizationGroupAndProjectFrom: send(getOrganizationGroupAndProjectFrom, { auth: 'jwtAuth', roles: ['superAdmin', 'admin'] })
}
