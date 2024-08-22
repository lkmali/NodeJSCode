import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'

interface UserProjectFormAttributes {
  id: number
  status: 1 | 2 | 3 | 4 | 5
  isActive: boolean
  isDelete: boolean
  userId: string
  title: string
  projectFormId: number
  projectId: string
  taskId: number
  createdBy: string
  updatedBy: string
  orgId: number
  commentByAdmin: string
  description: string
}

// 1->draft
//  2-submitted
// 3-verified
// 4-rejected
// 5- pending

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserProjectFormAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: Sequelize.INTEGER, enum: [1, 2, 3, 4, 5], allowNull: false, defaultValue: 1 },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    projectFormId: { type: Sequelize.INTEGER, allowNull: false },
    taskId: { type: Sequelize.INTEGER, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    title: { type: Sequelize.STRING, allowNull: true },
    commentByAdmin: { type: Sequelize.TEXT, allowNull: true },
    description: { type: Sequelize.TEXT, allowNull: true },
    orgId: { type: Sequelize.INTEGER, allowNull: false }

  }
  const UserProjectForm = sequelize.define('UserProjectForm', attributes)
  // @ts-ignore
  UserProjectForm.associate = function (models: DBModels) {
    UserProjectForm.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' })
    UserProjectForm.belongsTo(models.ProjectForms, { foreignKey: 'projectFormId' })
    UserProjectForm.belongsTo(models.Projects, { foreignKey: 'projectId' })
    UserProjectForm.belongsTo(models.Tasks, { foreignKey: 'taskId' })
    UserProjectForm.hasMany(models.UserFormFieldData, { foreignKey: 'userFromId', as: 'fieldsValue' })
  }

  return UserProjectForm
}
