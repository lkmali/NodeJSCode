import * as Sequelize from 'sequelize'
interface UserGroupAttributes {
  id: number
    createdBy: string
  updatedBy: string
    userId: string
    groupId: number
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserGroupAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    groupId: { type: Sequelize.UUID, allowNull: false }
  }
  const UserGroups = sequelize.define('UserGroups', attributes)

  return UserGroups
}
