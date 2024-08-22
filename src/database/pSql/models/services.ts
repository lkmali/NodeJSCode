import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface ServicesAttributes {
  id: number
  name: string
    createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ServicesAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  // const Services = sequelize.define<UserInstance, UserAttributes>('Services', attributes)
  const Services = sequelize.define('Services', attributes)
  // @ts-ignore
  Services.associate = function (models: DBModels) {
    Services.belongsToMany(models.Organizations, { through: models.OrganizationServices, foreignKey: 'serviceId' })
  }

  return Services
}
