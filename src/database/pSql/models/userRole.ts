import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface UserRoleAttributes {
 id: number
   createdBy: string
  updatedBy: string
  userId: string
  roleId: number
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserRoleAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    roleId: { type: Sequelize.INTEGER, allowNull: false }

  }
  const UserRoles = sequelize.define('UserRoles', attributes)
  // @ts-ignore
  UserRoles.associate = function (models: DBModels) {
    // UserRoles.belongsTo(models.Users, { foreignKey: 'userId' })
    UserRoles.belongsTo(models.Roles, { foreignKey: 'roleId' })
    UserRoles.belongsTo(models.Users, { foreignKey: 'userId' })
  }

  return UserRoles
}
