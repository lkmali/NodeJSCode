import * as Sequelize from 'sequelize'

interface TemplateFormFiledAttributes {
  id: number
  title: string
  defaultValue?: string
  validatePattern?: string
  staticValue?: string
  maxLength?: number
  minLength?: number
  maxValue?: number
  minValue?: number
  required?: boolean
  visible?: boolean
  fieldType: string
  valueType: string
  source: string
  childRequire: boolean
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<TemplateFormFiledAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: Sequelize.STRING, allowNull: false, unique: true },
    defaultValue: { type: Sequelize.STRING, allowNull: true },
    validatePattern: { type: Sequelize.STRING, allowNull: true },
    staticValue: { type: Sequelize.STRING, allowNull: true },
    maxValue: { type: Sequelize.INTEGER, allowNull: true },
    minValue: { type: Sequelize.INTEGER, allowNull: true },
    maxLength: { type: Sequelize.INTEGER, allowNull: true },
    minLength: { type: Sequelize.INTEGER, allowNull: true },
    required: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    visible: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    fieldType: { type: Sequelize.STRING, allowNull: false },
    valueType: { type: Sequelize.STRING, allowNull: false },
    source: { type: Sequelize.STRING, allowNull: false, defaultValue: 'user' },
    childRequire: { type: Sequelize.BOOLEAN, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const TemplateFormFields = sequelize.define('TemplateFormFields', attributes)

  // @ts-ignore
  TemplateFormFields.associate = function (models: any) {
    TemplateFormFields.hasMany(models.TemplateFormFields, { foreignKey: 'parentId' })
  }

  return TemplateFormFields
}
