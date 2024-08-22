import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface ProjectFormFiledAttributes {
  id: number
  title: string
  defaultValue?: string
  validatePattern?: string
  staticValue?: string
  maxLength?: number
  minLength?: number
  sequence: string
  maxValue?: number
  repeatCount?: number
  minValue?: number
  required?: boolean
  visible?: boolean
  fieldType: string
  childRequire: boolean
  counter: number
  projectFormId: number
  createdBy: string
  updatedBy: string
  isActive: boolean
  isDelete: boolean
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ProjectFormFiledAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: Sequelize.TEXT, allowNull: false },
    defaultValue: { type: Sequelize.STRING, allowNull: true },
    validatePattern: { type: Sequelize.STRING, allowNull: true },
    staticValue: { type: Sequelize.STRING, allowNull: true },
    maxValue: { type: Sequelize.INTEGER, allowNull: true },
    minValue: { type: Sequelize.INTEGER, allowNull: true },
    repeatCount: { type: Sequelize.INTEGER, allowNull: true },
    counter: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 1 },
    maxLength: { type: Sequelize.INTEGER, allowNull: true },
    minLength: { type: Sequelize.INTEGER, allowNull: true },
    sequence: { type: Sequelize.TEXT, allowNull: false },
    required: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    visible: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    fieldType: { type: Sequelize.STRING, allowNull: false },
    childRequire: { type: Sequelize.BOOLEAN, allowNull: true },
    projectFormId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

  }
  const ProjectFormFields = sequelize.define('ProjectFormFields', attributes)

  // @ts-ignore
  ProjectFormFields.associate = function (models: DBModels) {
    ProjectFormFields.hasMany(models.ProjectFormFields, { foreignKey: 'parentId', as: 'children' })
    ProjectFormFields.belongsTo(models.ProjectFormFields, { foreignKey: 'parentId', as: 'parent' })
    ProjectFormFields.hasMany(models.UserFormFieldData, { foreignKey: 'projectFormFieldId', as: 'fieldValue' })
    // Organizations.hasOne(models.Clients, { foreignKey: 'clientId' })
  }

  return ProjectFormFields
}
