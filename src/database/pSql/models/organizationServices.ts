import * as Sequelize from 'sequelize'

interface OrganizationServicesAttributes {
 id: number
 createdBy: string
 updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<OrganizationServicesAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  // const Organizations = sequelize.define<UserInstance, UserAttributes>('Organizations', attributes)
  const OrganizationServices = sequelize.define('OrganizationServices', attributes)

  return OrganizationServices
}
