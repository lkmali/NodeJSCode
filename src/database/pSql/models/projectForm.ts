import * as Sequelize from 'sequelize'

interface ProjectFormAttributes {
  id: number
  name: string
  orgId: number
  isActive: boolean
  isPublish: boolean
  isDelete: boolean
  description: string
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ProjectFormAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    orgId: { type: Sequelize.INTEGER, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isPublish: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }
  }
  const ProjectForms = sequelize.define('ProjectForms', attributes)

  // @ts-ignore
  ProjectForms.associate = function (models: any) {
    ProjectForms.belongsTo(models.Organizations, { foreignKey: 'orgId' })
    ProjectForms.belongsTo(models.Users, { foreignKey: 'createdBy', as: 'createdByUser' })
    ProjectForms.belongsTo(models.Users, { foreignKey: 'updatedBy', as: 'updatedByUser' })
    ProjectForms.hasMany(models.UserFormFieldData, { foreignKey: 'projectFormId' })
    ProjectForms.hasMany(models.ProjectFormFields, { foreignKey: 'projectFormId', as: 'fields' })
    ProjectForms.hasMany(models.UserProjectForm, { foreignKey: 'projectFormId' })
    ProjectForms.hasMany(models.TaskTemplate, { foreignKey: 'projectFormId' })
    ProjectForms.belongsToMany(models.Tasks, { through: models.TaskForms, foreignKey: 'projectFormId' })
  }

  return ProjectForms
}
