
import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface UserFormFieldDataAttributes {
  id: number
  value: string
  valueType: string
  isActive: boolean
  isDelete: boolean
  userId: string
  projectFormId: number
  valueName: string
  counter: number
  projectFormFieldId: string
  sequence: string
  point: string
  createdBy: string
  updatedBy: string
  userFromId: number
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserFormFieldDataAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: Sequelize.TEXT, allowNull: false },
    valueType: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'string'
    },
    valueName: { type: Sequelize.STRING, allowNull: false },
    userId: { type: Sequelize.UUID, allowNull: false },
    projectFormFieldId: { type: Sequelize.INTEGER, allowNull: false },
    counter: { type: Sequelize.INTEGER, allowNull: true },
    projectFormId: { type: Sequelize.INTEGER, allowNull: false },
    userFromId: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true },
    point: {
      type: Sequelize.GEOMETRY,
      allowNull: true
    },
    sequence: { type: Sequelize.TEXT, allowNull: false, defaultValue: '1' },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

  }
  const UserFormFieldData = sequelize.define('UserFormFieldData', attributes)

  // @ts-ignore
  UserFormFieldData.associate = function (models: DBModels) {
    UserFormFieldData.belongsTo(models.Users, { foreignKey: 'userId' })
    UserFormFieldData.belongsTo(models.ProjectForms, { foreignKey: 'projectFormId' })
    UserFormFieldData.belongsTo(models.UserProjectForm, { foreignKey: 'userFromId' })
    UserFormFieldData.belongsTo(models.ProjectForms, { foreignKey: 'projectFormFieldId' })
  }

  return UserFormFieldData
}
