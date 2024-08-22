import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface UserSessionAttributes {
  id: number
  location: string
  address: string
  deviceName: string
  platform: string
  deviceId: string
  userId: string
  orgId: number
  isActive: boolean
  isDelete: boolean
  lastActiveTime: Date
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserSessionAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    address: { type: Sequelize.TEXT, allowNull: false },
    deviceName: { type: Sequelize.TEXT, allowNull: true },
    lastActiveTime: { type: Sequelize.DATE, allowNull: true },
    platform: { type: Sequelize.STRING, allowNull: false },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    location: {
      type: Sequelize.GEOMETRY,
      allowNull: true
    },
    deviceId: { type: Sequelize.STRING, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
  }
  const UserSession = sequelize.define('UserSession', attributes)

  // @ts-ignore
  UserSession.associate = function (models: DBModels) {
    UserSession.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })
  }
  return UserSession
}
