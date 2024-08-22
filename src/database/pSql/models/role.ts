import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface RoleAttributes {
  id: number
  name: string
  description: string
  isDefaultAdmin: boolean
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<RoleAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    description: { type: Sequelize.STRING, allowNull: true },
    isDefaultAdmin: { type: Sequelize.BOOLEAN, defaultValue: false }

  }
  // const Roles = sequelize.define<UserInstance, UserAttributes>('Roles', attributes)
  const Roles = sequelize.define('Roles', attributes)
  // @ts-ignore
  Roles.associate = function (models: DBModels) {
    Roles.belongsToMany(models.Users, { through: models.UserRoles, foreignKey: 'roleId' })
  }

  return Roles
}
