import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface ProjectAttributes {
  id: string
  name: string
  description: string
  isActive: boolean
  isDelete: boolean
  projectOwnerId: string
  orgId: number
  createdBy: string
  updatedBy: string
  startDate: Date
  endDate: Date
  priority: number
  status: 1 | 2
}

// 1->running
//  2-completed

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ProjectAttributes> = {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    projectOwnerId: { type: Sequelize.UUID, allowNull: false },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    startDate: { type: Sequelize.DATE, allowNull: false },
    endDate: { type: Sequelize.DATE, allowNull: false },
    priority: { type: Sequelize.INTEGER, allowNull: false },
    status: { type: Sequelize.INTEGER, enum: [1, 2, 3, 4, 5], allowNull: false, defaultValue: 1 }

  }
  const Projects = sequelize.define('Projects', attributes)
  // @ts-ignore
  Projects.associate = function (models: DBModels) {
    Projects.belongsTo(models.Users, { foreignKey: 'projectOwnerId', as: 'projectOwner' })
    Projects.belongsTo(models.Users, { foreignKey: 'createdBy', as: 'createdByUser' })
    Projects.belongsTo(models.Users, { foreignKey: 'updatedBy', as: 'updatedByUser' })
    Projects.belongsTo(models.Organizations, { foreignKey: 'orgId' })
    Projects.hasMany(models.Tasks, { foreignKey: 'projectId' })
  }
  return Projects
}
