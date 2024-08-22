import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface ResourceSharingAttributes {
  id: number
  resource: string
  permission: string
  email: string
  isDelete: boolean
  projectId: string
  userId: string
  projectFormId: number
  groupId: number
  userFromId: number
  createdBy: string
  updatedBy: string
  orgId: number
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ResourceSharingAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    resource: { type: Sequelize.STRING, allowNull: false, enum: ['project', 'user', 'group', 'project-form', 'form-data'] },
    permission: { type: Sequelize.STRING, allowNull: false, enum: ['all', 'view', 'edit', 'delete', 'create'] },
    email: { type: Sequelize.STRING, allowNull: false },
    projectId: { type: Sequelize.UUID, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: true },
    projectFormId: { type: Sequelize.INTEGER, allowNull: true },
    groupId: { type: Sequelize.INTEGER, allowNull: true },
    userFromId: { type: Sequelize.INTEGER, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: Sequelize.UUID, allowNull: true }

  }
  const ResourceSharing = sequelize.define('ResourceSharing', attributes)

  // @ts-ignore
  ResourceSharing.associate = function (models: DBModels) {
    ResourceSharing.belongsTo(models.UserProjectForm, { foreignKey: 'userFromId', as: 'fromData' })
  }
  return ResourceSharing
}
