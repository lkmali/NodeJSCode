import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface AddressAttributes {
  id: number
  address: string
  city: string
  state: string
  country: string
  pinCode: string
  lat: string
  userId: string
  orgId: number
  long: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<AddressAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    address: { type: Sequelize.TEXT, allowNull: false },
    city: { type: Sequelize.STRING, allowNull: false },
    state: { type: Sequelize.STRING, allowNull: true },
    country: { type: Sequelize.STRING, allowNull: false },
    pinCode: { type: Sequelize.STRING, allowNull: false },
    lat: { type: Sequelize.STRING, allowNull: true },
    long: { type: Sequelize.STRING, allowNull: true },
    userId: { type: Sequelize.UUID, allowNull: true },
    orgId: { type: Sequelize.INTEGER, allowNull: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  // const Addresses = sequelize.define<AddressInstance, AddressAttributes>('Addresses', attributes)
  const Addresses = sequelize.define('Addresses', attributes)
  // @ts-ignore
  Addresses.associate = function (models: DBModels) {
    Addresses.belongsTo(models.Users, { foreignKey: 'userId' })
    Addresses.belongsTo(models.Organizations, { foreignKey: 'orgId' })
  }

  return Addresses
}
