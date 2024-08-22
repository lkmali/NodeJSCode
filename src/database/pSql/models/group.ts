import * as Sequelize from 'sequelize'

interface GroupAttributes {
 id: number
 name: string
 orgId: number
createdBy: string
description: string
updatedBy: string
isActive: boolean
isDelete: boolean
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<GroupAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
  }
  // const Groups = sequelize.define<UserInstance, UserAttributes>('Groups', attributes)
  const Groups = sequelize.define('Groups', attributes)
  // @ts-ignore
  Groups.associate = function (models: any) {
    Groups.belongsTo(models.Organizations, { foreignKey: 'orgId' })
    Groups.belongsTo(models.Users, { foreignKey: 'createdBy', as: 'createdByUser' })
    Groups.belongsTo(models.Users, { foreignKey: 'updatedBy', as: 'updatedByUser' })
    Groups.belongsToMany(models.Users, { through: models.UserGroups, foreignKey: 'groupId' })
  }

  return Groups
}
