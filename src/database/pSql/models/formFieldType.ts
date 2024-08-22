import * as Sequelize from 'sequelize'

interface FormFieldTypeAttributes {
 id: number
  fieldText: string
  fieldName: string
  fabIcon: string
  childRequire: boolean
  isParent: boolean
  repeatCountRequire: boolean
  createdBy: string
  maxValue: boolean
  defaultValue: boolean
  counter: boolean
  minValue: boolean
  updatedBy: string
   isActive: boolean
  isDelete: boolean
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<FormFieldTypeAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    fieldName: { type: Sequelize.STRING, allowNull: false, unique: true },
    fieldText: { type: Sequelize.STRING, allowNull: false },
    fabIcon: { type: Sequelize.STRING, allowNull: false },
    childRequire: { type: Sequelize.BOOLEAN, allowNull: false },
    isParent: { type: Sequelize.BOOLEAN, allowNull: false },
    repeatCountRequire: { type: Sequelize.BOOLEAN, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    maxValue: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    defaultValue: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    minValue: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    counter: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

  }
  const FormFieldTypes = sequelize.define('FormFieldTypes', attributes)

  return FormFieldTypes
}
