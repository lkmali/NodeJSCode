CREATE DEFINER=`red_fort`@`localhost` PROCEDURE `getUserForm`(in userId varchar(500), in taskId int,projectFormId int)
BEGIN
select r.roleId, r.name,a.actionName as permission,ro.remoteObjectId as resourceObjectId,
 rc.resourceClassName as resourceType from Roles r INNER JOIN RoleToOrganizations
 rto ON r.roleId = rto.roleId
 INNER JOIN RolePermissions rp ON rto.roleOrgId = rp.roleOrgId
INNER JOIN  Permissions p on p.permissionId = rp.permissionId INNER JOIN  Actions a on
 a.actionId = p.ActionActionId INNER JOIN  ResourceObjects ro on
ro.resourceObjectId = p.ResourceObjectResourceObjectId INNER JOIN
 ResourceClasses rc on rc.resourceClassId = p.ResourceClassResourceClassId
where rto.roleId = role_Id and rto.orgId = ord_Id;
END//
CREATE DEFINER=`red_fort`@`localhost` PROCEDURE `getUserRoleByRoleName`(in role_name varchar(500), in org_id int)
BEGIN
select r.roleId, r.name,a.actionName as permission,ro.remoteObjectId as resourceObjectId,
 rc.resourceClassName as resourceType from Roles r INNER JOIN RoleToOrganizations
 rto ON r.roleId = rto.roleId
 INNER JOIN RolePermissions rp ON rto.roleOrgId = rp.roleOrgId
INNER JOIN  Permissions p on p.permissionId = rp.permissionId INNER JOIN  Actions a on
 a.actionId = p.ActionActionId INNER JOIN  ResourceObjects ro on
ro.resourceObjectId = p.ResourceObjectResourceObjectId INNER JOIN
 ResourceClasses rc on rc.resourceClassId = p.ResourceClassResourceClassId
where r.name = role_name and rto.orgId = org_id;
END//
CREATE DEFINER=`red_fort`@`localhost` PROCEDURE `getUserRoleByUserId`(in user_Id int)
BEGIN
select r.roleId, r.name,a.actionName as permission,ro.remoteObjectId as resourceObjectId,
 rc.resourceClassName as resourceType from UserRoles ur,Roles r  INNER JOIN RoleToOrganizations
 rto ON r.roleId = rto.roleId
 INNER JOIN RolePermissions rp ON rto.roleOrgId = rp.roleOrgId
INNER JOIN  Permissions p on p.permissionId = rp.permissionId INNER JOIN  Actions a on
 a.actionId = p.ActionActionId INNER JOIN  ResourceObjects ro on
ro.resourceObjectId = p.ResourceObjectResourceObjectId INNER JOIN
 ResourceClasses rc on rc.resourceClassId = p.ResourceClassResourceClassId
where ur.userId = user_Id && ur.roleOrgId = rto.roleOrgId;
END//
