import * as Sequelize from 'sequelize'

interface FormTemplateAttributes {
  id: number
  name: string
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<FormTemplateAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const FormTemplates = sequelize.define('FormTemplates', attributes)

  // @ts-ignore
  FormTemplates.associate = function (models: any) {
    FormTemplates.belongsTo(models.Organizations, { foreignKey: 'orgId' })
    FormTemplates.hasMany(models.TemplateFormFields, { foreignKey: 'templateId' })
  }

  return FormTemplates
}
