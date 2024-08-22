import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface OrganizationAttributes {
id: number
orgName: string
description: string
registrationNumber: string
clientId: number
isActive: boolean
isDelete: boolean
createdBy: string
updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<OrganizationAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    orgName: { type: Sequelize.STRING, allowNull: false },
    registrationNumber: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING, allowNull: true },
    clientId: { type: Sequelize.INTEGER, allowNull: false },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  // const Organizations = sequelize.define<UserInstance, UserAttributes>('Organizations', attributes)
  // @ts-ignore
  const Organizations = sequelize.define('Organizations', attributes)

  // @ts-ignore
  Organizations.associate = function (models: DBModels) {
    // Organizations.belongsTo(models.Users, { foreignKey: 'pointOfContactPerson' })
    Organizations.hasOne(models.Addresses, { foreignKey: 'orgId' })
    // Organizations.hasOne(models.Clients, { foreignKey: 'clientId' })

    Organizations.belongsTo(models.Clients, { foreignKey: 'clientId' })

    // Organizations.belongsToMany(models.Services, { through: models.Organizations, foreignKey: 'orgId' })
  }

  return Organizations
}
