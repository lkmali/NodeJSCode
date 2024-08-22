import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface TaskFormsAttributes {
  id: number
  projectFormId: string
  taskId: number
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<TaskFormsAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    projectFormId: { type: Sequelize.INTEGER, allowNull: false },
    taskId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const TaskForms = sequelize.define('TaskForms', attributes)
  // @ts-ignore
  TaskForms.associate = function (models: DBModels) {
    // UserRoles.belongsTo(models.Users, { foreignKey: 'userId' })
    TaskForms.belongsTo(models.Tasks, { foreignKey: 'taskId' })
    TaskForms.belongsTo(models.ProjectForms, { foreignKey: 'projectFormId' })
  }

  return TaskForms
}
