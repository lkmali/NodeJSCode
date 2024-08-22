import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface ActionAttributes {
  id: number
  actionName: string
  description: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ActionAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    actionName: { type: Sequelize.STRING, allowNull: false, unique: true },
    description: { type: Sequelize.STRING, defaultValue: null }
  }
  // const Actions = sequelize.define<UserInstance, UserAttributes>('Actions', attributes)
  const Actions = sequelize.define('Actions', attributes)
  // @ts-ignore
  Actions.associate = function (models: DBModels) {
    Actions.belongsToMany(models.UserGroups, { through: models.UserGroupPermissions, foreignKey: 'actionId' })
  }

  return Actions
}
