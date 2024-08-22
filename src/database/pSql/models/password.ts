
import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
import { generatePassword } from '../../../utils'
interface PasswordAttributes {
  userId: string
  id: number
  password: string
    createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<PasswordAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false, defaultValue: generatePassword() },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }
  }
  // @ts-ignore
  const Password = sequelize.define('Password', attributes)

  // @ts-ignore
  Password.associate = function (models: DBModels) {
    Password.belongsTo(models.Users, { foreignKey: 'userId' })
  }

  return Password
}
