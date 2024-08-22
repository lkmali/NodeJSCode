import * as Sequelize from 'sequelize'
interface UserProjectsAttributes {
  id: number
  createdBy: string
  updatedBy: string
  userId: string
  projectId: number
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserProjectsAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: false }
  }
  const UserGroups = sequelize.define('UserProjects', attributes)

  return UserGroups
}
