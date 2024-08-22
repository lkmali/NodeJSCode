import * as Sequelize from 'sequelize'

interface ProjectGroupAttributes {
  id: number
  projectId: string
  groupId: number
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ProjectGroupAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    projectId: { type: Sequelize.UUID, allowNull: false },
    groupId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const ProjectGroups = sequelize.define('ProjectGroups', attributes)

  return ProjectGroups
}
