
import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface UserAttributes {
  userId: string
  username: string
  phone: string
  email: string
  isActive?: boolean
  isBlocked?: boolean
  isVerified?: boolean
  profileImageKey: string
  LastLoginDate?: string
  createdAt?: string
  updatedAt?: string
  createdBy: string
  updatedBy: string
  isDelete: boolean
  isProfileSet: boolean
  lastLoginTime: Date
  lastActiveTime: Date

}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserAttributes> = {
    userId: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    username: { type: Sequelize.STRING, allowNull: false },
    phone: { type: Sequelize.STRING, allowNull: false, unique: true },
    email: { type: Sequelize.STRING, allowNull: true },
    profileImageKey: { type: Sequelize.TEXT, allowNull: true },
    isVerified: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    isBlocked: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    LastLoginDate: { type: Sequelize.DATE, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isProfileSet: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    lastLoginTime: { type: Sequelize.DATE, allowNull: true },
    lastActiveTime: { type: Sequelize.DATE, allowNull: true }
  }
  // const Organizations = sequelize.define<UserInstance, UserAttributes>('Organizations', attributes)
  // @ts-ignore
  const Users = sequelize.define('Users', attributes)

  // @ts-ignore
  Users.associate = function (models: DBModels) {
    Users.belongsTo(models.Users, { foreignKey: 'createdBy', as: 'createdByUser' })
    Users.belongsTo(models.Users, { foreignKey: 'updatedBy', as: 'updatedByUser' })
    Users.belongsTo(models.Organizations, { foreignKey: 'orgId' })
    Users.belongsToMany(models.Roles, { through: models.UserRoles, foreignKey: 'userId' })
    Users.belongsToMany(models.Groups, { through: models.UserGroups, foreignKey: 'userId' })

    Users.belongsToMany(models.Tasks, { through: models.UserTasks, foreignKey: 'userId' })
    Users.hasOne(models.Password, { foreignKey: 'userId' })
    Users.hasOne(models.Addresses, { foreignKey: 'userId' })
    Users.hasMany(models.Projects, { foreignKey: 'projectOwnerId' })
  }
  return Users
}
