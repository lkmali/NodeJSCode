import * as Sequelize from 'sequelize'

interface ProjectFormGroupsAttributes {
  id: number
  projectFormId: string
  groupId: number
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ProjectFormGroupsAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    projectFormId: { type: Sequelize.INTEGER, allowNull: false },
    groupId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const ProjectFormGroups = sequelize.define('ProjectFormGroups', attributes)

  return ProjectFormGroups
}
