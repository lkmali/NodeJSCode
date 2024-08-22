
import * as Sequelize from 'sequelize'
interface TaskTemplateAttributes {
  id: string
  name: string
  description: string
  taskAcceptanceCriteria: string
  isActive: boolean
  isDelete: boolean
  orgId: number
  createdBy: string
  updatedBy: string
  projectFormId: number
  isPublish: boolean
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<TaskTemplateAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    projectFormId: { type: Sequelize.INTEGER, allowNull: false },
    taskAcceptanceCriteria: { type: Sequelize.TEXT, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    isPublish: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

  }
  const TaskTemplate = sequelize.define('TaskTemplate', attributes)

  // @ts-ignore
  TaskTemplate.associate = function (models: DBModels) {
    TaskTemplate.belongsTo(models.ProjectForms, { foreignKey: 'projectFormId' })
    TaskTemplate.belongsTo(models.Users, { foreignKey: 'createdBy', as: 'createdByUser' })
    TaskTemplate.belongsTo(models.Users, { foreignKey: 'updatedBy', as: 'updatedByUser' })
  }

  return TaskTemplate
}
