import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface UserEventAttributes {
  id: number
  location: string
  address: string
  deviceName: string
  platform: string
  deviceId: string
  recourseName: string
  recourseId: string
  eventName: string
  comment: string
  userId: string
  orgId: number
  isActive: boolean
  isDelete: boolean
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserEventAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    address: { type: Sequelize.TEXT, allowNull: false },
    deviceName: { type: Sequelize.TEXT, allowNull: true },
    comment: { type: Sequelize.TEXT, allowNull: true },
    platform: { type: Sequelize.STRING, allowNull: false },
    recourseName: { type: Sequelize.STRING, allowNull: false },
    recourseId: { type: Sequelize.TEXT, allowNull: false },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    eventName: { type: Sequelize.STRING, allowNull: false },
    location: {
      type: Sequelize.GEOMETRY,
      allowNull: true
    },
    deviceId: { type: Sequelize.STRING, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
  }
  const UserEvents = sequelize.define('UserEvents', attributes)

  // @ts-ignore
  UserEvents.associate = function (models: DBModels) {
    UserEvents.belongsTo(models.Users, { foreignKey: 'userId' })
  }
  return UserEvents
}
