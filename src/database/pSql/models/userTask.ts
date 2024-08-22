import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'

interface UserTaskAttributes {
  id: number
  userId: string
  taskId: number
  createdBy: string
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  updatedBy: string
  action: 'view' | 'create'
}

// 1->draft
//  2-submitted
// 3-verified
// 4-rejected
// 5- pending
// 6 ParleyRejected
// 7 completed

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserTaskAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    taskId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    action: { type: Sequelize.STRING, allowNull: false },
    status: { type: Sequelize.INTEGER, enum: [0, 1, 2, 4, 6, 7, 5], allowNull: false, defaultValue: 5 }

  }
  const UserTasks = sequelize.define('UserTasks', attributes)
  // @ts-ignore
  UserTasks.associate = function (models: DBModels) {
    // UserRoles.belongsTo(models.Users, { foreignKey: 'userId' })
    UserTasks.belongsTo(models.Tasks, { foreignKey: 'taskId' })
    UserTasks.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })
  }

  return UserTasks
}
