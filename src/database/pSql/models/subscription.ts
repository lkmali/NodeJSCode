import * as Sequelize from 'sequelize'
interface SubscriptionAttributes {
  id: string
  name: string
  type: string
  tenure: string
  amount: number
  createdAt?: string
  updatedAt?: string
    createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<SubscriptionAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    type: { type: Sequelize.STRING, allowNull: false },
    tenure: { type: Sequelize.STRING, allowNull: false, unique: true },
    amount: { type: Sequelize.INTEGER, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }
  }
  const Subscriptions = sequelize.define('Subscriptions', attributes)

  return Subscriptions
}
