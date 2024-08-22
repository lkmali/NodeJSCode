import * as Sequelize from 'sequelize'
interface UserGroupPermissionAttributes {
  id: number
    createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserGroupPermissionAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const UserGroupPermissions = sequelize.define('UserGroupPermissions', attributes)

  return UserGroupPermissions
}
