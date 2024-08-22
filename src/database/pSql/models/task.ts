
import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface TaskAttributes {
  id: string
  name: string
  description: string
  projectId: string
  workflowId: string
  startDate: Date
  endDate: Date
  taskTemplateId: number
  taskCompleteDurationInDay: number
  taskAcceptanceCriteria: string
  taskAddress: string
  taskPoint: string
  isActive: boolean
  isDelete: boolean
  orgId: number
  createdBy: string
  updatedBy: string
  status: 1 | 2
  priority: number
  sequence: number
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<TaskAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    workflowId: { type: Sequelize.TEXT, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: false },
    startDate: { type: Sequelize.DATE, allowNull: false },
    endDate: { type: Sequelize.DATE, allowNull: false },
    taskAcceptanceCriteria: { type: Sequelize.TEXT, allowNull: true },
    taskPoint: {
      type: Sequelize.GEOMETRY,
      allowNull: true
    },
    taskTemplateId: { type: Sequelize.INTEGER, allowNull: true },
    sequence: { type: Sequelize.INTEGER, allowNull: false },
    taskAddress: { type: Sequelize.TEXT, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    taskCompleteDurationInDay: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    status: { type: Sequelize.INTEGER, enum: [0, 1, 2, 3, 4, 5], allowNull: true, defaultValue: 1 },
    priority: { type: Sequelize.INTEGER, allowNull: false }

  }
  const Tasks = sequelize.define('Tasks', attributes)
  // @ts-ignore
  Tasks.associate = function (models: DBModels) {
    Tasks.belongsTo(models.Users, { foreignKey: 'createdBy', as: 'createdByUser' })
    Tasks.belongsTo(models.Users, { foreignKey: 'updatedBy', as: 'updatedByUser' })
    Tasks.belongsTo(models.Projects, { foreignKey: 'projectId' })
    Tasks.belongsTo(models.Organizations, { foreignKey: 'orgId' })
    Tasks.belongsToMany(models.ProjectForms, { through: models.TaskForms, foreignKey: 'taskId', onDelete: 'CASCADE' })
    Tasks.belongsToMany(models.Users, { through: models.UserTasks, foreignKey: 'taskId', onDelete: 'CASCADE' })
    Tasks.hasMany(models.UserProjectForm, { foreignKey: 'taskId' })
  }

  return Tasks
}
