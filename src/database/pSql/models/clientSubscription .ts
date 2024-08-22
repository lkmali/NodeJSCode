import * as Sequelize from 'sequelize'
import { DBModels } from '../../../typings'
interface ClientSubscriptionAttributes {
  id: number
    createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ClientSubscriptionAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const ClientSubscriptions = sequelize.define('ClientSubscriptions', attributes)
  // @ts-ignore
  ClientSubscriptions.associate = function (models: DBModels) {
    ClientSubscriptions.belongsTo(models.Clients, { foreignKey: 'clientId' })
    ClientSubscriptions.belongsTo(models.Subscriptions, { foreignKey: 'subscriptionId' })
  }

  return ClientSubscriptions
}
